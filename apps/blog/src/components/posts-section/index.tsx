import { TableHeader } from '../ui/table-header';
import { PostList } from './post-list';

// TODO: 헤더 영역 CSS @apply 또는 tv, cva 적용하기
export const PostsSection = () => {
  return (
    <div className='grid grid-cols-subgrid md:col-start-6 col-span-full md:row-start-2'>
      <TableHeader className='col-span-full text-xs'>
        <span className='col-start-1 col-span-2 sm:col-span-3 text-primary font-semibold uppercase'>
          / Date
        </span>
        <span className='col-start-3 col-span-4 sm:col-start-4 sm:col-span-10 md:col-span-13 text-primary font-semibold uppercase'>
          / Title
        </span>
        <span className='col-start-7 col-span-2 sm:col-start-14 sm:col-span-3 md:col-start-17 md:col-span-3 text-primary font-semibold uppercase'>
          / Tags
        </span>
      </TableHeader>
      <PostList />
    </div>
  );
};
