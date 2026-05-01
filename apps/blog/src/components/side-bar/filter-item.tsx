'use client';

import { Checkbox } from '@/components/ui/checkbox';

interface FilterItemProps extends Omit<
  React.ComponentPropsWithRef<typeof Checkbox>,
  'checked' | 'defaultChecked' | 'onCheckedChange'
> {
  label: string;
  postsCount: number;
  checked: boolean;
  onCheckedChange: (tag: string, checked: boolean) => void;
}
// TODO: CSS @apply 또는 tv, cva 적용하기

export const FilterItem = ({
  label,
  postsCount,
  checked,
  onCheckedChange,
  ...props
}: FilterItemProps) => {
  const handleCheckedChange = (value: boolean) => {
    onCheckedChange(label, value);
  };

  return (
    <div
      className='group flex cursor-pointer items-center gap-1.5 px-0.5 py-1 md:gap-2.5'
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={() => handleCheckedChange(!checked)}
      role='checkbox'
      aria-checked={checked}
      aria-label={label}
    >
      <Checkbox
        checked={checked}
        onClick={(event) => event.stopPropagation()}
        onCheckedChange={(value) => {
          if (typeof value === 'boolean') {
            handleCheckedChange(value);
          }
        }}
        {...props}
        className='hidden md:flex'
      />
      <span className='text-muted-foreground group-hover:text-foreground group-data-[state=checked]:text-foreground text-sm tracking-wide transition-colors duration-200'>
        {label}
      </span>
      <span className='text-muted-foreground/50 group-hover:text-muted-foreground/80 group-data-[state=checked]:text-muted-foreground/80 font-mono text-xs transition-colors duration-200'>
        {postsCount}
      </span>
    </div>
  );
};
