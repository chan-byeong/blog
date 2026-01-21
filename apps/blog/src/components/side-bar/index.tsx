'use client';

import { useShallow } from 'zustand/react/shallow';
import { usePostStore } from '@/providers/post-provider';
import { FilterGroup } from './filter-group';
import { Header } from './header';

export const SideBar = () => {
  const { postCount, postCountByTags, selectedTags } = usePostStore(
    useShallow((store) => ({
      postCount: store.postCount,
      postCountByTags: store.postCountByTags,
      selectedTags: store.selectedTags,
    }))
  );
  return (
    <div className='bg-background/80 sticky col-span-full row-span-2 row-start-1 grid grid-cols-subgrid grid-rows-subgrid gap-y-8 backdrop-blur-md sm:top-20 sm:gap-y-14 md:col-span-5'>
      <Header title='Blog' totalPosts={postCount} />
      <FilterGroup
        filterItems={postCountByTags}
        defaultSelectedTags={selectedTags}
      />
    </div>
  );
};
