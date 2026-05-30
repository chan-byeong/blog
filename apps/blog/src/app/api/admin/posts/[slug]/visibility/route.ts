import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import {
  createApplicationRequestContext,
  logApplicationResponse,
  withApplicationRequestId,
} from '@/lib/application-logger';
import {
  createAdminAuthErrorResponse,
  createAdminErrorResponse,
  requireAdminRequest,
} from '@/lib/admin/api';
import { updateGitHubPostVisibility } from '@/lib/github-content';
import { GitHubContentError } from '@/lib/github-content-error';
import { POSTS_CACHE_TAG, getPostCacheTag } from '@/lib/post-cache-tags';
import { parseAdminPostSource } from '@/lib/posts';
import type { Post } from '@/types/post';

const MAX_BODY_SIZE = 4 * 1024;

interface VisibilityPayload {
  published: boolean;
}

interface VisibilitySuccessResponse {
  success: true;
  post: {
    slug: string;
    title: string;
    published: boolean;
  };
  commitSha: string;
}

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
): Promise<
  NextResponse<VisibilitySuccessResponse | { success: false; error: string }>
> {
  const context = createApplicationRequestContext(request);

  try {
    requireAdminRequest(request);
  } catch (error) {
    return withApplicationRequestId(
      createAdminAuthErrorResponse(error),
      context
    );
  }

  const { slug: rawSlug } = await params;
  const slug = decodePostSlug(rawSlug);

  if (!isSafePostSlug(slug)) {
    return logVisibilityError(
      createAdminErrorResponse('Invalid slug', 400),
      context,
      'invalid_slug'
    );
  }

  if (isBodyTooLarge(request.headers.get('content-length'))) {
    return logVisibilityError(
      createAdminErrorResponse('Request body too large', 413),
      context,
      'body_too_large',
      { slug, max_body_size: MAX_BODY_SIZE }
    );
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return logVisibilityError(
      createAdminErrorResponse('Invalid request body', 400),
      context,
      'invalid_request_body',
      { slug }
    );
  }

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_SIZE) {
    return logVisibilityError(
      createAdminErrorResponse('Request body too large', 413),
      context,
      'body_too_large',
      { slug, max_body_size: MAX_BODY_SIZE }
    );
  }

  const payload = parseVisibilityPayload(rawBody);

  if (payload === null) {
    return logVisibilityError(
      createAdminErrorResponse('Invalid request body', 400),
      context,
      'invalid_request_body',
      { slug }
    );
  }

  try {
    const result = await updateGitHubPostVisibility(slug, payload.published);

    if (result === null) {
      return logVisibilityError(
        createAdminErrorResponse('Post not found', 404),
        context,
        'post_not_found',
        { slug, published: payload.published }
      );
    }

    const post = parseAdminPostSource(slug, result.source);

    revalidatePostVisibility(slug);

    return logApplicationResponse(
      NextResponse.json<VisibilitySuccessResponse>({
        success: true,
        post: toVisibilityPost(post),
        commitSha: result.commitSha,
      }),
      context,
      {
        level: 'info',
        kind: 'app_event',
        message: 'Admin post visibility updated.',
        context: 'admin_post_visibility',
        meta: {
          slug,
          published: payload.published,
          commit_sha: result.commitSha,
          revalidated_tags: [POSTS_CACHE_TAG, getPostCacheTag(slug)],
          revalidated_paths: ['/', `/posts/${slug}`],
        },
      }
    );
  } catch (error) {
    if (error instanceof GitHubContentError) {
      return logApplicationResponse(
        createAdminErrorResponse(
          'Failed to update GitHub content',
          error.status === undefined ? 500 : 502
        ),
        context,
        {
          level: 'error',
          kind: 'app_error',
          message: 'Admin post visibility GitHub content request failed.',
          context: 'admin_post_visibility',
          error_code: 'github_content_request_failed',
          meta: {
            slug,
            published: payload.published,
            ...(error.status === undefined
              ? {}
              : { upstream_status: error.status }),
          },
        }
      );
    }

    return logApplicationResponse(
      createAdminErrorResponse('Failed to update post visibility', 500),
      context,
      {
        level: 'error',
        kind: 'app_error',
        message: 'Admin post visibility update failed unexpectedly.',
        context: 'admin_post_visibility',
        error_code: 'unexpected_visibility_update_error',
        error,
        meta: {
          slug,
          published: payload.published,
        },
      }
    );
  }
}

function parseVisibilityPayload(rawBody: string): VisibilityPayload | null {
  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return null;
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('published' in payload) ||
    typeof payload.published !== 'boolean'
  ) {
    return null;
  }

  return { published: payload.published };
}

function isBodyTooLarge(contentLengthHeader: string | null): boolean {
  if (contentLengthHeader === null) {
    return false;
  }

  const contentLength = Number(contentLengthHeader);

  return Number.isFinite(contentLength) && contentLength > MAX_BODY_SIZE;
}

function decodePostSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function isSafePostSlug(slug: string): boolean {
  return (
    slug.length > 0 &&
    slug.length <= 200 &&
    slug !== '.' &&
    slug !== '..' &&
    !slug.includes('/') &&
    !slug.includes('\\') &&
    !slug.includes('\0')
  );
}

function revalidatePostVisibility(slug: string): void {
  revalidateTag(POSTS_CACHE_TAG, { expire: 0 });
  revalidateTag(getPostCacheTag(slug), { expire: 0 });
  revalidatePath('/');
  revalidatePath(`/posts/${slug}`);
}

function toVisibilityPost(post: Post): VisibilitySuccessResponse['post'] {
  return {
    slug: post.slug,
    title: post.title,
    published: post.published !== false,
  };
}

function logVisibilityError(
  response: NextResponse<{ success: false; error: string }>,
  context: ReturnType<typeof createApplicationRequestContext>,
  errorCode: string,
  meta?: Record<string, unknown>
): NextResponse<{ success: false; error: string }> {
  return logApplicationResponse(response, context, {
    level: 'warn',
    kind: 'app_event',
    message: 'Admin post visibility request rejected.',
    context: 'admin_post_visibility',
    error_code: errorCode,
    ...(meta === undefined ? {} : { meta }),
  });
}
