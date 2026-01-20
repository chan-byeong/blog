'use client';

import { useEffect, useState } from 'react';
import type { TOCItem } from '@/lib/mdx';

interface TableOfContentsProps {
  items: TOCItem[];
}

/**
 * 목차 (Table of Contents) 컴포넌트
 * 현재 스크롤 위치에 따라 활성 헤딩을 하이라이트합니다.
 */
export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    // 모든 헤딩 요소 관찰
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.offsetTop - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <nav className='col-span-full mt-2 block self-start'>
      <div className='space-y-2'>
        <ul className='border-border/50 mb-2 ml-2 space-y-2 border-l border-dotted'>
          {items.map((item) => {
            const isActive = activeId === item.id;
            const paddingLeft = (item.level - 1) * 12 + 16;

            return (
              <li key={item.id} style={{ paddingLeft: `${paddingLeft}px` }}>
                <button
                  onClick={() => handleClick(item.id)}
                  className={`hover:text-foreground block w-full cursor-pointer text-left text-sm transition-colors ${
                    isActive
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.text}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
