import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className='border-border/50 text-primary/70 col-span-full mt-10 grid grid-cols-subgrid border-t-[0.5px] py-3'>
      <div className='col-span-3 col-start-1 text-xs sm:col-span-4 sm:col-start-1 md:col-span-5 md:col-start-1'>
        <span>© {new Date().getFullYear()} BYEOUNG.DEV</span>
      </div>
      <div className='col-span-4 col-start-5 flex items-center justify-end gap-2 text-xs sm:col-span-4 sm:col-start-13 md:col-span-5 md:col-start-20'>
        <Link href='/sitemap.xml' className='flex items-center gap-1'>
          <i className='hn hn-flag-solid inline-block' />
          SITEMAP
        </Link>
        <Link
          href='https://github.com/chan-byeong/blog'
          className='flex items-center gap-1'
          target='_blank'
          rel='noopener noreferrer'
        >
          <i className='hn hn-github inline-block' />
          GITHUB
        </Link>
      </div>
    </footer>
  );
};
