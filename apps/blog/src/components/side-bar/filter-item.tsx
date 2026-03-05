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
      className='group flex cursor-pointer items-center gap-1.5 px-0.5 py-1 md:gap-2.5'
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
