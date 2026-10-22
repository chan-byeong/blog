import { cn } from '@/lib/utils';

interface AdminControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function AdminControlButton({
  selected = false,
  className,
  children,
  ...props
}: AdminControlButtonProps) {
  return (
    <button
      type='button'
      className={cn(
        'border-border-subtle text-foreground hover:bg-wash disabled:text-foreground-disabled border px-2 py-1.5 text-left text-xs font-semibold tracking-tight transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent',
        selected ? 'bg-foreground text-background hover:bg-foreground' : '',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
