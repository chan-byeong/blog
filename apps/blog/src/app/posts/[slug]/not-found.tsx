import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='col-span-full flex flex-col items-center justify-center min-h-[80vh] mx-auto max-w-4xl px-6 text-center'>
      <h1 className='mb-4 text-4xl font-semibold tracking-tight'>
        Post Not Found
      </h1>
      <p className='mb-8 text-muted-foreground'>
        요청하신 포스트를 찾을 수 없습니다.
      </p>
      <Link
        href='/'
        className='inline-block bg-foreground px-5 py-3 text-background transition-colors hover:bg-foreground/30 hover:text-primary/80'
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
