import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import { slug as githubSlug } from 'github-slugger';
import type { PostMetadata } from '@/types/post';
import { MDXComponents } from '@/components/mdx/mdx-components';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

/**
 * MDX 컨텐츠를 파싱하고 렌더링합니다.
 */
export async function parseMDX(source: string) {
  const { content, frontmatter } = await compileMDX<PostMetadata>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'wrap',
              properties: {
                className: ['anchor'],
              },
            },
          ],
          rehypeHighlight,
        ],
      },
    },
    components: MDXComponents,
  });

  return {
    content,
    frontmatter,
  };
}

/**
 * MDX 소스에서 Table of Contents를 추출합니다.
 * 코드 블록 내부의 헤딩은 제외하고, rehype-slug와 동일한 방식으로 ID를 생성합니다.
 */
export function extractTOC(source: string): TOCItem[] {
  // 1. 코드 블록 제거 (```...``` 형태)
  const withoutCodeBlocks = source.replace(/```[\s\S]*?```/g, '');

  // 2. 헤딩 추출 (H1~H3만)
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(withoutCodeBlocks)) !== null) {
    const hashes = match[1]; // #, ##, ###
    const text = match[2].trim(); // 헤딩 텍스트

    const level = hashes.length; // # 개수로 레벨 계산
    const id = githubSlug(text); // rehype-slug와 동일한 방식으로 ID 생성

    toc.push({ id, text, level });
  }

  return toc;
}
