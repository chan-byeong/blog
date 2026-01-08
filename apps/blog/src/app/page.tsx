import { NavBar } from '@/components/ui/nav-bar';
import { SideBar } from '@/components/side-bar';
import { PostList } from '@/components/post-list';

export default async function Home() {
  return (
    <div className='grid items-start w-full max-w-7xl mx-auto min-h-dvh auto-rows-auto grid-flow-row px-6 gap-0 grid-cols-8 md:grid-cols-[repeat(24,1fr)] sm:grid-cols-[repeat(16,1fr)]'>
      <NavBar />
      <section className='grid grid-cols-subgrid self-start col-span-full pt-20 gap-y-14 items-start'>
        <SideBar />
        <PostList />
      </section>
    </div>
  );
}
