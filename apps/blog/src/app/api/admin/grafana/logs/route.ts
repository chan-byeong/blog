import { Buffer } from 'node:buffer';
import { NextResponse, type NextRequest } from 'next/server';
import {
  createAdminAuthErrorResponse,
  requireAdminRequest,
} from '@/lib/admin/api';
import { buildAdminAnalyticsLokiQueryRangeSearchParams } from '@/lib/admin-analytics-loki';
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
  try {
    requireAdminRequest(request);
  } catch (error) {
    return createAdminAuthErrorResponse(error);
  }

  let queryParams: URLSearchParams;

  try {
    queryParams = buildAdminAnalyticsLokiQueryRangeSearchParams(
      request.nextUrl.searchParams
    );
  } catch (error) {
    if (error instanceof LokiQueryParamError) {
      return createLokiLogsErrorResponse(error.message, 400);
    }

    return createLokiLogsErrorResponse('Invalid query parameters', 400);
  }

  const config = getLokiConfig();

  if (config === null) {
    return createLokiLogsErrorResponse('Grafana Cloud is not configured', 500);
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
      return createLokiLogsErrorResponse('Failed to fetch Loki logs', 502);
    }

    const payload = (await response.json()) as LokiQueryRangeResponse;

    if (!isLokiQueryRangeResponse(payload)) {
      return createLokiLogsErrorResponse('Invalid Loki response', 502);
    }

    return NextResponse.json<LokiLogsSuccessResponse>({
      success: true,
      data: payload.data,
    });
  } catch {
    return createLokiLogsErrorResponse('Failed to fetch Loki logs', 502);
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
