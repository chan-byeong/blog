import React from 'react';

import { cn } from '@/lib/utils';

type CalloutType = 'info' | 'warning' | 'error' | 'success';

interface CalloutProps {
  children: React.ReactNode;
  type?: CalloutType;
  title?: string;
}

const CALLOUT_STYLES: Record<
  CalloutType,
  { box: string; key: string; mark: string; label: string }
> = {
  info: {
    box: 'bg-callout-info-bg border-callout-info-border',
    key: 'text-callout-info-icon',
    mark: 'i',
    label: 'Note',
  },
  success: {
    box: 'bg-callout-success-bg border-callout-success-border',
    key: 'text-callout-success-icon',
    mark: '✓',
    label: 'Tip',
  },
  warning: {
    box: 'bg-callout-warning-bg border-callout-warning-border',
    key: 'text-callout-warning-icon',
    mark: '!',
    label: 'Warning',
  },
  error: {
    box: 'bg-callout-error-bg border-callout-error-border',
    key: 'text-callout-error-icon',
    mark: '×',
    label: 'Caution',
  },
};

/**
 * Callout 컴포넌트 - 본문 흐름 안에서 보충 설명·주의 사항을 강조
 */
export function Callout({ children, type = 'info', title }: CalloutProps) {
  const style = CALLOUT_STYLES[type];

  return (
    <aside
      aria-label={title ?? style.label}
      className={cn('my-8 rounded-none border-[0.5px] border-l-2', style.box)}
    >
      <p className='border-border-subtle flex items-baseline gap-2 border-b-[0.5px] px-4 py-2 text-xs tracking-tight uppercase'>
        <span className={cn('font-medium', style.key)} aria-hidden='true'>
          [{style.mark}]
        </span>
        <span className='text-muted-foreground'>{style.label}</span>
        {title && (
          <>
            <span className='text-muted-foreground' aria-hidden='true'>
              /
            </span>
            <span className='text-foreground text-sm font-semibold tracking-normal normal-case'>
              {title}
            </span>
          </>
        )}
      </p>
      <div className='text-prose-ink px-4 py-3 text-[15px] leading-7 [&_p]:my-0 [&_p+p]:mt-3'>
        {children}
      </div>
    </aside>
  );
}
