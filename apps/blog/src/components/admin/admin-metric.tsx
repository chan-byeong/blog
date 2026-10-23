interface AdminMetricProps {
  label: string;
  value: number | string;
}

export function AdminMetric({ label, value }: AdminMetricProps) {
  return (
    <div className='border-border-subtle flex min-w-0 items-center justify-between gap-2 border px-2 py-2'>
      <span className='text-muted-foreground shrink-0'>{label}</span>
      <span className='text-foreground truncate'>{value}</span>
    </div>
  );
}
