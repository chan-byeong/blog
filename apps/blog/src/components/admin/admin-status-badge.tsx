import { cn } from '@/lib/utils';

interface AdminStatusBadgeProps {
  published: boolean;
}

export function AdminStatusBadge({ published }: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex border px-2 py-1 text-xs font-semibold uppercase',
        published
          ? 'border-border-subtle text-foreground'
          : 'border-destructive-border text-destructive'
      )}
    >
      {published ? 'VISIBLE' : 'HIDDEN'}
    </span>
  );
}
