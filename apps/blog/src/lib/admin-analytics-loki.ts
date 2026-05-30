import { buildLokiQueryRangeSearchParams } from './loki-query.ts';

const ADMIN_ANALYTICS_QUERY = '{source="client_analytics"}';

export function buildAdminAnalyticsLokiQueryRangeSearchParams(
  sourceParams: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(sourceParams);
  params.set('query', ADMIN_ANALYTICS_QUERY);

  return buildLokiQueryRangeSearchParams(params);
}

export function buildGrafanaLogsQueryRangeSearchParams(
  sourceParams: URLSearchParams
): URLSearchParams {
  const query = sourceParams.get('query')?.trim();

  if (!query) {
    return buildAdminAnalyticsLokiQueryRangeSearchParams(sourceParams);
  }

  return buildLokiQueryRangeSearchParams(sourceParams);
}
