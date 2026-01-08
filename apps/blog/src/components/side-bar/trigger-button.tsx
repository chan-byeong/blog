export const TriggerButton = ({ children }: { children: React.ReactNode }) => {
  return (
    <button>
      <i className='hn hn-angle-right transition-transform duration-200 group-data-[state=open]:rotate-90 fill-foreground dark:fill-foreground'></i>

      <div>
        {/* 라이트모드: 닫힘, 열림 아이콘 */}
        <i className='dark:hidden group-data-[state=open]:hidden hn hn-folder-solid' />
        <i className='hidden dark:hidden group-data-[state=open]:block hn hn-folder-open-solid' />

        {/* 다크모드: 닫힘, 열림 아이콘 */}
        <i className='hidden dark:block dark:group-data-[state=open]:hidden hn hn-folder' />
        <i className='hidden dark:group-data-[state=open]:block hn hn-folder-open' />
      </div>
      <span className='text-sm font-medium text-primary/80 group-data-[state=open]:font-semibold group-data-[state=open]:text-primary'>
        {children}
      </span>
    </button>
  );
};
