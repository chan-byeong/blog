'use client';

import {
  type AdminAnalyticsGroup,
  type AdminAnalyticsSession,
  type ClientAnalyticsEvent,
} from '@/lib/admin-analytics';
import { cn } from '@/lib/utils';
import { useAdminAnalyticsContext } from '@/components/admin/admin-analytics-provider';
import { TableHeader } from '@/components/ui/table-header';

const EVENT_LABELS: Record<string, string> = {
  first_visit: 'FIRST VISIT',
  page_view: 'PAGE VIEW',
  click_post: 'CLICK POST',
  read_post: 'READ POST',
  click_nav_button: 'BUTTON CLICK',
  theme_toggled: 'THEME TOGGLED',
  leave_site: 'LEAVE SITE',
};

export function AdminAnalytics() {
  const { report, selectedGroup, selectedSession, selectGroup, selectSession } =
    useAdminAnalyticsContext();

  return (
    <div className='col-span-full grid grid-cols-subgrid self-start md:col-start-6 md:row-span-2 md:row-start-2'>
      <AttributionTable
        groups={report.groups}
        selectedGroupId={selectedGroup?.id ?? null}
        onSelectGroup={selectGroup}
      />

      <SessionTable
        group={selectedGroup}
        selectedSessionId={selectedSession?.sessionId ?? null}
        onSelectSession={selectSession}
      />

      <SessionTimeline session={selectedSession} />
    </div>
  );
}

function AttributionTable({
  groups,
  selectedGroupId,
  onSelectGroup,
}: {
  groups: AdminAnalyticsGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (group: AdminAnalyticsGroup) => void;
}) {
  return (
    <div className='col-span-full grid grid-cols-subgrid'>
      <TableHeader className='col-span-full text-xs'>
        <span className='text-primary col-span-3 col-start-1 font-semibold uppercase'>
          / Source
        </span>
        <span className='text-primary col-span-2 col-start-4 font-semibold uppercase sm:col-span-3 sm:col-start-8'>
          / Sessions
        </span>
        <span className='text-primary col-span-2 col-start-6 font-semibold uppercase sm:col-span-3 sm:col-start-11'>
          / Events
        </span>
        <span className='text-primary hidden font-semibold uppercase sm:col-span-4 sm:col-start-14 sm:block'>
          / Last seen
        </span>
      </TableHeader>

      <ul className='col-span-full grid grid-cols-subgrid'>
        {groups.length > 0 ? (
          groups.map((group) => (
            <li
              key={group.id}
              className={cn(
                'border-border/50 text-primary col-span-full grid grid-cols-subgrid items-center border-b-[0.5px] px-1 py-2.5',
                selectedGroupId === group.id ? 'bg-accent/40' : ''
              )}
            >
              <button
                type='button'
                className='col-span-3 col-start-1 min-w-0 text-left'
                onClick={() => onSelectGroup(group)}
              >
                <span className='block truncate text-sm font-bold'>
                  {group.label}
                </span>
                <span className='text-primary/60 block text-xs font-semibold uppercase'>
                  {group.type}
                </span>
              </button>
              <span className='col-span-2 col-start-4 text-sm font-semibold sm:col-span-3 sm:col-start-8'>
                {group.sessionCount}
              </span>
              <span className='col-span-2 col-start-6 text-sm font-semibold sm:col-span-3 sm:col-start-11'>
                {group.eventCount}
              </span>
              <span className='text-primary/70 hidden text-xs font-semibold sm:col-span-4 sm:col-start-14 sm:block'>
                {formatDateTime(group.lastSeenAt)}
              </span>
            </li>
          ))
        ) : (
          <EmptyRow label='No analytics events in the selected window.' />
        )}
      </ul>
    </div>
  );
}

function SessionTable({
  group,
  selectedSessionId,
  onSelectSession,
}: {
  group?: AdminAnalyticsGroup;
  selectedSessionId: string | null;
  onSelectSession: (session: AdminAnalyticsSession) => void;
}) {
  return (
    <div className='col-span-full mt-8 grid grid-cols-subgrid'>
      <TableHeader className='col-span-full text-xs'>
        <span className='text-primary col-span-4 col-start-1 font-semibold uppercase'>
          / Sessions
        </span>
        <span className='text-primary col-span-2 col-start-5 font-semibold uppercase sm:col-span-3 sm:col-start-10'>
          / Events
        </span>
        <span className='text-primary hidden font-semibold uppercase sm:col-span-5 sm:col-start-13 sm:block'>
          / Path
        </span>
      </TableHeader>

      <ul className='col-span-full grid grid-cols-subgrid'>
        {group && group.sessions.length > 0 ? (
          group.sessions.map((session) => (
            <li
              key={session.sessionId}
              className={cn(
                'border-border/50 text-primary col-span-full grid grid-cols-subgrid items-center border-b-[0.5px] px-1 py-2.5',
                selectedSessionId === session.sessionId ? 'bg-accent/40' : ''
              )}
            >
              <button
                type='button'
                className='col-span-4 col-start-1 min-w-0 text-left'
                onClick={() => onSelectSession(session)}
              >
                <span className='block truncate text-sm font-bold'>
                  {session.sessionId}
                </span>
                <span className='text-primary/60 block text-xs font-semibold'>
                  {formatDateTime(session.firstSeenAt)} -{' '}
                  {formatDateTime(session.lastSeenAt)}
                </span>
              </button>
              <span className='col-span-2 col-start-5 text-sm font-semibold sm:col-span-3 sm:col-start-10'>
                {session.eventCount}
              </span>
              <span className='text-primary/70 hidden truncate text-xs font-semibold sm:col-span-5 sm:col-start-13 sm:block'>
                {getPrimaryPathname(session.events)}
              </span>
            </li>
          ))
        ) : (
          <EmptyRow label='No sessions in this source.' />
        )}
      </ul>
    </div>
  );
}

function SessionTimeline({ session }: { session?: AdminAnalyticsSession }) {
  return (
    <div className='col-span-full mt-8 grid grid-cols-subgrid'>
      <TableHeader className='col-span-full text-xs'>
        <span className='text-primary col-span-3 col-start-1 font-semibold uppercase'>
          / Timeline
        </span>
        <span className='text-primary col-span-5 col-start-4 font-semibold uppercase sm:col-span-8 sm:col-start-7'>
          / Detail
        </span>
      </TableHeader>

      <ul className='col-span-full grid grid-cols-subgrid'>
        {session ? (
          session.events.map((event, index) => (
            <li
              key={`${event.timestamp}-${event.event}-${index}`}
              className='border-border/50 text-primary col-span-full grid grid-cols-subgrid items-start border-b-[0.5px] px-1 py-2.5'
            >
              <span className='col-span-3 col-start-1 text-xs font-semibold uppercase sm:col-span-4'>
                {formatDateTime(event.timestamp)}
              </span>
              <div className='col-span-5 col-start-4 flex min-w-0 flex-col gap-0.5 sm:col-span-10 sm:col-start-7'>
                <span className='text-sm font-bold'>
                  {EVENT_LABELS[event.event] ?? event.event.toUpperCase()}
                </span>
                <span className='text-primary/70 truncate text-xs font-semibold'>
                  {getEventDetail(event)}
                </span>
              </div>
            </li>
          ))
        ) : (
          <EmptyRow label='Select a session to inspect events.' />
        )}
      </ul>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <li className='border-border/50 text-primary/60 col-span-full border-b-[0.5px] px-1 py-8 text-sm font-semibold uppercase'>
      {label}
    </li>
  );
}

function getPrimaryPathname(events: ClientAnalyticsEvent[]): string {
  return (
    events.find((event) => event.pathname)?.pathname ??
    events.find((event) => event.post_slug)?.post_slug ??
    '-'
  );
}

function getEventDetail(event: ClientAnalyticsEvent): string {
  if (event.pathname) {
    return event.pathname;
  }

  if (event.post_title) {
    return event.post_title;
  }

  if (event.nav_button_label) {
    return event.nav_button_label;
  }

  if (event.referrer) {
    return event.referrer;
  }

  return '-';
}

function formatDateTime(value: string): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
