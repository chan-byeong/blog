import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAdminAnalyticsLokiQueryRangeSearchParams,
  buildGrafanaLogsQueryRangeSearchParams,
} from './admin-analytics-loki.ts';

test('buildGrafanaLogsQueryRangeSearchParams applies admin analytics query when query is omitted', () => {
  const params = buildGrafanaLogsQueryRangeSearchParams(
    new URLSearchParams('since=1d&limit=1000&direction=backward')
  );

  assert.equal(params.get('query'), '{source="client_analytics"}');
  assert.equal(params.get('since'), '1d');
  assert.equal(params.get('limit'), '1000');
  assert.equal(params.get('direction'), 'backward');
});

test('buildGrafanaLogsQueryRangeSearchParams preserves an explicit client query', () => {
  const params = buildGrafanaLogsQueryRangeSearchParams(
    new URLSearchParams(
      'query={container="blog-nginx"}&since=7d&limit=100&direction=forward'
    )
  );

  assert.equal(params.get('query'), '{container="blog-nginx"}');
  assert.equal(params.get('since'), '7d');
  assert.equal(params.get('limit'), '100');
  assert.equal(params.get('direction'), 'forward');
});

test('applies the admin analytics query when the client omits query', () => {
  const params = buildAdminAnalyticsLokiQueryRangeSearchParams(
    new URLSearchParams('since=1d&limit=1000&direction=backward')
  );

  assert.equal(params.get('query'), '{source="client_analytics"}');
  assert.equal(params.get('since'), '1d');
  assert.equal(params.get('limit'), '1000');
  assert.equal(params.get('direction'), 'backward');
});

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
