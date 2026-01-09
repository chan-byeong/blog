'use client';

import { useEffect, useState } from 'react';
import { TableOfContents } from './table-of-contents';
import type { TOCItem } from '@/lib/mdx';
import { PostHeader } from './post-header';
import { TableHeader } from '../ui/table-header';

interface PostSideBarProps {
  tocItems: TOCItem[];
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export const PostSideBar = ({
  tocItems,
  title,
  description,
  date,
  tags,
}: PostSideBarProps) => {
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  useEffect(() => {
    // 원본 PostHeader 요소를 찾기
    const mainHeader = document.getElementById('main-post-header');

    if (!mainHeader) return;

    // Intersection Observer 설정
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 원본 헤더가 뷰포트에서 완전히 사라지면 사이드바에 표시
          setIsScrolledDown(!entry.isIntersecting);
        });
      },
      {
        // 헤더가 완전히 사라지는 시점을 감지
        threshold: 0,
        rootMargin: '-80px 0px 0px 0px', // 상단 여백 고려
      }
    );

    observer.observe(mainHeader);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className='grid grid-cols-subgrid col-start-1 col-span-6'>
      <div
        className={`grid-cols-subgrid col-span-full overflow-hidden transition-all duration-300 ease-in-out ${
          isScrolledDown
            ? 'max-h-[500px] opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-4'
        }`}
      >
        <PostHeader
          title={title}
          description={description}
          date={date}
          tags={tags}
          isScrollDown={true}
        />
      </div>
      <TableHeader className='col-span-full'>
        <span className='col-span-full text-primary text-sm font-semibold uppercase'>
          / Table of Contents
        </span>
      </TableHeader>
      <TableOfContents items={tocItems} />
    </div>
  );
};
