'use client';

import { useEffect, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface FootnoteTooltipProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  href: string;
}

export function FootnoteTooltip({
  children,
  href,
  ...props
}: FootnoteTooltipProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    // 하단에 렌더링된 각주 리스트에서 해당 id를 찾아 텍스트를 추출
    if (href && href.startsWith('#')) {
      const targetId = href.substring(1);
      // DOM에 그려진 뒤에 요소를 찾기 위해 setTimeout 사용
      const extractText = () => {
        const el = document.getElementById(targetId);
        if (el) {
          // '↩' 기호 등 불필요한 문자 정리
          const content = el.innerText.replace('↩', '').trim();
          el.innerText = content;
          setText(content);
        }
      };

      const timer = setTimeout(extractText, 100);
      return () => clearTimeout(timer);
    }
  }, [href]);

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <a
            href={href}
            className='text-primary hover:text-accent-thick dark:hover:text-accent transition-colors'
            {...props}
          >
            [{children}]
          </a>
        </Tooltip.Trigger>

        {text && (
          <Tooltip.Portal>
            <Tooltip.Content
              sideOffset={5}
              // className='animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-w-xs rounded-sm border border-zinc-200 bg-white p-3 text-sm leading-relaxed break-keep whitespace-normal text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
              className='max-w-sm rounded-xs bg-zinc-100 px-2 py-0.5 wrap-break-word dark:bg-zinc-800 dark:text-zinc-200'
            >
              {text}
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
