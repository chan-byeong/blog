import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAdminAnalyticsRequestUrl,
  parseAdminAnalyticsResponsePayload,
} from './admin-analytics-client.ts';

test('builds the admin Loki analytics request URL', () => {
  assert.equal(
    buildAdminAnalyticsRequestUrl(),
    '/api/admin/grafana/logs?since=1d&limit=1000&direction=backward'
  );
});

test('does not include Loki query in the client request URL', () => {
  const url = new URL(
    buildAdminAnalyticsRequestUrl(),
    'https://byeoung.dev'
  );

  assert.equal(url.searchParams.has('query'), false);
});

test('builds analytics request URLs for selected log windows', () => {
  assert.match(buildAdminAnalyticsRequestUrl('5d'), /[?&]since=5d(&|$)/);
  assert.match(buildAdminAnalyticsRequestUrl('7d'), /[?&]since=7d(&|$)/);
  assert.match(buildAdminAnalyticsRequestUrl('30d'), /[?&]since=30d(&|$)/);
});

test('accepts a successful Loki logs payload', () => {
  const payload = {
    success: true,
    data: {
      result: [],
    },
  };

  const result = parseAdminAnalyticsResponsePayload(payload);

  assert.deepEqual(result, {
    success: true,
    data: payload.data,
  });
});

test('extracts a server error message', () => {
  const result = parseAdminAnalyticsResponsePayload({
    success: false,
    error: 'Failed to fetch Loki logs',
  });

  assert.deepEqual(result, {
    success: false,
    error: 'Failed to fetch Loki logs',
  });
});

test('rejects an invalid analytics response payload', () => {
  const result = parseAdminAnalyticsResponsePayload({
    success: true,
  });

  assert.deepEqual(result, {
    success: false,
    error: 'Failed to load analytics.',
  });
});
