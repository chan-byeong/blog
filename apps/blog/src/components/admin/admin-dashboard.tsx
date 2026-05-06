'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AdminTab = 'posts' | 'analytics';

interface AdminDashboardProps {
  children: ReactNode;
}

const ADMIN_TABS: Array<{ href: string; label: string; value: AdminTab }> = [
  { href: '/admin', label: 'POSTS', value: 'posts' },
  { href: '/admin/analytics', label: 'ANALYTICS', value: 'analytics' },
];

export const AdminDashboard = ({ children }: AdminDashboardProps) => {
  const pathname = usePathname();
  const selectedTab = getSelectedTab(pathname);

  return (
    <div className='col-span-full grid grid-cols-subgrid'>
      <div
        className='col-span-full mt-12 flex gap-1 overflow-x-auto md:mt-16'
        role='tablist'
        aria-label='admin sections'
      >
        {ADMIN_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.href}
            role='tab'
            aria-selected={selectedTab === tab.value}
            aria-current={selectedTab === tab.value ? 'page' : undefined}
            className={cn(
              'border-border/40 text-primary min-w-28 border px-2 py-1.5 text-left text-xs font-semibold tracking-tight transition-colors',
              selectedTab === tab.value
                ? 'bg-foreground text-background'
                : 'hover:bg-accent/50 bg-transparent'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
};

function getSelectedTab(pathname: string): AdminTab {
  if (pathname === '/admin/analytics') {
    return 'analytics';
  }

  return 'posts';
}
