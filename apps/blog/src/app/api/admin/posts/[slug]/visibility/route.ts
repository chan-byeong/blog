import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
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
  try {
    requireAdminRequest(request);
  } catch (error) {
    return createAdminAuthErrorResponse(error);
  }

  const { slug: rawSlug } = await params;
  const slug = decodePostSlug(rawSlug);

  if (!isSafePostSlug(slug)) {
    return createAdminErrorResponse('Invalid slug', 400);
  }

  if (isBodyTooLarge(request.headers.get('content-length'))) {
    return createAdminErrorResponse('Request body too large', 413);
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return createAdminErrorResponse('Invalid request body', 400);
  }

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_SIZE) {
    return createAdminErrorResponse('Request body too large', 413);
  }

  const payload = parseVisibilityPayload(rawBody);

  if (payload === null) {
    return createAdminErrorResponse('Invalid request body', 400);
  }

  try {
    const result = await updateGitHubPostVisibility(slug, payload.published);

    if (result === null) {
      return createAdminErrorResponse('Post not found', 404);
    }

    const post = parseAdminPostSource(slug, result.source);

    revalidatePostVisibility(slug);

    return NextResponse.json<VisibilitySuccessResponse>({
      success: true,
      post: toVisibilityPost(post),
      commitSha: result.commitSha,
    });
  } catch (error) {
    if (error instanceof GitHubContentError) {
      return createAdminErrorResponse(
        'Failed to update GitHub content',
        error.status === undefined ? 500 : 502
      );
    }

    return createAdminErrorResponse('Failed to update post visibility', 500);
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
