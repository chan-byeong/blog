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
        'cursor-pointer hover:bg-muted-foreground/20 transition-colors rounded-sm p-1',
        className
      )}
      {...props}
    >
      <i className='hn hn-angle-right transition-transform duration-200 group-data-[state=open]:rotate-90 fill-foreground dark:fill-foreground'></i>

      <div>
        {/* 라이트모드: 닫힘, 열림 아이콘 */}
        <i className='inline-block dark:hidden group-data-[state=open]:hidden hn hn-folder-solid' />
        <i className='hidden dark:hidden group-data-[state=open]:inline-block hn hn-folder-open-solid' />

        {/* 다크모드: 닫힘, 열림 아이콘 */}
        <i className='hidden dark:inline-block dark:group-data-[state=open]:hidden hn hn-folder' />
        <i className='hidden dark:group-data-[state=open]:inline-block hn hn-folder-open' />
      </div>
      <span className='text-[15px] font-medium text-primary/80 group-data-[state=open]:font-semibold group-data-[state=open]:text-primary'>
        {children}
      </span>
    </button>
  );
};
