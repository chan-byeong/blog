import React from 'react';

interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  filename?: string;
}

/**
 * 코드 블록 커스텀 컴포넌트
 * 파일명을 표시할 수 있습니다.
 */
export function CodeBlock({ children, language, filename }: CodeBlockProps) {
  return (
    <div className='border-border bg-muted/20 my-6 overflow-hidden rounded-sm border-[0.5px]'>
      {filename && (
        <div className='border-border bg-muted flex items-center justify-between border-b px-4 py-2'>
          <span className='text-muted-foreground text-sm font-medium'>
            {filename}
          </span>
          {language && (
            <span className='text-muted-foreground text-xs'>{language}</span>
          )}
        </div>
      )}
      <div className='overflow-x-auto'>
        <pre className='p-4'>
          <code className={language ? `language-${language}` : ''}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
}
