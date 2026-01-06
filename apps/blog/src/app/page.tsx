import Link from 'next/link';
import { getAllPosts } from '../lib/posts';

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className='mx-auto max-w-4xl px-6 py-24'>
      <header className='mb-16'>
        <h1 className='mb-4 text-5xl font-medium tracking-tight text-foreground'>
          Blog / BLOG
        </h1>
        <p className='text-lg text-muted-foreground'>
          개발과 일상에 대한 생각을 기록합니다.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className='rounded-lg border border-border bg-card p-12 text-center shadow-sm'>
          <p className='text-muted-foreground'>
            아직 작성된 포스트가 없습니다.
          </p>
        </div>
      ) : (
        <div className='space-y-8'>
          {posts.map((post) => (
            <article
              key={post.slug}
              className='group rounded-lg border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md'
            >
              <Link href={`/posts/${post.slug}`}>
                <h2 className='mb-3 text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary'>
                  {post.title}
                </h2>
              </Link>
              <p className='mb-4 text-muted-foreground'>{post.description}</p>
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
