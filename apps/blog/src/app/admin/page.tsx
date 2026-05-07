import { AdminPostList } from '@/components/admin/admin-post-list';
import { AdminPostsProvider } from '@/components/admin/admin-posts-provider';
import { AdminPostsSide } from '@/components/admin/admin-posts-side';
import { Header } from '@/components/side-bar/header';
import { getAllAdminPosts } from '@/lib/posts';
import type { AdminPostSummary } from '@/types/admin-post';
import type { Post } from '@/types/post';

export default async function AdminPage() {
  const posts = await getAllAdminPosts();
  const adminPosts = posts.map(toAdminPostSummary);

  return (
    <section className='col-span-full grid grid-cols-subgrid items-start gap-y-8 self-start pt-10 md:gap-y-14 md:pt-20'>
      <AdminPostsProvider initialPosts={adminPosts}>
        <aside className='sticky col-span-full row-span-2 row-start-1 grid grid-cols-subgrid grid-rows-subgrid gap-y-8 backdrop-blur-md sm:top-20 sm:gap-y-14 md:col-span-5'>
          <Header title='Admin' totalPosts={adminPosts.length} />
          <AdminPostsSide />
        </aside>
        <AdminPostList />
      </AdminPostsProvider>
    </section>
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
