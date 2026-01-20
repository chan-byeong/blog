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
  const [isTocVisible, setIsTocVisible] = useState(true);

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

  const handleToggleToc = () => {
    setIsTocVisible((prev) => !prev);
  };

  return (
    <div className='col-span-full grid grid-cols-subgrid'>
      <div
        className={`col-span-full hidden grid-cols-subgrid overflow-hidden transition-all duration-300 ease-in-out md:block ${
          isScrolledDown
            ? 'max-h-[500px] translate-y-0 opacity-100'
            : 'max-h-0 -translate-y-4 opacity-0'
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

      <TableHeader className='col-span-full hidden md:grid'>
        <span className='text-primary col-span-full text-xs font-semibold uppercase'>
          / Side
        </span>
      </TableHeader>

      <button
        className='group hover:bg-muted-foreground/20 data-[state=closed]:text-primary/80 col-span-full my-2 mr-4 inline-flex cursor-pointer items-center gap-x-2 self-start rounded-xs py-1 text-[15px] font-medium transition-colors'
        onClick={handleToggleToc}
        data-state={isTocVisible ? 'open' : 'closed'}
        aria-expanded={isTocVisible}
        aria-controls='toc-content'
      >
        <i className='hn hn-angle-right fill-foreground dark:fill-foreground transition-transform duration-200 group-data-[state=open]:rotate-90'></i>
        Table of Contents
      </button>

      <div
        id='toc-content'
        className={`col-span-full grid grid-cols-subgrid overflow-hidden transition-all duration-300 ease-in-out ${
          isTocVisible
            ? 'max-h-[1000px] translate-y-0 opacity-100'
            : 'max-h-0 -translate-y-4 opacity-0'
        }`}
      >
        <TableOfContents items={tocItems} />
      </div>
    </div>
  );
};
