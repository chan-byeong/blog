'use client';

import { AdminControlButton } from '@/components/admin/admin-control-button';
import { AdminMetric } from '@/components/admin/admin-metric';
import { useAdminAnalyticsContext } from '@/components/admin/admin-analytics-provider';
import { TableHeader } from '@/components/ui/table-header';
import { getAdminAnalyticsWindowLabel } from '@/lib/admin-analytics-client';

export function AdminAnalyticsSidebar() {
  const {
    report,
    errorMessage,
    isLoading,
    selectedWindow,
    setSelectedWindow,
    windowOptions,
    refreshAnalytics,
    selectedGroup,
    selectGroup,
  } = useAdminAnalyticsContext();

  return (
    <div className='col-span-full grid grid-cols-subgrid gap-y-4 self-start md:col-span-4'>
      <TableHeader className='col-span-full'>
        <span className='text-primary col-span-3 col-start-1 text-xs font-semibold uppercase'>
          / overview
        </span>
      </TableHeader>

      <div className='col-span-full grid grid-cols-3 gap-2 text-xs font-semibold uppercase md:grid-cols-1'>
        <AdminMetric label='Sessions' value={report.totalSessions} />
        <AdminMetric label='Events' value={report.totalEvents} />
        <AdminMetric label='Top' value={report.topAttributionLabel} />
      </div>

      <TableHeader className='col-span-full mt-3'>
        <span className='text-primary col-span-3 col-start-1 text-xs font-semibold uppercase'>
          / sources
        </span>
      </TableHeader>

      <div className='col-span-full flex gap-1 overflow-x-auto md:flex-col'>
        {report.groups.length > 0 ? (
          report.groups.map((group) => (
            <AdminControlButton
              key={group.id}
              className='min-w-40 md:min-w-0'
              selected={selectedGroup?.id === group.id}
              onClick={() => selectGroup(group)}
            >
              <span className='block truncate'>{group.label}</span>
              <span className='block text-[11px] opacity-70'>
                {group.type} / {group.sessionCount} sessions
              </span>
            </AdminControlButton>
          ))
        ) : (
          <p className='text-primary/60 col-span-full text-xs font-semibold uppercase'>
            No attribution groups.
          </p>
        )}
      </div>

      <TableHeader className='col-span-full mt-3'>
        <span className='text-primary col-span-3 col-start-1 text-xs font-semibold uppercase'>
          / range
        </span>
      </TableHeader>

      <div
        className='col-span-full flex gap-1 overflow-x-auto md:flex-col'
        role='group'
        aria-label='analytics log range'
      >
        {windowOptions.map((option) => (
          <AdminControlButton
            key={option.value}
            className='min-w-16 md:min-w-0'
            selected={selectedWindow === option.value}
            onClick={() => setSelectedWindow(option.value)}
          >
            {option.label}
          </AdminControlButton>
        ))}
      </div>

      <AdminControlButton
        className='col-span-full mt-3'
        disabled={isLoading}
        onClick={() => void refreshAnalytics()}
      >
        {isLoading
          ? 'LOADING...'
          : `REFRESH / ${getAdminAnalyticsWindowLabel(selectedWindow)}`}
      </AdminControlButton>

      {errorMessage ? (
        <p className='text-destructive col-span-full text-xs font-semibold'>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
