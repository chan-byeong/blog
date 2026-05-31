import { randomUUID } from 'node:crypto';

export const REQUEST_ID_HEADER = 'X-Request-ID';

const VALID_REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

export function getOrCreateRequestId(
  headers: Headers,
  createRequestId: () => string = randomUUID
): string {
  const requestId = headers.get(REQUEST_ID_HEADER)?.trim();

  return requestId && VALID_REQUEST_ID_PATTERN.test(requestId)
    ? requestId
    : createRequestId();
}

export function createHeadersWithRequestId(
  headers: Headers,
  requestId: string
): Headers {
  const downstreamHeaders = new Headers(headers);

  downstreamHeaders.set(REQUEST_ID_HEADER, requestId);

  return downstreamHeaders;
}

export function setResponseRequestId<T extends Response>(
  response: T,
  requestId: string
): T {
  response.headers.set(REQUEST_ID_HEADER, requestId);

  return response;
}
