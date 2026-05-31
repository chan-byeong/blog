import { Buffer } from 'node:buffer';
import { NextResponse, type NextRequest } from 'next/server';
import {
  createApplicationRequestContext,
  logApplicationResponse,
  withApplicationRequestId,
} from '@/lib/application-logger';
import {
  createAdminAuthErrorResponse,
  requireAdminRequest,
} from '@/lib/admin/api';
import { buildGrafanaLogsQueryRangeSearchParams } from '@/lib/admin-analytics-loki';
import {
  LokiQueryParamError,
  normalizeLokiQueryRangeUrl,
} from '@/lib/loki-query';

interface LokiLogsSuccessResponse {
  success: true;
  data: unknown;
}

interface LokiLogsErrorResponse {
  success: false;
  error: string;
}

interface LokiQueryRangeResponse {
  data: unknown;
}

interface LokiConfig {
  queryRangeUrl: string;
  username: string;
  apiKey: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<LokiLogsSuccessResponse | LokiLogsErrorResponse>> {
  const context = createApplicationRequestContext(request);

  try {
    requireAdminRequest(request);
  } catch (error) {
    return withApplicationRequestId(
      createAdminAuthErrorResponse(error),
      context
    );
  }

  let queryParams: URLSearchParams;

  try {
    queryParams = buildGrafanaLogsQueryRangeSearchParams(
      request.nextUrl.searchParams
    );
  } catch (error) {
    if (error instanceof LokiQueryParamError) {
      return withApplicationRequestId(
        createLokiLogsErrorResponse(error.message, 400),
        context
      );
    }

    return withApplicationRequestId(
      createLokiLogsErrorResponse('Invalid query parameters', 400),
      context
    );
  }

  const config = getLokiConfig();

  if (config === null) {
    return logApplicationResponse(
      createLokiLogsErrorResponse('Grafana Cloud is not configured', 500),
      context,
      {
        level: 'error',
        kind: 'app_error',
        message: 'Grafana Cloud configuration is unavailable.',
        context: 'admin_grafana_logs',
        error_code: 'missing_loki_configuration',
      }
    );
  }

  const lokiUrl = new URL(config.queryRangeUrl);
  lokiUrl.search = queryParams.toString();

  try {
    const response = await fetch(lokiUrl, {
      headers: {
        Authorization: createBasicAuthHeader(config.username, config.apiKey),
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return logApplicationResponse(
        createLokiLogsErrorResponse('Failed to fetch Loki logs', 502),
        context,
        {
          level: 'error',
          kind: 'app_error',
          message: 'Grafana Cloud Loki request failed.',
          context: 'admin_grafana_logs',
          error_code: 'loki_request_failed',
          meta: {
            upstream_status: response.status,
          },
        }
      );
    }

    const payload = (await response.json()) as LokiQueryRangeResponse;

    if (!isLokiQueryRangeResponse(payload)) {
      return logApplicationResponse(
        createLokiLogsErrorResponse('Invalid Loki response', 502),
        context,
        {
          level: 'error',
          kind: 'app_error',
          message: 'Grafana Cloud Loki response was invalid.',
          context: 'admin_grafana_logs',
          error_code: 'invalid_loki_response',
        }
      );
    }

    return withApplicationRequestId(
      NextResponse.json<LokiLogsSuccessResponse>({
        success: true,
        data: payload.data,
      }),
      context
    );
  } catch (error) {
    return logApplicationResponse(
      createLokiLogsErrorResponse('Failed to fetch Loki logs', 502),
      context,
      {
        level: 'error',
        kind: 'app_error',
        message: 'Grafana Cloud Loki request failed unexpectedly.',
        context: 'admin_grafana_logs',
        error_code: 'unexpected_loki_request_error',
        error,
      }
    );
  }
}

function getLokiConfig(): LokiConfig | null {
  const lokiUrl = process.env.GRAFANA_CLOUD_LOKI_URL?.trim();
  const username = process.env.GRAFANA_CLOUD_LOKI_USER?.trim();
  const apiKey = process.env.GRAFANA_CLOUD_LOKI_GET_API_KEY?.trim();

  if (!lokiUrl || !username || !apiKey) {
    return null;
  }

  const queryRangeUrl = normalizeLokiQueryRangeUrl(lokiUrl);

  try {
    new URL(queryRangeUrl);
  } catch {
    return null;
  }

  return {
    queryRangeUrl,
    username,
    apiKey,
  };
}

function createBasicAuthHeader(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

function createLokiLogsErrorResponse(
  error: string,
  status: number
): NextResponse<LokiLogsErrorResponse> {
  return NextResponse.json<LokiLogsErrorResponse>(
    { success: false, error },
    { status }
  );
}

function isLokiQueryRangeResponse(
  payload: unknown
): payload is LokiQueryRangeResponse {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    Object.prototype.hasOwnProperty.call(payload, 'data')
  );
}
