'use client';

import { useShallow } from 'zustand/react/shallow';
import { usePostStore } from '@/providers/post-provider';
import { FilterGroup } from './filter-group';
import { Header } from './header';

export const SideBar = () => {
  const { postCount, postCountByTags } = usePostStore(
    useShallow((store) => ({
      postCount: store.postCount,
      postCountByTags: store.postCountByTags,
    }))
  );
  return (
    <div
      className='
    sticky sm:top-20 grid grid-rows-subgrid row-start-1 row-span-2 grid-cols-subgrid col-span-full md:col-span-5 gap-y-8 sm:gap-y-14 
    bg-background/80 backdrop-blur-md
    '
    >
      <Header title='Blog' totalPosts={postCount} />
      <FilterGroup filterItems={postCountByTags} />
    </div>
  );
};
