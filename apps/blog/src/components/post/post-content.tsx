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
    <article className='prose prose-lg dark:prose-invert max-w-none'>
      <div className='mdx-content'>{children}</div>
    </article>
  );
}
