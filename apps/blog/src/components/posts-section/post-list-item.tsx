'use client';

import Link from 'next/link';
import { Post } from '@/types/post';
import { trackClickPost } from '@/lib/analytics';

interface PostListItemProps {
  post: Post;
}

import { Tag } from '../ui/tag';

export const PostListItem = ({ post }: PostListItemProps) => {
  const handleClick = () => {
    trackClickPost(post.slug, post.title);
  };

  return (
    <li className='border-border/50 col-span-full grid grid-cols-subgrid items-center border-b-[0.5px]'>
      <Link
        href={`/posts/${post.slug}`}
        className='hover:bg-accent col-span-full grid grid-cols-subgrid items-center self-start px-1 py-2.5'
        onClick={handleClick}
      >
        <span className='text-primary col-span-2 col-start-1 text-xs font-semibold sm:col-span-3'>
          {post.date}
        </span>
        <span className='text-md text-primary col-span-4 col-start-3 font-bold sm:col-span-10 sm:col-start-4 md:col-span-13'>
          {post.title}
        </span>
        <span className='text-primary col-span-2 col-start-7 truncate text-sm font-semibold sm:col-span-3 sm:col-start-14 md:col-span-3 md:col-start-17'>
          {post.tags?.map((tag) => (
            <Tag key={tag} label={`# ${tag}`} />
          ))}
        </span>
      </Link>
    </li>
  );
};
