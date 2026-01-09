import { TableHeader } from '../ui/table-header';
import { PostList } from './post-list';

export const PostsSection = () => {
  return (
    <div className='grid grid-cols-subgrid col-start-6 col-span-full row-start-2'>
      <TableHeader className='col-span-full'>
        <span className='col-start-1 col-span-3 text-primary text-sm font-semibold uppercase'>
          / Date
        </span>
        <span className='col-start-4 col-span-13 text-primary text-sm font-semibold uppercase'>
          / Title
        </span>
        <span className='col-start-17 col-span-3 text-primary text-sm font-semibold uppercase'>
          / Tags
        </span>
      </TableHeader>
      <PostList />
    </div>
  );
};
