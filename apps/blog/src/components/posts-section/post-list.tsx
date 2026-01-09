import { PostListItem } from './post-list-item';

export const PostList = () => {
  // store get posts
  return (
    <ul className='grid grid-cols-subgrid col-span-full'>
      <PostListItem />
    </ul>
  );
};
