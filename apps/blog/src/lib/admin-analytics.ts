export type AdminAnalyticsAttributionType =
  | 'campaign'
  | 'resource'
  | 'referrer'
  | 'direct';

export interface ClientAnalyticsEvent {
  event: string;
  timestamp: string;
  session_id: string;
  pathname?: string;
  referrer?: string;
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  nav_button_label?: string;
  post_slug?: string;
  post_title?: string;
  [key: string]: unknown;
}

export interface AdminAnalyticsAttribution {
  id: string;
  type: AdminAnalyticsAttributionType;
  label: string;
}

export interface AdminAnalyticsSession {
  sessionId: string;
  attribution: AdminAnalyticsAttribution;
  events: ClientAnalyticsEvent[];
  eventCount: number;
  pageViewCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface AdminAnalyticsGroup {
  id: string;
  type: AdminAnalyticsAttributionType;
  label: string;
  sessions: AdminAnalyticsSession[];
  sessionCount: number;
  eventCount: number;
  lastSeenAt: string;
}

export interface AdminAnalyticsReport {
  groups: AdminAnalyticsGroup[];
  sessions: AdminAnalyticsSession[];
  totalSessions: number;
  totalEvents: number;
  topAttributionLabel: string;
}

type LokiStreamValue = [string, string];

interface LokiStreamResult {
  values?: unknown;
}

interface LokiQueryRangeData {
  result?: unknown;
}

const DIRECT_ATTRIBUTION: AdminAnalyticsAttribution = {
  id: 'direct:direct',
  type: 'direct',
  label: 'direct',
};

export function createAdminAnalyticsReport(
  lokiData: unknown
): AdminAnalyticsReport {
  const events = parseLokiClientAnalyticsEvents(lokiData);
  const sessions = createSessions(events);
  const groups = createGroups(sessions);

  return {
    groups,
    sessions,
    totalSessions: sessions.length,
    totalEvents: events.length,
    topAttributionLabel: groups[0]?.label ?? 'none',
  };
}

export function parseLokiClientAnalyticsEvents(
  lokiData: unknown
): ClientAnalyticsEvent[] {
  if (!isLokiQueryRangeData(lokiData) || !Array.isArray(lokiData.result)) {
    return [];
  }

  return lokiData.result.flatMap((streamResult) => {
    if (!isLokiStreamResult(streamResult)) {
      return [];
    }

    return streamResult.values.flatMap((value) => {
      if (!isLokiStreamValue(value)) {
        return [];
      }

      const [, line] = value;
      const event = parseClientAnalyticsEvent(line);

      return event === null ? [] : [event];
    });
  });
}

function createSessions(
  events: ClientAnalyticsEvent[]
): AdminAnalyticsSession[] {
  const eventsBySession = new Map<string, ClientAnalyticsEvent[]>();

  for (const event of events) {
    const currentEvents = eventsBySession.get(event.session_id) ?? [];
    currentEvents.push(event);
    eventsBySession.set(event.session_id, currentEvents);
  }

  return Array.from(eventsBySession.entries())
    .map(([sessionId, sessionEvents]) => {
      const sortedEvents = [...sessionEvents].sort(compareEventsByTimestamp);
      const firstEvent = sortedEvents[0];
      const lastEvent = sortedEvents[sortedEvents.length - 1];

      return {
        sessionId,
        attribution: getSessionAttribution(sortedEvents),
        events: sortedEvents,
        eventCount: sortedEvents.length,
        pageViewCount: sortedEvents.filter((event) => event.event === 'page_view')
          .length,
        firstSeenAt: firstEvent?.timestamp ?? '',
        lastSeenAt: lastEvent?.timestamp ?? '',
      };
    })
    .sort((a, b) => compareIsoDesc(a.lastSeenAt, b.lastSeenAt));
}

function createGroups(
  sessions: AdminAnalyticsSession[]
): AdminAnalyticsGroup[] {
  const groupsById = new Map<string, AdminAnalyticsSession[]>();

  for (const session of sessions) {
    const currentSessions = groupsById.get(session.attribution.id) ?? [];
    currentSessions.push(session);
    groupsById.set(session.attribution.id, currentSessions);
  }

  return Array.from(groupsById.values())
    .map((groupSessions) => {
      const [firstSession] = groupSessions;
      const sortedSessions = [...groupSessions].sort((a, b) =>
        compareIsoDesc(a.lastSeenAt, b.lastSeenAt)
      );

      return {
        id: firstSession?.attribution.id ?? DIRECT_ATTRIBUTION.id,
        type: firstSession?.attribution.type ?? DIRECT_ATTRIBUTION.type,
        label: firstSession?.attribution.label ?? DIRECT_ATTRIBUTION.label,
        sessions: sortedSessions,
        sessionCount: sortedSessions.length,
        eventCount: sortedSessions.reduce(
          (total, session) => total + session.eventCount,
          0
        ),
        lastSeenAt: sortedSessions[0]?.lastSeenAt ?? '',
      };
    })
    .sort((a, b) => {
      if (b.sessionCount !== a.sessionCount) {
        return b.sessionCount - a.sessionCount;
      }

      if (b.eventCount !== a.eventCount) {
        return b.eventCount - a.eventCount;
      }

      return compareIsoDesc(a.lastSeenAt, b.lastSeenAt);
    });
}

function getSessionAttribution(
  events: ClientAnalyticsEvent[]
): AdminAnalyticsAttribution {
  const campaign = findFirstStringValue(events, 'utm_campaign');

  if (campaign !== undefined) {
    return createAttribution('campaign', campaign);
  }

  const resource = findFirstStringValue(events, 'utm_source');

  if (resource !== undefined) {
    return createAttribution('resource', resource);
  }

  const referrer = findFirstStringValue(events, 'referrer');
  const referrerDomain =
    referrer === undefined ? undefined : getReferrerDomain(referrer);

  if (referrerDomain !== undefined) {
    return createAttribution('referrer', referrerDomain);
  }

  return DIRECT_ATTRIBUTION;
}

function createAttribution(
  type: AdminAnalyticsAttributionType,
  label: string
): AdminAnalyticsAttribution {
  return {
    id: `${type}:${label}`,
    type,
    label,
  };
}

function findFirstStringValue(
  events: ClientAnalyticsEvent[],
  key: keyof ClientAnalyticsEvent
): string | undefined {
  for (const event of events) {
    const value = event[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function getReferrerDomain(referrer: string): string | undefined {
  try {
    return new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return referrer.trim() || undefined;
  }
}

function parseClientAnalyticsEvent(line: string): ClientAnalyticsEvent | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(line);
  } catch {
    return null;
  }

  if (!isClientAnalyticsEvent(parsed)) {
    return null;
  }

  return parsed;
}

function compareEventsByTimestamp(
  a: ClientAnalyticsEvent,
  b: ClientAnalyticsEvent
): number {
  return a.timestamp.localeCompare(b.timestamp);
}

function compareIsoDesc(a: string, b: string): number {
  return b.localeCompare(a);
}

function isClientAnalyticsEvent(
  value: unknown
): value is ClientAnalyticsEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'event' in value &&
    'timestamp' in value &&
    'session_id' in value &&
    typeof value.event === 'string' &&
    typeof value.timestamp === 'string' &&
    typeof value.session_id === 'string' &&
    value.event.length > 0 &&
    value.timestamp.length > 0 &&
    value.session_id.length > 0
  );
}

function isLokiQueryRangeData(value: unknown): value is LokiQueryRangeData {
  return typeof value === 'object' && value !== null;
}

function isLokiStreamResult(value: unknown): value is {
  values: unknown[];
} & LokiStreamResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'values' in value &&
    Array.isArray(value.values)
  );
}

function isLokiStreamValue(value: unknown): value is LokiStreamValue {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'string' &&
    typeof value[1] === 'string'
  );
}
