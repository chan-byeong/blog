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
    <div className='sticky top-20 grid grid-cols-subgrid grid-rows-subgrid col-span-5 row-span-2 gap-y-14 self-start'>
      <Header title='Blog' totalPosts={postCount} />
      <FilterGroup filterItems={postCountByTags} />
    </div>
  );
};
