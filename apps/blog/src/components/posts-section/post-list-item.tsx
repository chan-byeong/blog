'use client';

import Link from 'next/link';

// interface PostListItemProps {
//   // post: Post;
// }

import { Tag } from '../ui/tag';

export const PostListItem = () => {
  return (
    <li className='grid grid-cols-subgrid col-span-full items-center border-b-[0.5px] border-border'>
      <Link
        href='/posts/1'
        className='grid grid-cols-subgrid col-span-full items-center py-2.5 px-1 self-start hover:bg-accent'
      >
        {/* 날짜 */}

        <span className='col-start-1 col-span-3 text-sm font-semibold text-primary'>
          2026-01-07
        </span>
        {/* 제목 */}
        <span className='col-start-4 col-span-13 text-md font-bold text-primary'>
          Next.js 16.1.1의 새로운 기능
        </span>
        {/* 태그 */}
        <span className='col-start-17 col-span-3 text-sm font-semibold text-primary truncate'>
          <Tag label='#Next.js' />
          <Tag label='#React' />
          <Tag label='#TypeScript' />
        </span>
      </Link>
    </li>
  );
};
