import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createAdminAnalyticsReport,
  parseLokiClientAnalyticsEvents,
} from './admin-analytics.ts';

const lokiData = {
  resultType: 'streams',
  result: [
    {
      stream: { source: 'client_analytics' },
      values: [
        [
          '1710000000000000000',
          JSON.stringify({
            event: 'page_view',
            timestamp: '2026-05-06T00:00:03.000Z',
            session_id: 'session-campaign',
            pathname: '/posts/a',
          }),
        ],
        [
          '1710000001000000000',
          JSON.stringify({
            event: 'first_visit',
            timestamp: '2026-05-06T00:00:01.000Z',
            session_id: 'session-campaign',
            pathname: '/',
            utm_campaign: 'spring-launch',
            utm_source: 'newsletter',
            referrer: 'https://google.com/search',
          }),
        ],
        [
          '1710000002000000000',
          JSON.stringify({
            event: 'click_nav_button',
            timestamp: '2026-05-06T00:00:05.000Z',
            session_id: 'session-campaign',
            nav_button_label: 'GITHUB',
          }),
        ],
      ],
    },
    {
      stream: { source: 'client_analytics' },
      values: [
        [
          '1710000003000000000',
          JSON.stringify({
            event: 'first_visit',
            timestamp: '2026-05-06T01:00:00.000Z',
            session_id: 'session-resource',
            utm_source: 'twitter',
            referrer: 'https://t.co/example',
          }),
        ],
        [
          '1710000004000000000',
          JSON.stringify({
            event: 'first_visit',
            timestamp: '2026-05-06T02:00:00.000Z',
            session_id: 'session-referrer',
            referrer: 'https://news.ycombinator.com/item?id=1',
          }),
        ],
        [
          '1710000005000000000',
          JSON.stringify({
            event: 'first_visit',
            timestamp: '2026-05-06T03:00:00.000Z',
            session_id: 'session-direct',
          }),
        ],
      ],
    },
  ],
};

test('parses Loki stream values into client analytics events', () => {
  const events = parseLokiClientAnalyticsEvents(lokiData);

  assert.equal(events.length, 6);
  assert.equal(events[0]?.event, 'page_view');
  assert.equal(events[0]?.session_id, 'session-campaign');
});

test('groups sessions by campaign before resource', () => {
  const report = createAdminAnalyticsReport(lokiData);
  const campaignGroup = report.groups.find(
    (group) => group.label === 'spring-launch'
  );

  assert.equal(campaignGroup?.type, 'campaign');
  assert.equal(campaignGroup?.sessionCount, 1);
  assert.equal(campaignGroup?.eventCount, 3);
});

test('falls back to resource, referrer, then direct', () => {
  const report = createAdminAnalyticsReport(lokiData);

  assert.equal(
    report.groups.find((group) => group.label === 'twitter')?.type,
    'resource'
  );
  assert.equal(
    report.groups.find((group) => group.label === 'news.ycombinator.com')?.type,
    'referrer'
  );
  assert.equal(
    report.groups.find((group) => group.label === 'direct')?.type,
    'direct'
  );
});

test('builds session timelines ordered by timestamp', () => {
  const report = createAdminAnalyticsReport(lokiData);
  const session = report.sessions.find(
    (currentSession) => currentSession.sessionId === 'session-campaign'
  );

  assert.deepEqual(
    session?.events.map((event) => event.event),
    ['first_visit', 'page_view', 'click_nav_button']
  );
  assert.equal(session?.firstSeenAt, '2026-05-06T00:00:01.000Z');
  assert.equal(session?.lastSeenAt, '2026-05-06T00:00:05.000Z');
});
