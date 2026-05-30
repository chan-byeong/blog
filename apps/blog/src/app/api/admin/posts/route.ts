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
import { GitHubContentError } from '@/lib/github-content-error';
import { getAllAdminPosts } from '@/lib/posts';
import type { Post } from '@/types/post';

interface AdminPostSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  tags?: string[];
  author?: string;
  image?: string;
  coverImage?: string;
  published: boolean;
}

interface AdminPostsResponse {
  success: true;
  posts: AdminPostSummary[];
}

export async function GET(
  request: NextRequest
): Promise<
  NextResponse<AdminPostsResponse | { success: false; error: string }>
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

  try {
    const posts = await getAllAdminPosts();

    return withApplicationRequestId(
      NextResponse.json<AdminPostsResponse>({
        success: true,
        posts: posts.map(toAdminPostSummary),
      }),
      context
    );
  } catch (error) {
    if (error instanceof GitHubContentError) {
      return logApplicationResponse(
        createAdminErrorResponse(
          'Failed to fetch GitHub content',
          error.status === undefined ? 500 : 502
        ),
        context,
        {
          level: 'error',
          kind: 'app_error',
          message: 'Admin posts GitHub content request failed.',
          context: 'admin_posts',
          error_code: 'github_content_request_failed',
          ...(error.status === undefined
            ? {}
            : { meta: { upstream_status: error.status } }),
        }
      );
    }

    return logApplicationResponse(
      createAdminErrorResponse('Failed to fetch posts', 500),
      context,
      {
        level: 'error',
        kind: 'app_error',
        message: 'Admin posts request failed unexpectedly.',
        context: 'admin_posts',
        error_code: 'unexpected_admin_posts_error',
        error,
      }
    );
  }
}

function toAdminPostSummary(post: Post): AdminPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    ...(post.updatedAt !== undefined ? { updatedAt: post.updatedAt } : {}),
    ...(post.tags !== undefined ? { tags: post.tags } : {}),
    ...(post.author !== undefined ? { author: post.author } : {}),
    ...(post.image !== undefined ? { image: post.image } : {}),
    ...(post.coverImage !== undefined ? { coverImage: post.coverImage } : {}),
    published: post.published !== false,
  };
}
