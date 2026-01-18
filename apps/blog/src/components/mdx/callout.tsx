import React from 'react';

interface CalloutProps {
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
}

/**
 * Callout 컴포넌트 - 중요한 정보를 강조
 */
export function Callout({ children, type = 'info', title }: CalloutProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900',
    warning:
      'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900',
    error: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900',
    success:
      'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900',
  };

  const iconStyles = {
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  };

  return (
    <div className={`my-6 rounded-lg border p-4 ${styles[type]}`} role='alert'>
      <div className='flex items-start gap-3'>
        <span className={`text-xl ${iconStyles[type]}`}>{icons[type]}</span>
        <div className='flex-1'>
          {title && (
            <h4 className='text-foreground mb-2 font-semibold'>{title}</h4>
          )}
          <div className='text-foreground/90 text-sm'>{children}</div>
        </div>
      </div>
    </div>
  );
}
