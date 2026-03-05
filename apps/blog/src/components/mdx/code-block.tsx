import React from 'react';

interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  filename?: string;
}

/**
 * 코드 블록 커스텀 컴포넌트
 */
export function CodeBlock({ children, language, filename }: CodeBlockProps) {
  return (
    <div className='bg-muted/30 my-6 overflow-hidden rounded-xs'>
      {(filename || language) && (
        <div className='text-muted-foreground border-border/40 bg-muted/20 flex items-center justify-between border-b px-4 py-2 text-xs'>
          <span className='font-medium'>{filename || ''}</span>
          {language && <span className='opacity-80'>{language}</span>}
        </div>
      )}
      <div className='no-scrollbar overflow-x-auto'>
        <pre className='p-4 text-[13px] leading-relaxed'>
          <code
            className={
              language
                ? `language-${language} block w-max min-w-full font-mono`
                : 'block w-max min-w-full font-mono'
            }
          >
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
}
