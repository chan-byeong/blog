import type { MDXComponents as MDXComponentsType } from 'mdx/types';
import { CodeBlock } from './code-block';
import { Callout } from './callout';
import { FootnoteTooltip } from './footnote-tooltip';

/**
 * 텍스트 - 16px / 333d4b
 * h2 - 30px / 191f28
 * h3 - 24px
 * a - 6b7684
 * code - 13px
 * MDX에서 사용할 커스텀 컴포넌트들 - 심플하고 깔끔한 스타일
 */
export const MDXComponents: MDXComponentsType = {
  // 헤딩
  h1: ({ children, ...props }) => (
    <h1
      className='text-h-color mt-12 mb-6 scroll-mt-20 text-[2rem] font-bold tracking-tight'
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => {
    // remark-gfm이 자동 생성하는 각주 제목 "Footnotes" 숨김 처리
    if (props.id === 'footnote-label') {
      return (
        <h2 id={props.id} className='sr-only'>
          {children}
        </h2>
      );
    }

    return (
      <h2
        className='text-h-color mt-10 mb-5 scroll-mt-20 text-[1.8rem] font-bold tracking-tight'
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => (
    <h3
      className='text-h-color mt-8 mb-4 scroll-mt-20 text-2xl font-bold tracking-tight'
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className='text-h-color mt-6 mb-3 scroll-mt-20 text-xl font-bold tracking-tight'
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5
      className='text-h-color mt-5 mb-2 scroll-mt-20 text-lg font-bold tracking-tight'
      {...props}
    >
      {children}
    </h5>
  ),

  // 단락
  p: ({ children, ...props }) => (
    <p
      className='text-prose-ink my-4 mt-2 text-base font-normal wrap-break-word break-keep dark:font-medium'
      {...props}
    >
      {children}
    </p>
  ),

  // 링크, 혹은 각주 참조
  a: ({ children, href, ...props }) => {
    // 1. 본문 내 각주 번호인 경우 (예: [1])
    if ('data-footnote-ref' in props) {
      return (
        <FootnoteTooltip href={href} {...props}>
          {children}
        </FootnoteTooltip>
      );
    }

    // 2. 각주 하단 뒤로가기 링크인 경우 (↩)
    if ('data-footnote-backref' in props) {
      return (
        <a
          href={href}
          className='hover:text-prose-link-hover ml-1.5 transition-colors'
          {...props}
        >
          {children}
        </a>
      );
    }

    // 3. 일반 링크 (스크린샷에 있는 밝은 블루 톤)
    return (
      <a
        href={href}
        className='text-prose-link hover:text-prose-link-hover transition-colors'
        {...props}
      >
        {children}
      </a>
    );
  },

  // 리스트
  ul: ({ children, ...props }) => (
    <ul
      className='text-prose-ink my-4 mt-2 ml-5 list-disc space-y-1'
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className='text-prose-ink my-4 mt-2 ml-5 list-decimal space-y-1'
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li
      className='text-[16px] leading-[1.8] font-normal tracking-[-0.01em]'
      {...props}
    >
      {children}
    </li>
  ),

  // 코드
  code: ({ children, className, ...props }) => {
    // 인라인 코드
    if (!className) {
      return (
        <code
          className='text-foreground bg-code-inline-bg rounded-xs px-1 py-0.5 font-mono text-[13px]'
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
      className='border-pre-border bg-pre-bg text-code-foreground my-6 overflow-x-auto rounded-xs border p-5 font-mono text-[13px] leading-relaxed'
      {...props}
    >
      {children}
    </pre>
  ),

  // 인용문 (매우 심플한 좌측 선)
  blockquote: ({ children, ...props }) => (
    <blockquote
      className='border-quote-rule text-muted-foreground my-6 border-l-[3px] py-1 pl-5 leading-[1.8] italic'
      {...props}
    >
      {children}
    </blockquote>
  ),

  // 테이블
  table: ({ children, ...props }) => (
    <div className='my-6 w-full overflow-x-auto'>
      <table className='w-full border-collapse text-[15px]' {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className='border-border-subtle border-b' {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className='divide-border-subtle divide-y' {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className='hover:bg-wash transition-colors' {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      className='text-foreground px-4 py-4 text-left font-semibold'
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className='text-prose-ink px-4 py-4' {...props}>
      {children}
    </td>
  ),

  // 구분선
  hr: (props) => (
    <hr className='border-border-subtle my-8 border-t' {...props} />
  ),

  // 이미지 - 반응형
  img: ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ''}
      loading='lazy'
      className='border-border-subtle my-6 h-auto w-full rounded-sm shadow-sm'
      {...props}
    />
  ),
  sup: ({ children, ...props }) => (
    <sup
      className='text-muted-foreground hover:text-prose-link-hover transition-colors'
      {...props}
    >
      {/* 윗첨자 간격 조정 */}
      <span className='ml-0.5 text-[0.75rem] font-medium'>{children}</span>
    </sup>
  ),
  section: ({ children, ...props }) => {
    // data-footnotes 속성이 있는 경우만 각주 컨테이너로 스타일링
    if ('data-footnotes' in props) {
      return (
        <section
          className='border-border-subtle my-10 border-t-[1.5px] pt-6'
          {...props}
        >
          {children}
        </section>
      );
    }
    // 일반 section인 경우
    return <section {...props}>{children}</section>;
  },
  strong: ({ children, ...props }) => (
    <strong className='text-foreground font-bold' {...props}>
      {children}
    </strong>
  ),

  // 커스텀 컴포넌트
  CodeBlock,
  Callout,
};
