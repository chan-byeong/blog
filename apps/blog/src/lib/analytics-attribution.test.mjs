import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAnalyticsAttribution,
  mergeAnalyticsAttribution,
  parseStoredAnalyticsAttribution,
} from './analytics-attribution.ts';

const CAPTURED_AT = '2026-05-06T00:00:00.000Z';

test('builds attribution from UTM query parameters', () => {
  const result = buildAnalyticsAttribution({
    searchParams: new URLSearchParams(
      'utm_campaign=spring&utm_source=newsletter&utm_medium=email&utm_term=term&utm_content=hero'
    ),
    capturedAt: CAPTURED_AT,
  });

  assert.deepEqual(result, {
    utm_campaign: 'spring',
    utm_source: 'newsletter',
    utm_medium: 'email',
    utm_term: 'term',
    utm_content: 'hero',
    captured_at: CAPTURED_AT,
  });
});

test('includes referrer when present', () => {
  const result = buildAnalyticsAttribution({
    searchParams: new URLSearchParams(),
    referrer: 'https://example.com/articles/post',
    capturedAt: CAPTURED_AT,
  });

  assert.deepEqual(result, {
    referrer: 'https://example.com/articles/post',
    captured_at: CAPTURED_AT,
  });
});

test('returns null when no attribution fields are present', () => {
  const result = buildAnalyticsAttribution({
    searchParams: new URLSearchParams('page=2'),
    capturedAt: CAPTURED_AT,
  });

  assert.equal(result, null);
});

test('keeps existing attribution when incoming attribution is empty', () => {
  const existing = {
    utm_campaign: 'existing-campaign',
    utm_source: 'existing-source',
    captured_at: CAPTURED_AT,
  };

  assert.deepEqual(mergeAnalyticsAttribution(existing, null), existing);
});

test('updates attribution when incoming attribution has UTM values', () => {
  const existing = {
    utm_campaign: 'existing-campaign',
    utm_source: 'existing-source',
    captured_at: CAPTURED_AT,
  };
  const incoming = {
    utm_campaign: 'new-campaign',
    utm_source: 'new-source',
    captured_at: '2026-05-06T01:00:00.000Z',
  };

  assert.deepEqual(mergeAnalyticsAttribution(existing, incoming), incoming);
});

test('parses stored attribution and rejects invalid payloads', () => {
  assert.deepEqual(
    parseStoredAnalyticsAttribution(
      JSON.stringify({
        utm_campaign: 'spring',
        utm_source: '',
        captured_at: CAPTURED_AT,
      })
    ),
    {
      utm_campaign: 'spring',
      captured_at: CAPTURED_AT,
    }
  );
  assert.equal(parseStoredAnalyticsAttribution('not json'), null);
  assert.equal(parseStoredAnalyticsAttribution(JSON.stringify({})), null);
});
