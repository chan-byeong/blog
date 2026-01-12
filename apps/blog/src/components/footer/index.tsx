import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className='grid grid-cols-subgrid col-span-full border-t-[0.5px] border-boder/50 py-3 text-primary/70'>
      <div className='col-start-1 col-span-3 sm:col-start-1 sm:col-span-4 md:col-start-1 md:col-span-5 text-xs'>
        <span>© {new Date().getFullYear()} BYEOUNG.DEV</span>
      </div>
      <div className='col-start-5 col-span-4 sm:col-start-13 sm:col-span-4 md:col-start-20 md:col-span-5 text-xs flex justify-end items-center gap-2'>
        <Link href='/sitemap.xml' className='flex items-center gap-1'>
          <i className='hn hn-flag-solid inline-block' />
          SITEMAP
        </Link>
        <Link
          href='https://github.com/chan-byeong'
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
