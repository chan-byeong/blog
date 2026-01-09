import { SideBar } from '@/components/side-bar';
import { PostsSection } from '@/components/posts-section';
import { getAllPosts } from '@/lib/posts';

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className='grid grid-cols-subgrid col-span-full'>
      <section className='grid grid-cols-subgrid self-start col-span-full pt-20 gap-y-14 items-start'>
        <SideBar />
        <PostsSection />
      </section>
    </div>
  );
}
