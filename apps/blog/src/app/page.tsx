import { connection } from 'next/server';
import { getAllPosts } from '@/lib/posts';
import { PostsFilterContainer } from '@/components/posts-section/posts-filter-container';

export default async function Home() {
  await connection();
  const posts = await getAllPosts();

  return (
    <div className='col-span-full grid min-h-[calc(100dvh-41px)] grid-cols-subgrid'>
      <PostsFilterContainer posts={posts} />
    </div>
  );
}
