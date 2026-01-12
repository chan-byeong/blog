import React from 'react';

interface PostContentProps {
  children: React.ReactNode;
}

/**
 * 블로그 포스트 본문 컴포넌트
 * MDX 컨텐츠를 감싸는 래퍼
 */
export function PostContent({ children }: PostContentProps) {
  return (
    <article className='grid grid-cols-subgrid col-span-full prose prose-lg dark:prose-invert max-w-none'>
      <div className='grid grid-cols-subgrid col-span-full mdx-content min-w-0'>
        {children}
      </div>
    </article>
  );
}
