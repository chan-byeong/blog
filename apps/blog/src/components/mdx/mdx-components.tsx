import Image from 'next/image';
import type { MDXComponents as MDXComponentsType } from 'mdx/types';
import { CodeBlock } from './code-block';
import { Callout } from './callout';

/**
 * MDX에서 사용할 커스텀 컴포넌트들
 */
export const MDXComponents: MDXComponentsType = {
  // 헤딩
  h1: ({ children, ...props }) => (
    <h1
      className='text-foreground mt-8 mb-6 scroll-mt-20 text-4xl font-bold tracking-tight'
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className='text-foreground mt-8 mb-4 scroll-mt-20 pb-2 text-3xl font-semibold tracking-tight'
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className='text-foreground mt-6 mb-3 scroll-mt-20 text-2xl font-semibold tracking-tight'
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className='text-foreground mt-4 mb-2 scroll-mt-20 text-xl font-semibold tracking-tight'
      {...props}
    >
      {children}
    </h4>
  ),

  // 단락
  p: ({ children, ...props }) => (
    <p className='text-foreground/90 mb-4 leading-7' {...props}>
      {children}
    </p>
  ),

  // 링크
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className='text-primary decoration-primary/30 hover:decoration-primary font-medium underline underline-offset-4 transition-colors'
      {...props}
    >
      {children}
    </a>
  ),

  // 리스트
  ul: ({ children, ...props }) => (
    <ul className='text-foreground/90 mb-4 ml-6 list-disc space-y-2' {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className='text-foreground/90 mb-4 ml-6 list-decimal space-y-2'
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className='leading-7' {...props}>
      {children}
    </li>
  ),

  // 코드
  code: ({ children, className, ...props }) => {
    // 인라인 코드
    if (!className) {
      return (
        <code
          className='bg-muted/20 text-foreground rounded px-1.5 py-0.5 font-mono text-sm'
          {...props}
        >
          {children}
        </code>
      );
    }
    // 코드 블록은 pre > code 형태로 렌더링됨
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      className='bg-muted/20 border-border mb-4 overflow-x-auto rounded-lg border p-4'
      {...props}
    >
      {children}
    </pre>
  ),

  // 인용문
  blockquote: ({ children, ...props }) => (
    <blockquote
      className='border-primary text-muted-foreground mb-4 border-l-4 pl-4 italic'
      {...props}
    >
      {children}
    </blockquote>
  ),

  // 테이블
  table: ({ children, ...props }) => (
    <div className='mb-4 w-full overflow-x-auto'>
      <table className='w-full border-collapse text-sm' {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className='bg-muted' {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className='divide-border divide-y' {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className='border-border border-b' {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      className='text-foreground px-4 py-2 text-left font-semibold'
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className='text-foreground/90 px-4 py-2' {...props}>
      {children}
    </td>
  ),

  // 구분선
  hr: (props) => <hr className='border-border my-8' {...props} />,

  // 이미지
  img: ({ src, alt, ...props }) => (
    <Image
      src={src}
      alt={alt}
      className='mb-4 rounded-lg'
      loading='lazy'
      {...props}
    />
  ),

  // 커스텀 컴포넌트
  CodeBlock,
  Callout,
};
