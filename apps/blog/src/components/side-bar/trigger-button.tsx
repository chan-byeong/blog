import { cn } from '@/lib/utils';
interface TriggerButtonProps extends React.ComponentPropsWithRef<'button'> {
  children: React.ReactNode;
  className?: string;
  ref?: React.RefObject<HTMLButtonElement>;
}

export const TriggerButton = ({
  children,
  className,
  ref = undefined,
  ...props
}: TriggerButtonProps) => {
  return (
    <button
      ref={ref}
      className={cn(
        'hover:bg-muted-foreground/20 cursor-pointer rounded-sm p-1 transition-colors',
        className
      )}
      {...props}
    >
      <i className='hn hn-angle-right fill-foreground dark:fill-foreground transition-transform duration-200 group-data-[state=open]:rotate-90'></i>

      <div>
        {/* 라이트모드: 닫힘, 열림 아이콘 */}
        <i className='hn hn-folder-solid inline-block group-data-[state=open]:hidden dark:hidden' />
        <i className='hn hn-folder-open-solid hidden group-data-[state=open]:inline-block dark:hidden' />

        {/* 다크모드: 닫힘, 열림 아이콘 */}
        <i className='hn hn-folder hidden dark:inline-block dark:group-data-[state=open]:hidden' />
        <i className='hn hn-folder-open hidden dark:group-data-[state=open]:inline-block' />
      </div>
      <span className='text-primary/80 group-data-[state=open]:text-primary text-[15px] font-medium group-data-[state=open]:font-semibold'>
        {children}
      </span>
    </button>
  );
};
