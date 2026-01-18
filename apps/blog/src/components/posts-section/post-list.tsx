'use client';
import { usePostStore } from '@/providers/post-provider';
import { PostListItem } from './post-list-item';
import { useShallow } from 'zustand/react/shallow';

export const PostList = () => {
  const posts = usePostStore(useShallow((store) => store.getFilteredPosts()));
  return (
    <ul className='col-span-full grid grid-cols-subgrid'>
      {posts.map((post) => (
        <PostListItem key={post.slug} post={post} />
      ))}
    </ul>
  );
};
