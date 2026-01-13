import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs } from '../../../lib/posts';
import { parseMDX, extractTOC } from '../../../lib/mdx';
import { PostHeader } from '../../../components/post/post-header';
import { PostContent } from '../../../components/post/post-content';
import type { Metadata } from 'next';
import { PostSideBar } from '@/components/post/post-side-bar';
import { TableHeader } from '@/components/ui/table-header';
import { PostReadTracker } from '@/components/post/post-read-tracker';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 정적 경로 생성
 */
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

/**
 * 메타데이터 생성
 */
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // MDX 파싱
  const { content } = await parseMDX(post.content);

  // TOC 추출
  const tocItems = extractTOC(post.content);

  return (
    <div className='grid grid-cols-subgrid col-span-full mt-20'>
      {/* 포스트 읽기 추적 (30초 이상 체류 시 이벤트 발생) */}
      <PostReadTracker slug={post.slug} title={post.title} />

      <section className='grid grid-cols-subgrid col-span-full'>
        <PostHeader
          title={post.title}
          description={post.description}
          date={post.date}
          tags={post.tags || []}
        />
      </section>
      <section className='grid grid-cols-subgrid col-span-full mt-8 md:mt-16 gap-y-4'>
        <div className='sticky top-10 md:top-24 grid grid-cols-subgrid col-span-full md:col-start-1 md:col-span-6 self-start bg-background/80 backdrop-blur-md mr-2'>
          {/* 목차 (TOC) - 큰 화면에서만 표시 */}
          {tocItems.length > 0 && (
            <PostSideBar
              tocItems={tocItems}
              title={post.title}
              description={post.description}
              date={post.date}
              tags={post.tags || []}
            />
          )}
        </div>
        {/* 메인 컨텐츠 그리드 */}
        <div className='grid grid-cols-subgrid col-span-full md:col-start-7 md:col-span-18'>
          <div className='grid-cols-subgrid col-span-full items-start'>
            <TableHeader className='col-span-full'>
              <span className='col-span-full text-primary text-xs font-semibold uppercase'>
                / Contents
              </span>
            </TableHeader>
            <article className='grid grid-cols-subgrid col-span-full items-start'>
              <PostContent>{content}</PostContent>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
