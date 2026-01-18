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
    <article className='prose prose-lg dark:prose-invert col-span-full grid max-w-none grid-cols-subgrid'>
      <div className='mdx-content col-span-full grid min-w-0 grid-cols-subgrid'>
        {children}
      </div>
    </article>
  );
}
