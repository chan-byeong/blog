import { NextResponse, type NextRequest } from 'next/server';
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
): Promise<NextResponse<AdminPostsResponse | { success: false; error: string }>> {
  try {
    requireAdminRequest(request);
  } catch (error) {
    return createAdminAuthErrorResponse(error);
  }

  try {
    const posts = await getAllAdminPosts();

    return NextResponse.json<AdminPostsResponse>({
      success: true,
      posts: posts.map(toAdminPostSummary),
    });
  } catch (error) {
    if (error instanceof GitHubContentError) {
      return createAdminErrorResponse(
        'Failed to fetch GitHub content',
        error.status === undefined ? 500 : 502
      );
    }

    return createAdminErrorResponse('Failed to fetch posts', 500);
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
