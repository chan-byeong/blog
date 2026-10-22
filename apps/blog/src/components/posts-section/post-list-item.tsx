import Link from 'next/link';
import type { Post } from '@/types/post';
import { Tag } from '../ui/tag';

interface PostListItemProps {
  post: Post;
}

export const PostListItem = ({ post }: PostListItemProps) => {
  return (
    <li className='border-border-subtle text-foreground group hover:text-paper-ink isolate col-span-full grid grid-cols-subgrid items-center border-b-[0.5px]'>
      <Link
        href={`/posts/${post.slug}`}
        className='hover:bg-wash hover:paper-texture-overlay col-span-full grid grid-cols-subgrid items-center self-start px-1 py-2.5'
      >
        <span className='col-span-2 col-start-1 text-[13px] font-semibold sm:col-span-3'>
          {post.date}
        </span>
        <div className='col-span-4 col-start-3 flex flex-col gap-0.5 sm:col-span-10 sm:col-start-4 md:col-span-13'>
          <span className='text-md font-bold'>{post.title}</span>
          {post.description ? (
            <p className='text-foreground-secondary group-hover:text-paper-ink line-clamp-1 text-[14px]'>
              {post.description}
            </p>
          ) : null}
        </div>
        <span className='col-span-2 col-start-7 truncate text-sm font-semibold sm:col-span-3 sm:col-start-14 md:col-span-3 md:col-start-17'>
          {post.tags?.map((tag) => (
            <Tag
              key={tag}
              label={`# ${tag}`}
              className='group-hover:text-paper-ink'
            />
          ))}
        </span>
      </Link>
    </li>
  );
};
