// apps/blog/src/components/ui/nav-button.tsx
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const navButtonVariants = cva(
  'flex items-center gap-1.5 px-2 py-1 text-xs tracking-tight transition-all',
  {
    variants: {
      active: {
        true: 'bg-foreground/90 text-background shadow-sm',
        false:
          'bg-zinc-100/80 text-zinc-600 hover:bg-foreground hover:text-background dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-foreground/90 dark:hover:text-background',
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
      <Link href={href} className={combinedClassName} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} onClick={onClick}>
      {content}
    </button>
  );
};
