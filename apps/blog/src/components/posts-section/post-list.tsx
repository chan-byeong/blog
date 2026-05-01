import { PostListItem } from './post-list-item';
import type { Post } from '@/types/post';

interface PostListProps {
  posts: Post[];
}

export const PostList = ({ posts }: PostListProps) => {
  return (
    <ul className='col-span-full grid grid-cols-subgrid'>
      {posts.map((post) => (
        <PostListItem key={post.slug} post={post} />
      ))}
    </ul>
  );
};
