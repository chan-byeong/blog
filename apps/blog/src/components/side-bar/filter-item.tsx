'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface FilterItemProps extends React.ComponentPropsWithRef<typeof Checkbox> {
  label: string;
  postsCount: number;
}
// TODO: CSS @apply 또는 tv, cva 적용하기

export const FilterItem = ({
  label,
  postsCount,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: FilterItemProps) => {
  const [isChecked, setIsChecked] = useState(
    defaultChecked || checked || false
  );

  const handleCheckedChange = (value: boolean) => {
    setIsChecked(value);
    onCheckedChange?.(value);
  };

  const checkState = checked !== undefined ? checked : isChecked;

  return (
    <div
      className='flex items-center gap-1 group cursor-pointer'
      data-state={checkState ? 'checked' : 'unchecked'}
      onClick={() => handleCheckedChange(!checkState)}
    >
      <Checkbox
        checked={checkState}
        onCheckedChange={handleCheckedChange}
        {...props}
        className='hidden md:block mr-1'
      />
      <span className='text-sm font-medium text-primary/80 transition-colors group-hover:font-semibold group-hover:text-primary group-data-[state=checked]:text-primary group-data-[state=checked]:font-semibold'>
        {label}
      </span>
      <span className='text-xs font-medium text-primary/60 transition-colors group-hover:font-semibold group-hover:text-primary/80 group-data-[state=checked]:text-primary/80 group-data-[state=checked]:font-semibold'>
        ({postsCount})
      </span>
    </div>
  );
};
