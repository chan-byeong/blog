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
    info: 'bg-callout-info-bg border-callout-info-border',
    warning: 'bg-callout-warning-bg border-callout-warning-border',
    error: 'bg-callout-error-bg border-callout-error-border',
    success: 'bg-callout-success-bg border-callout-success-border',
  };

  const iconStyles = {
    info: 'text-callout-info-icon',
    warning: 'text-callout-warning-icon',
    error: 'text-callout-error-icon',
    success: 'text-callout-success-icon',
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
          <div className='text-foreground text-sm'>{children}</div>
        </div>
      </div>
    </div>
  );
}
