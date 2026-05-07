import { buildLokiQueryRangeSearchParams } from './loki-query.ts';

const ADMIN_ANALYTICS_QUERY = '{source="client_analytics"}';

export function buildAdminAnalyticsLokiQueryRangeSearchParams(
  sourceParams: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(sourceParams);
  params.set('query', ADMIN_ANALYTICS_QUERY);

  return buildLokiQueryRangeSearchParams(params);
}
