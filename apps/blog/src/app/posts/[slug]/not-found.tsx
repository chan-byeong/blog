import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='col-span-full mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-6 text-center'>
      <h1 className='mb-4 text-4xl font-semibold tracking-tight'>
        Post Not Found
      </h1>
      <p className='text-muted-foreground mb-8'>
        요청하신 포스트를 찾을 수 없습니다.
      </p>
      <Link
        href='/'
        className='bg-foreground text-background hover:bg-foreground/30 hover:text-primary/80 inline-block px-5 py-3 transition-colors'
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
