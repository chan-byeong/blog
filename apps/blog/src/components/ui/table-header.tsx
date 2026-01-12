import { cn } from '@/lib/utils';

interface TableHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader = ({
  children,
  className,
  ...props
}: TableHeaderProps) => {
  return (
    <div
      className={cn(
        'grid grid-cols-subgrid items-center border-b-[0.5px] pb-1.5 border-border bg-transparent self-start',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
