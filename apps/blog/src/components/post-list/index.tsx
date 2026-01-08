import { TableHeader } from '../ui/table-header';
import { PostListItem } from './post-list-item';

export const PostList = () => {
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

      <PostListItem />
      <PostListItem />
    </div>
  );
};
