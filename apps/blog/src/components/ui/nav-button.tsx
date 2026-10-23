'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const navButtonVariants = cva(
  'flex items-center gap-1.5 px-2 py-1 text-xs tracking-tight transition-all',
  {
    variants: {
      active: {
        true: 'bg-foreground text-background shadow-sm',
        false:
          'bg-nav-chip text-nav-chip-foreground hover:bg-foreground hover:text-background',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

interface NavButtonProps extends VariantProps<typeof navButtonVariants> {
  label: string;
  shortcutKey: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const NavButton = ({
  label,
  shortcutKey,
  href,
  active,
  onClick,
  className,
  ...props
}: NavButtonProps) => {
  const content = (
    <>
      <span className='text-xs font-medium'>[{shortcutKey}]</span>
      {label}
    </>
  );

  const combinedClassName = cn(navButtonVariants({ active }), className);

  if (href) {
    return (
      <Link
        href={href}
        className={combinedClassName}
        onClick={onClick}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type='button'
      className={combinedClassName}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
};
