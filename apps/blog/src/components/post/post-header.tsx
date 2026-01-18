import { Tag } from '../ui/tag';

interface PostHeaderProps {
  title: string;
  description?: string;
  date: string;
  tags?: string[];
  isScrollDown?: boolean;
}

/**
 * 블로그 포스트 헤더 컴포넌트
 * 제목, 설명, 날짜, 태그를 표시합니다.
 */
export function PostHeader({
  title,
  description,
  date,
  tags,
  isScrollDown = false,
}: PostHeaderProps) {
  return (
    <header
      id={!isScrollDown ? 'main-post-header' : undefined}
      className={
        isScrollDown ? 'col-span-full mb-4' : 'col-span-full grid-cols-subgrid'
      }
    >
      <div className='space-y-2'>
        <h1
          className={`text-foreground font-semibold tracking-tight ${
            isScrollDown ? 'text-xl' : 'text-4xl leading-tight md:text-5xl'
          }`}
        >
          {title}
        </h1>
        {!isScrollDown && description && (
          <p className='md:text-md text-muted-foreground leading-relaxed'>
            {description}
          </p>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-4 pt-4'>
        <time
          dateTime={date}
          className='text-muted-foreground flex items-center gap-2 text-sm'
        >
          <i className='hn hn-calender'></i>
          {new Date(date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>

        {tags && tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {tags.map((tag) => (
              <Tag key={tag} label={`# ${tag}`} />
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
