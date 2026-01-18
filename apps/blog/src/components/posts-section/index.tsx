import { TableHeader } from '../ui/table-header';
import { PostList } from './post-list';

// TODO: 헤더 영역 CSS @apply 또는 tv, cva 적용하기
export const PostsSection = () => {
  return (
    <div className='col-span-full grid grid-cols-subgrid self-start md:col-start-6 md:row-span-2 md:row-start-2'>
      <TableHeader className='col-span-full text-xs'>
        <span className='text-primary col-span-2 col-start-1 font-semibold uppercase sm:col-span-3'>
          / Date
        </span>
        <span className='text-primary col-span-4 col-start-3 font-semibold uppercase sm:col-span-10 sm:col-start-4 md:col-span-13'>
          / Title
        </span>
        <span className='text-primary col-span-2 col-start-7 font-semibold uppercase sm:col-span-3 sm:col-start-14 md:col-span-3 md:col-start-17'>
          / Tags
        </span>
      </TableHeader>
      <PostList />
    </div>
  );
};
