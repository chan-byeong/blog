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
      className='mb-6 mt-8 text-4xl font-bold tracking-tight text-foreground scroll-mt-20'
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className='mb-4 mt-8 text-3xl font-semibold tracking-tight text-foreground scroll-mt-20 pb-2'
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className='mb-3 mt-6 text-2xl font-semibold tracking-tight text-foreground scroll-mt-20'
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className='mb-2 mt-4 text-xl font-semibold tracking-tight text-foreground scroll-mt-20'
      {...props}
    >
      {children}
    </h4>
  ),

  // 단락
  p: ({ children, ...props }) => (
    <p className='mb-4 leading-7 text-foreground/90' {...props}>
      {children}
    </p>
  ),

  // 링크
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className='font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-colors'
      {...props}
    >
      {children}
    </a>
  ),

  // 리스트
  ul: ({ children, ...props }) => (
    <ul className='mb-4 ml-6 list-disc space-y-2 text-foreground/90' {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className='mb-4 ml-6 list-decimal space-y-2 text-foreground/90'
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
          className='rounded bg-muted/20 px-1.5 py-0.5 font-mono text-sm text-foreground'
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
      className='mb-4 overflow-x-auto rounded-lg bg-muted/20 p-4 border border-border'
      {...props}
    >
      {children}
    </pre>
  ),

  // 인용문
  blockquote: ({ children, ...props }) => (
    <blockquote
      className='mb-4 border-l-4 border-primary pl-4 italic text-muted-foreground'
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
    <tbody className='divide-y divide-border' {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className='border-b border-border' {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      className='px-4 py-2 text-left font-semibold text-foreground'
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className='px-4 py-2 text-foreground/90' {...props}>
      {children}
    </td>
  ),

  // 구분선
  hr: (props) => <hr className='my-8 border-border' {...props} />,

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
