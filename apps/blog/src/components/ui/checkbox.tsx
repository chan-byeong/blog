'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/lib/utils';

interface CheckboxProps extends React.ComponentPropsWithRef<
  typeof CheckboxPrimitive.Root
> {
  className?: string;
}

const Checkbox = ({ className, ...props }: CheckboxProps) => (
  <CheckboxPrimitive.Root
    className={cn(
      'peer h-3.5 w-3.5 shrink-0 rounded-[3px] border border-zinc-300 transition-all focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-zinc-900 dark:border-zinc-700',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center bg-transparent')}
    >
      <i className='hn hn-check text-xs'></i>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
