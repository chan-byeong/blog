import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
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
  const deliveryId = request.headers.get(GITHUB_DELIVERY_HEADER);
  const contentLength = Number(request.headers.get('content-length') || '0');

  if (contentLength > MAX_WEBHOOK_BODY_SIZE) {
    writeWebhookLog('warn', 'GitHub content webhook body rejected.', {
      deliveryId,
      error: 'body_too_large',
      contentLength,
      maxBodySize: MAX_WEBHOOK_BODY_SIZE,
    });

    return NextResponse.json<WebhookResponse>(
      { success: false, deliveryId, error: 'body_too_large' },
      { status: 413 }
    );
  }

  const rawBody = await request.text();

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_WEBHOOK_BODY_SIZE) {
    writeWebhookLog('warn', 'GitHub content webhook body rejected.', {
      deliveryId,
      error: 'body_too_large',
      maxBodySize: MAX_WEBHOOK_BODY_SIZE,
    });

    return NextResponse.json<WebhookResponse>(
      { success: false, deliveryId, error: 'body_too_large' },
      { status: 413 }
    );
  }

  const signature = request.headers.get(GITHUB_SIGNATURE_HEADER);

  try {
    verifyGitHubWebhookSignature({ rawBody, signature });
  } catch (error) {
    if (error instanceof GitHubWebhookSignatureError) {
      writeWebhookLog('warn', 'GitHub content webhook signature rejected.', {
        deliveryId,
        error: error.code,
        status: error.status,
      });

      return NextResponse.json<WebhookResponse>(
        { success: false, deliveryId, error: error.code },
        { status: error.status }
      );
    }

    return NextResponse.json<WebhookResponse>(
      { success: false, deliveryId, error: 'signature_verification_failed' },
      { status: 500 }
    );
  }

  const event = request.headers.get(GITHUB_EVENT_HEADER);

  if (event !== 'push') {
    writeWebhookLog('info', 'GitHub content webhook event ignored.', {
      deliveryId,
      event,
    });

    return NextResponse.json<WebhookResponse>(
      { success: false, event, deliveryId, error: 'unsupported_event' },
      { status: 202 }
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    writeWebhookLog('warn', 'GitHub content webhook JSON parsing failed.', {
      deliveryId,
      event,
    });

    return NextResponse.json<WebhookResponse>(
      { success: false, event, deliveryId, error: 'invalid_json' },
      { status: 400 }
    );
  }

  const slugs = getChangedPostSlugs(payload);
  const tags = [POSTS_CACHE_TAG, ...slugs.map(getPostCacheTag)];
  const paths = ['/', ...slugs.map((slug) => `/posts/${slug}`)];

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  writeWebhookLog('info', 'GitHub content webhook revalidated cache.', {
    deliveryId,
    event,
    tags,
    paths,
    slugs,
  });

  return NextResponse.json<WebhookResponse>({
    success: true,
    event,
    deliveryId,
    revalidated: {
      tags,
      paths,
      slugs,
    },
  });
}

function writeWebhookLog(
  level: 'info' | 'warn',
  message: string,
  metadata: Record<string, unknown>
): void {
  process.stdout.write(
    `${JSON.stringify({
      level,
      message,
      source: 'github_content_webhook',
      ...metadata,
      timestamp: new Date().toISOString(),
    })}\n`
  );
}
