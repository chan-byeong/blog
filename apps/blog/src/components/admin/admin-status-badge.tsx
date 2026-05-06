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
          ? 'border-primary/30 text-primary'
          : 'border-destructive/40 text-destructive'
      )}
    >
      {published ? 'VISIBLE' : 'HIDDEN'}
    </span>
  );
}
