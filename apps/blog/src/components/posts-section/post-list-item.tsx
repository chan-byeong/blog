'use client';

import Link from 'next/link';
import { Post } from '@/types/post';

interface PostListItemProps {
  post: Post;
}

import { Tag } from '../ui/tag';

export const PostListItem = ({ post }: PostListItemProps) => {
  return (
    <li className='grid grid-cols-subgrid col-span-full items-center border-b-[0.5px] border-border'>
      <Link
        href={`/posts/${post.slug}`}
        className='grid grid-cols-subgrid col-span-full items-center py-2.5 px-1 self-start hover:bg-accent'
      >
        <span className='col-start-1 col-span-3 text-sm font-semibold text-primary'>
          {post.date}
        </span>
        <span className='col-start-4 col-span-13 text-md font-bold text-primary'>
          {post.title}
        </span>
        <span className='col-start-17 col-span-3 text-sm font-semibold text-primary truncate'>
          {post.tags?.map((tag) => (
            <Tag key={tag} label={`# ${tag}`} />
          ))}
        </span>
      </Link>
    </li>
  );
};
