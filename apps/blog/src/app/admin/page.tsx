import { connection } from 'next/server';
import { AdminPostsManager } from '@/components/admin/admin-posts-manager';
import { getAllAdminPosts } from '@/lib/posts';
import type { AdminPostSummary } from '@/types/admin-post';
import type { Post } from '@/types/post';

export default async function AdminPage() {
  await connection();
  const posts = await getAllAdminPosts();

  return (
    <div className='col-span-full grid min-h-[calc(100dvh-41px)] grid-cols-subgrid'>
      <AdminPostsManager posts={posts.map(toAdminPostSummary)} />
    </div>
  );
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
