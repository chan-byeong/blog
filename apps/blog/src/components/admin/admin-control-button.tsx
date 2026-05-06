import { cn } from '@/lib/utils';

interface AdminControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
        'border-border/40 text-primary hover:bg-accent/50 disabled:text-primary/40 border px-2 py-1.5 text-left text-xs font-semibold tracking-tight transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent',
        selected ? 'bg-foreground text-background hover:bg-foreground' : '',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
