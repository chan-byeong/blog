'use client'

import { Checkbox } from '@/components/ui/checkbox'

interface FilterItemProps extends React.ComponentPropsWithRef<typeof Checkbox> {
  label: string
  postsCount: number
}

export const FilterItem = ({ label, postsCount, ...props }: FilterItemProps) => {
  // TODO: 컨텍스트로 체크박스 상태 관리 -> 체크 여부에 따라 게시글 필터링

  return (
    <div className='flex items-center gap-2'>
      <Checkbox {...props} />
      <span className='text-sm font-medium text-primary/80'>{label}</span>
      <span className='text-sm font-medium text-primary/80'>{postsCount}</span>
    </div>
  )
}
