'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface FilterItemProps extends React.ComponentPropsWithRef<typeof Checkbox> {
  label: string;
  postsCount: number;
}

export const FilterItem = ({
  label,
  postsCount,
  checked,
  defaultChecked,
  onCheckedChange,
  ...props
}: FilterItemProps) => {
  // TODO: 컨텍스트로 체크박스 상태 관리 -> 체크 여부에 따라 게시글 필터링
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
      className='flex items-center gap-2 group cursor-pointer'
      data-state={checkState ? 'checked' : 'unchecked'}
      onClick={() => handleCheckedChange(!checkState)}
    >
      <Checkbox
        checked={checkState}
        onCheckedChange={handleCheckedChange}
        {...props}
      />
      <span className='text-sm font-medium text-primary/80 transition-colors group-data-[state=checked]:text-primary group-data-[state=checked]:font-semibold hover:font-semibold hover:text-foreground'>
        {label}
      </span>
      <span className='text-xs font-medium text-primary/60 transition-colors group-data-[state=checked]:text-primary group-data-[state=checked]:font-semibold hover:font-semibold hover:text-foreground'>
        ({postsCount})
      </span>
    </div>
  );
};
