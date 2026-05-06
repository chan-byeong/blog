import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildLokiQueryRangeSearchParams,
  normalizeLokiQueryRangeUrl,
} from './loki-query.ts';

test('normalizes a Loki push URL to query_range', () => {
  assert.equal(
    normalizeLokiQueryRangeUrl(
      'https://logs-prod.example.net/loki/api/v1/push'
    ),
    'https://logs-prod.example.net/loki/api/v1/query_range'
  );
});

test('normalizes a Loki API root URL to query_range', () => {
  assert.equal(
    normalizeLokiQueryRangeUrl('https://logs-prod.example.net/loki/api/v1'),
    'https://logs-prod.example.net/loki/api/v1/query_range'
  );
});

test('normalizes a Loki host URL to query_range', () => {
  assert.equal(
    normalizeLokiQueryRangeUrl('https://logs-prod.example.net'),
    'https://logs-prod.example.net/loki/api/v1/query_range'
  );
});

test('builds query_range params with defaults', () => {
  const params = buildLokiQueryRangeSearchParams(
    new URLSearchParams('query={container="blog-nextjs"}')
  );

  assert.equal(params.get('query'), '{container="blog-nextjs"}');
  assert.equal(params.get('since'), '1h');
  assert.equal(params.get('limit'), '100');
  assert.equal(params.get('direction'), 'backward');
});

test('preserves explicit query_range params', () => {
  const params = buildLokiQueryRangeSearchParams(
    new URLSearchParams(
      'query={container="blog-nextjs"}&start=1710000000000000000&end=1710000300000000000&limit=250&direction=forward'
    )
  );

  assert.equal(params.get('query'), '{container="blog-nextjs"}');
  assert.equal(params.get('start'), '1710000000000000000');
  assert.equal(params.get('end'), '1710000300000000000');
  assert.equal(params.get('limit'), '250');
  assert.equal(params.get('direction'), 'forward');
  assert.equal(params.has('since'), false);
});

test('rejects a missing Loki query', () => {
  assert.throws(
    () => buildLokiQueryRangeSearchParams(new URLSearchParams()),
    /Missing required query parameter: query/
  );
});

test('rejects an invalid limit', () => {
  assert.throws(
    () =>
      buildLokiQueryRangeSearchParams(
        new URLSearchParams('query={container="blog-nextjs"}&limit=abc')
      ),
    /limit must be an integer/
  );
});

test('rejects an over-limit limit', () => {
  assert.throws(
    () =>
      buildLokiQueryRangeSearchParams(
        new URLSearchParams('query={container="blog-nextjs"}&limit=1001')
      ),
    /limit must be between 1 and 1000/
  );
});

test('rejects an invalid direction', () => {
  assert.throws(
    () =>
      buildLokiQueryRangeSearchParams(
        new URLSearchParams(
          'query={container="blog-nextjs"}&direction=sideways'
        )
      ),
    /direction must be forward or backward/
  );
});
