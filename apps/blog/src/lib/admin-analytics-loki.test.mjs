import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAdminAnalyticsLokiQueryRangeSearchParams } from './admin-analytics-loki.ts';

test('overwrites a client-provided Loki query with the admin analytics query', () => {
  const params = buildAdminAnalyticsLokiQueryRangeSearchParams(
    new URLSearchParams(
      'query={job="anything"}&since=7d&limit=250&direction=forward'
    )
  );

  assert.equal(params.get('query'), '{source="client_analytics"}');
  assert.equal(params.get('since'), '7d');
  assert.equal(params.get('limit'), '250');
  assert.equal(params.get('direction'), 'forward');
});
