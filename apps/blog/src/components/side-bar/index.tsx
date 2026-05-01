import { FilterGroup } from './filter-group';
import { Header } from './header';

interface SideBarProps {
  postCount: number;
  postCountByTags: Record<string, number>;
  selectedTags: string[];
  onTagChange: (tag: string, checked: boolean) => void;
}

export const SideBar = ({
  postCount,
  postCountByTags,
  selectedTags,
  onTagChange,
}: SideBarProps) => {
  return (
    <div className='sticky col-span-full row-span-2 row-start-1 grid grid-cols-subgrid grid-rows-subgrid gap-y-8 backdrop-blur-md sm:top-20 sm:gap-y-14 md:col-span-5'>
      <Header title='Blog' totalPosts={postCount} />
      <FilterGroup
        filterItems={postCountByTags}
        selectedTags={selectedTags}
        onTagChange={onTagChange}
      />
    </div>
  );
};
