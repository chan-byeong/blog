import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createHeadersWithRequestId,
  getOrCreateRequestId,
  setResponseRequestId,
} from './request-id.ts';

test('reuses a valid request id header', () => {
  assert.equal(
    getOrCreateRequestId(new Headers({ 'X-Request-ID': 'nginx-request-123' })),
    'nginx-request-123'
  );
});

test('generates a fallback request id when the incoming value is invalid', () => {
  assert.equal(
    getOrCreateRequestId(
      new Headers({ 'X-Request-ID': 'invalid request id' }),
      () => 'generated-request-id'
    ),
    'generated-request-id'
  );
});

test('creates downstream headers without mutating the original headers', () => {
  const originalHeaders = new Headers({ Accept: 'application/json' });
  const downstreamHeaders = createHeadersWithRequestId(
    originalHeaders,
    'generated-request-id'
  );

  assert.equal(originalHeaders.get('X-Request-ID'), null);
  assert.equal(downstreamHeaders.get('X-Request-ID'), 'generated-request-id');
  assert.equal(downstreamHeaders.get('Accept'), 'application/json');
});

test('sets the request id response header', () => {
  const response = setResponseRequestId(
    new Response(null, { status: 204 }),
    'response-request-id'
  );

  assert.equal(response.headers.get('X-Request-ID'), 'response-request-id');
});
