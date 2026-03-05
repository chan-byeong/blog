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
    <li className='border-border/50 text-primary group dark:hover:text-secondary isolate col-span-full grid grid-cols-subgrid items-center border-b-[0.5px]'>
      <Link
        href={`/posts/${post.slug}`}
        className='hover:bg-accent/50 hover:paper-texture-overlay col-span-full grid grid-cols-subgrid items-center self-start px-1 py-2.5'
        onClick={handleClick}
      >
        <span className='col-span-2 col-start-1 text-[13px] font-semibold sm:col-span-3'>
          {post.date}
        </span>
        <div className='col-span-4 col-start-3 flex flex-col gap-0.5 sm:col-span-10 sm:col-start-4 md:col-span-13'>
          <span className='text-md font-bold'>{post.title}</span>
          {post.description ? (
            <p className='dark:group-hover:text-secondary/80 text-primary/80 line-clamp-1 text-[14px]'>
              {post.description}
            </p>
          ) : null}
        </div>
        <span className='col-span-2 col-start-7 truncate text-sm font-semibold sm:col-span-3 sm:col-start-14 md:col-span-3 md:col-start-17'>
          {post.tags?.map((tag) => (
            <Tag
              key={tag}
              label={`# ${tag}`}
              className='dark:group-hover:text-secondary'
            />
          ))}
        </span>
      </Link>
    </li>
  );
};
