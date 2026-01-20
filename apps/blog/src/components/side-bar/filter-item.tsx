'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { usePostStore } from '@/providers/post-provider';
import { useShallow } from 'zustand/react/shallow';

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
  const { addSelectedTag, removeSelectedTag } = usePostStore(
    useShallow((store) => ({
      addSelectedTag: store.addSelectedTag,
      removeSelectedTag: store.removeSelectedTag,
    }))
  );
  const [isChecked, setIsChecked] = useState(
    defaultChecked || checked || false
  );

  const handleCheckedChange = (value: boolean) => {
    setIsChecked(value);
    onCheckedChange?.(value);
    if (value) {
      addSelectedTag(label);
    } else {
      removeSelectedTag(label);
    }
  };

  const checkState = checked !== undefined ? checked : isChecked;

  return (
    <div
      className='group flex cursor-pointer items-center gap-1'
      data-state={checkState ? 'checked' : 'unchecked'}
      onClick={() => handleCheckedChange(!checkState)}
      role='checkbox'
      aria-checked={checkState === true}
      aria-label={label}
    >
      <Checkbox
        checked={checkState}
        onCheckedChange={handleCheckedChange}
        {...props}
        className='mr-1 hidden md:block'
      />
      <span className='text-primary/80 group-hover:text-primary group-data-[state=checked]:text-primary text-sm font-medium transition-colors group-hover:font-semibold group-data-[state=checked]:font-semibold'>
        {label}
      </span>
      <span className='text-primary/60 group-hover:text-primary/80 group-data-[state=checked]:text-primary/80 text-xs font-medium transition-colors group-hover:font-semibold group-data-[state=checked]:font-semibold'>
        ({postsCount})
      </span>
    </div>
  );
};
