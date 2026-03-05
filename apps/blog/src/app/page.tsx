import { SideBar } from '@/components/side-bar';
import { PostsSection } from '@/components/posts-section';
import { getAllPosts } from '@/lib/posts';
import { PostStoreProvider } from '@/providers/post-provider';

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <PostStoreProvider initialState={posts}>
      <div className='col-span-full grid min-h-[calc(100dvh-41px)] grid-cols-subgrid'>
        <section className='col-span-full grid grid-cols-subgrid items-start gap-y-8 self-start pt-10 md:gap-y-14 md:pt-20'>
          <SideBar />
          <PostsSection />
        </section>
      </div>
    </PostStoreProvider>
  );
}
