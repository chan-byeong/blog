import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import {
  createApplicationRequestContext,
  logApplicationResponse,
  type ApplicationRequestContext,
} from '@/lib/application-logger';
import {
  GitHubWebhookSignatureError,
  verifyGitHubWebhookSignature,
} from '@/lib/github-webhook';
import { getChangedPostSlugs } from '@/lib/github-webhook-payload';
import { POSTS_CACHE_TAG, getPostCacheTag } from '@/lib/post-cache-tags';

const GITHUB_SIGNATURE_HEADER = 'x-hub-signature-256';
const GITHUB_EVENT_HEADER = 'x-github-event';
const GITHUB_DELIVERY_HEADER = 'x-github-delivery';
const MAX_WEBHOOK_BODY_SIZE = 1 * 1024 * 1024;

interface WebhookResponse {
  success: boolean;
  event?: string | null;
  deliveryId?: string | null;
  revalidated?: {
    tags: string[];
    paths: string[];
    slugs: string[];
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  const context = createApplicationRequestContext(request);
  const deliveryId = request.headers.get(GITHUB_DELIVERY_HEADER);
  const contentLength = Number(request.headers.get('content-length') || '0');

  if (contentLength > MAX_WEBHOOK_BODY_SIZE) {
    return logWebhookResponse(
      NextResponse.json<WebhookResponse>(
        { success: false, deliveryId, error: 'body_too_large' },
        { status: 413 }
      ),
      context,
      {
        level: 'warn',
        message: 'GitHub content webhook body rejected.',
        error_code: 'body_too_large',
        meta: {
          delivery_id: deliveryId,
          content_length: contentLength,
          max_body_size: MAX_WEBHOOK_BODY_SIZE,
        },
      }
    );
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch (error) {
    return logWebhookResponse(
      NextResponse.json<WebhookResponse>(
        { success: false, deliveryId, error: 'request_body_read_failed' },
        { status: 500 }
      ),
      context,
      {
        level: 'error',
        kind: 'app_error',
        message: 'GitHub content webhook body read failed.',
        error_code: 'request_body_read_failed',
        error,
        meta: {
          delivery_id: deliveryId,
        },
      }
    );
  }

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_WEBHOOK_BODY_SIZE) {
    return logWebhookResponse(
      NextResponse.json<WebhookResponse>(
        { success: false, deliveryId, error: 'body_too_large' },
        { status: 413 }
      ),
      context,
      {
        level: 'warn',
        message: 'GitHub content webhook body rejected.',
        error_code: 'body_too_large',
        meta: {
          delivery_id: deliveryId,
          max_body_size: MAX_WEBHOOK_BODY_SIZE,
        },
      }
    );
  }

  const signature = request.headers.get(GITHUB_SIGNATURE_HEADER);

  try {
    verifyGitHubWebhookSignature({ rawBody, signature });
  } catch (error) {
    if (error instanceof GitHubWebhookSignatureError) {
      return logWebhookResponse(
        NextResponse.json<WebhookResponse>(
          { success: false, deliveryId, error: error.code },
          { status: error.status }
        ),
        context,
        {
          level: error.status >= 500 ? 'error' : 'warn',
          kind: error.status >= 500 ? 'app_error' : 'app_event',
          message: 'GitHub content webhook signature rejected.',
          error_code: error.code,
          meta: {
            delivery_id: deliveryId,
          },
        }
      );
    }

    return logWebhookResponse(
      NextResponse.json<WebhookResponse>(
        { success: false, deliveryId, error: 'signature_verification_failed' },
        { status: 500 }
      ),
      context,
      {
        level: 'error',
        kind: 'app_error',
        message: 'GitHub content webhook signature verification failed.',
        error_code: 'signature_verification_failed',
        error,
        meta: {
          delivery_id: deliveryId,
        },
      }
    );
  }

  const event = request.headers.get(GITHUB_EVENT_HEADER);

  if (event !== 'push') {
    return logWebhookResponse(
      NextResponse.json<WebhookResponse>(
        { success: false, event, deliveryId, error: 'unsupported_event' },
        { status: 202 }
      ),
      context,
      {
        level: 'info',
        message: 'GitHub content webhook event ignored.',
        error_code: 'unsupported_event',
        meta: {
          delivery_id: deliveryId,
          event,
        },
      }
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return logWebhookResponse(
      NextResponse.json<WebhookResponse>(
        { success: false, event, deliveryId, error: 'invalid_json' },
        { status: 400 }
      ),
      context,
      {
        level: 'warn',
        message: 'GitHub content webhook JSON parsing failed.',
        error_code: 'invalid_json',
        meta: {
          delivery_id: deliveryId,
          event,
        },
      }
    );
  }

  try {
    const slugs = getChangedPostSlugs(payload);
    const tags = [POSTS_CACHE_TAG, ...slugs.map(getPostCacheTag)];
    const paths = ['/', ...slugs.map((slug) => `/posts/${slug}`)];

    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    return logWebhookResponse(
      NextResponse.json<WebhookResponse>({
        success: true,
        event,
        deliveryId,
        revalidated: {
          tags,
          paths,
          slugs,
        },
      }),
      context,
      {
        level: 'info',
        message: 'GitHub content webhook revalidated cache.',
        meta: {
          delivery_id: deliveryId,
          event,
          tags,
          paths,
          slugs,
        },
      }
    );
  } catch (error) {
    return logWebhookResponse(
      NextResponse.json<WebhookResponse>(
        {
          success: false,
          event,
          deliveryId,
          error: 'cache_revalidation_failed',
        },
        { status: 500 }
      ),
      context,
      {
        level: 'error',
        kind: 'app_error',
        message: 'GitHub content webhook cache revalidation failed.',
        error_code: 'cache_revalidation_failed',
        error,
        meta: {
          delivery_id: deliveryId,
          event,
        },
      }
    );
  }
}

function logWebhookResponse<T extends NextResponse>(
  response: T,
  context: ApplicationRequestContext,
  input: {
    level: 'info' | 'warn' | 'error';
    kind?: 'app_event' | 'app_error';
    message: string;
    error_code?: string;
    error?: unknown;
    meta?: Record<string, unknown>;
  }
): T {
  return logApplicationResponse(response, context, {
    ...input,
    kind: input.kind ?? 'app_event',
    context: 'github_content_webhook',
  });
}
