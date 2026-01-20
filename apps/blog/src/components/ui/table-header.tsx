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
        'border-border grid grid-cols-subgrid items-center self-start border-b-[0.5px] bg-transparent pb-1.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
