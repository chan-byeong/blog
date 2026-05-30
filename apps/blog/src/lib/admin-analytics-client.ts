const ADMIN_ANALYTICS_LIMIT = '1000';
const ADMIN_ANALYTICS_ERROR_MESSAGE = 'Failed to load analytics.';

export type AdminAnalyticsWindow = '1d' | '5d' | '7d' | '30d';
export type AdminAnalyticsLoadState = 'idle' | 'loading' | 'success' | 'error';

export interface AdminAnalyticsWindowOption {
  value: AdminAnalyticsWindow;
  label: string;
}

export interface AdminAnalyticsPayloadSuccess {
  success: true;
  data: unknown;
}

export interface AdminAnalyticsPayloadError {
  success: false;
  error: string;
}

export type AdminAnalyticsPayloadResult =
  | AdminAnalyticsPayloadSuccess
  | AdminAnalyticsPayloadError;

export const ADMIN_ANALYTICS_WINDOW_OPTIONS: AdminAnalyticsWindowOption[] = [
  { value: '1d', label: '1D' },
  { value: '5d', label: '5D' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
];

export const DEFAULT_ADMIN_ANALYTICS_WINDOW: AdminAnalyticsWindow = '1d';

export function buildAdminAnalyticsRequestUrl(
  analyticsWindow: AdminAnalyticsWindow = DEFAULT_ADMIN_ANALYTICS_WINDOW
): string {
  const params = new URLSearchParams({
    since: analyticsWindow,
    limit: ADMIN_ANALYTICS_LIMIT,
    direction: 'backward',
  });

  return `/api/admin/grafana/logs?${params.toString()}`;
}

export function getAdminAnalyticsWindowLabel(
  analyticsWindow: AdminAnalyticsWindow = DEFAULT_ADMIN_ANALYTICS_WINDOW
): string {
  return (
    ADMIN_ANALYTICS_WINDOW_OPTIONS.find(
      (option) => option.value === analyticsWindow
    )?.label ?? analyticsWindow.toUpperCase()
  );
}

export function parseAdminAnalyticsResponsePayload(
  payload: unknown
): AdminAnalyticsPayloadResult {
  if (isAdminAnalyticsPayloadSuccess(payload)) {
    return {
      success: true,
      data: payload.data,
    };
  }

  if (isAdminAnalyticsPayloadError(payload)) {
    return {
      success: false,
      error: payload.error,
    };
  }

  return {
    success: false,
    error: ADMIN_ANALYTICS_ERROR_MESSAGE,
  };
}

function isAdminAnalyticsPayloadSuccess(
  value: unknown
): value is AdminAnalyticsPayloadSuccess {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'data' in value &&
    value.success === true
  );
}

function isAdminAnalyticsPayloadError(
  value: unknown
): value is AdminAnalyticsPayloadError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'error' in value &&
    value.success === false &&
    typeof value.error === 'string'
  );
}
