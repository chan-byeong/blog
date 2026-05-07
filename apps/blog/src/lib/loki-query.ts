const DEFAULT_QUERY_RANGE_LIMIT = '100';
const MAX_QUERY_RANGE_LIMIT = 1000;
const DEFAULT_QUERY_RANGE_DIRECTION = 'backward';
const DEFAULT_QUERY_RANGE_SINCE = '1h';

const VALID_DIRECTIONS = new Set(['forward', 'backward']);

export class LokiQueryParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LokiQueryParamError';
  }
}

export function normalizeLokiQueryRangeUrl(lokiUrl: string): string {
  const normalizedUrl = lokiUrl.trim().replace(/\/+$/, '');

  if (normalizedUrl.endsWith('/loki/api/v1/push')) {
    return normalizedUrl.replace(
      /\/loki\/api\/v1\/push$/,
      '/loki/api/v1/query_range'
    );
  }

  if (normalizedUrl.endsWith('/loki/api/v1')) {
    return `${normalizedUrl}/query_range`;
  }

  return `${normalizedUrl}/loki/api/v1/query_range`;
}

export function buildLokiQueryRangeSearchParams(
  sourceParams: URLSearchParams
): URLSearchParams {
  const query = getTrimmedParam(sourceParams, 'query');

  if (query === undefined) {
    throw new LokiQueryParamError('Missing required query parameter: query');
  }

  const params = new URLSearchParams();
  params.set('query', query);
  appendTimeParams(params, sourceParams);
  params.set('limit', parseLimit(getTrimmedParam(sourceParams, 'limit')));
  params.set(
    'direction',
    parseDirection(getTrimmedParam(sourceParams, 'direction'))
  );

  return params;
}

function appendTimeParams(
  params: URLSearchParams,
  sourceParams: URLSearchParams
): void {
  const since = getTrimmedParam(sourceParams, 'since');
  const start = getTrimmedParam(sourceParams, 'start');
  const end = getTrimmedParam(sourceParams, 'end');

  if (since !== undefined) {
    params.set('since', since);
  }

  if (start !== undefined) {
    params.set('start', start);
  }

  if (end !== undefined) {
    params.set('end', end);
  }

  if (since === undefined && start === undefined && end === undefined) {
    params.set('since', DEFAULT_QUERY_RANGE_SINCE);
  }
}

function parseLimit(limit: string | undefined): string {
  if (limit === undefined) {
    return DEFAULT_QUERY_RANGE_LIMIT;
  }

  if (!/^\d+$/.test(limit)) {
    throw new LokiQueryParamError('limit must be an integer');
  }

  const numericLimit = Number(limit);

  if (numericLimit < 1 || numericLimit > MAX_QUERY_RANGE_LIMIT) {
    throw new LokiQueryParamError('limit must be between 1 and 1000');
  }

  return String(numericLimit);
}

function parseDirection(direction: string | undefined): string {
  if (direction === undefined) {
    return DEFAULT_QUERY_RANGE_DIRECTION;
  }

  if (!VALID_DIRECTIONS.has(direction)) {
    throw new LokiQueryParamError('direction must be forward or backward');
  }

  return direction;
}

function getTrimmedParam(
  params: URLSearchParams,
  name: string
): string | undefined {
  const value = params.get(name)?.trim();

  return value ? value : undefined;
}
