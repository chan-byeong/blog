import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs } from '../../../lib/posts';
import type { Metadata } from 'next';

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

  return (
    <article className='mx-auto max-w-4xl px-6 py-24'>
      <header className='mb-12'>
        <h1 className='mb-4 text-4xl font-semibold tracking-tight text-foreground'>
          {post.title}
        </h1>
        <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {post.tags && post.tags.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className='rounded-full bg-muted px-3 py-1 text-xs font-medium'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className='prose prose-lg dark:prose-invert max-w-none'>
        {/* MDX 컨텐츠는 여기에 렌더링됩니다 */}
        {/* 향후 MDX 컴포넌트로 교체 예정 */}
        <div className='whitespace-pre-wrap'>{post.content}</div>
      </div>
    </article>
  );
}
