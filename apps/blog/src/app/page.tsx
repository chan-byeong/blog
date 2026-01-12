import { SideBar } from '@/components/side-bar';
import { PostsSection } from '@/components/posts-section';
import { getAllPosts } from '@/lib/posts';
import { PostStoreProvider } from '@/providers/post-provider';

/**
 * Render the home page by loading all posts and supplying them to the post store provider.
 *
 * @returns The React element for the home page: a PostStoreProvider initialized with the fetched posts, containing the main grid layout that renders the SideBar and PostsSection components.
 */
export default async function Home() {
  const posts = await getAllPosts();

  return (
    <PostStoreProvider initialState={posts}>
      <div className='grid grid-cols-subgrid col-span-full min-h-[calc(100dvh-41px)]'>
        <section className='grid grid-cols-subgrid self-start col-span-full pt-20 gap-y-14 items-start'>
          <SideBar />
          <PostsSection />
        </section>
      </div>
    </PostStoreProvider>
  );
}