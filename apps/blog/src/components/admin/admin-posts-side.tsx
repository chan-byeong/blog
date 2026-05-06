'use client';

import { AdminControlButton } from '@/components/admin/admin-control-button';
import { AdminMetric } from '@/components/admin/admin-metric';
import {
  useAdminPosts,
  type VisibilityFilter,
} from '@/components/admin/admin-posts-provider';
import { TableHeader } from '@/components/ui/table-header';

const FILTERS: Array<{ label: string; value: VisibilityFilter }> = [
  { label: 'ALL', value: 'all' },
  { label: 'VISIBLE', value: 'published' },
  { label: 'HIDDEN', value: 'hidden' },
];

export function AdminPostsSide() {
  const { counts, selectedFilter, setSelectedFilter, logout } =
    useAdminPosts();

  return (
    <div className='col-span-full grid grid-cols-subgrid gap-y-4 self-start md:col-span-4'>
      <TableHeader className='col-span-full'>
        <span className='text-primary col-span-3 col-start-1 text-xs font-semibold uppercase'>
          / overview
        </span>
      </TableHeader>

      <div className='col-span-full grid grid-cols-3 gap-2 text-xs font-semibold uppercase md:grid-cols-1'>
        <AdminMetric label='All' value={counts.all} />
        <AdminMetric label='Visible' value={counts.published} />
        <AdminMetric label='Hidden' value={counts.hidden} />
      </div>

      <TableHeader className='col-span-full mt-3'>
        <span className='text-primary col-span-3 col-start-1 text-xs font-semibold uppercase'>
          / filters
        </span>
      </TableHeader>

      <div
        className='col-span-full flex gap-1 overflow-x-auto md:flex-col'
        role='group'
        aria-label='visibility filters'
      >
        {FILTERS.map((filter) => (
          <AdminControlButton
            key={filter.value}
            className='min-w-24 md:min-w-0'
            selected={selectedFilter === filter.value}
            onClick={() => setSelectedFilter(filter.value)}
          >
            {filter.label}
          </AdminControlButton>
        ))}
      </div>

      <AdminControlButton className='col-span-full mt-3' onClick={logout}>
        LOGOUT
      </AdminControlButton>
    </div>
  );
}
