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

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

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
    <div className='col-span-full mt-20 grid grid-cols-subgrid'>
      {/* 포스트 읽기 추적 (30초 이상 체류 시 이벤트 발생) */}
      <PostReadTracker slug={post.slug} title={post.title} />

      <section className='col-span-full grid grid-cols-subgrid'>
        <PostHeader
          title={post.title}
          description={post.description}
          date={post.date}
          tags={post.tags || []}
        />
      </section>
      <section className='col-span-full mt-8 grid grid-cols-subgrid gap-y-4 md:mt-16'>
        <div className='bg-background/80 sticky top-10 col-span-full mr-2 grid grid-cols-subgrid self-start backdrop-blur-md md:top-24 md:col-span-6 md:col-start-1'>
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
        <div className='col-span-full grid grid-cols-subgrid md:col-span-18 md:col-start-7'>
          <div className='col-span-full grid-cols-subgrid items-start'>
            <TableHeader className='col-span-full'>
              <span className='text-primary col-span-full text-xs font-semibold uppercase'>
                / Contents
              </span>
            </TableHeader>
            <article className='col-span-full grid grid-cols-subgrid items-start'>
              <PostContent>{content}</PostContent>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
