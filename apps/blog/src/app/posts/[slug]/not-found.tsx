import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='mx-auto max-w-4xl px-6 py-24 text-center'>
      <h1 className='mb-4 text-4xl font-semibold tracking-tight'>
        Post Not Found
      </h1>
      <p className='mb-8 text-muted-foreground'>
        요청하신 포스트를 찾을 수 없습니다.
      </p>
      <Link
        href='/'
        className='inline-block rounded-full bg-foreground px-6 py-3 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]'
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}

