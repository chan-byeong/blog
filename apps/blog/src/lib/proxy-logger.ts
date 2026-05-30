import {
  createHeadersWithRequestId,
  getOrCreateRequestId,
} from '@/lib/request-id';

const SKIPPABLE_PREFETCH_DECISIONS = new Set<ProxyDecision>([
  'allow_public_admin_api',
  'rewrite_admin_root',
  'allow_authorized_admin',
]);

export type ProxyDecision =
  | 'reject_unknown_host'
  | 'allow_public_admin_api'
  | 'reject_unauthorized_admin_api'
  | 'rewrite_unauthorized_admin_page'
  | 'rewrite_admin_root'
  | 'allow_authorized_admin'
  | 'admin_session_configuration_error';

export type AdminSessionState =
  | 'not_checked'
  | 'missing'
  | 'invalid'
  | 'valid'
  | 'configuration_error';

export interface ProxyDecisionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  source: 'proxy';
  kind: 'proxy_decision';
  message: 'Proxy request evaluated';
  request_id: string;
  host: string;
  method: string;
  path: string;
  proxy_decision: ProxyDecision;
  status?: number;
  is_admin_host: boolean;
  is_admin_path: boolean;
  is_admin_api_path: boolean;
  admin_session_state: AdminSessionState;
  is_prefetch: boolean;
  error_code?: 'missing_admin_env';
}

export type ProxyDecisionLogInput = Omit<
  ProxyDecisionLog,
  'timestamp' | 'source' | 'kind' | 'message'
>;

export interface ProxyRequestContext {
  requestId: string;
  downstreamHeaders: Headers;
  isPrefetch: boolean;
}

export function createProxyRequestContext(
  headers: Headers,
  searchParams: URLSearchParams
): ProxyRequestContext {
  const requestId = getOrCreateRequestId(headers);
  const downstreamHeaders = createHeadersWithRequestId(headers, requestId);

  return {
    requestId,
    downstreamHeaders,
    isPrefetch: isPrefetchRequest(headers, searchParams),
  };
}

export function logProxyDecision(input: ProxyDecisionLogInput): void {
  if (shouldSkipProxyDecisionLog(input.proxy_decision, input.is_prefetch)) {
    return;
  }

  const entry: ProxyDecisionLog = {
    timestamp: new Date().toISOString(),
    level: input.level,
    source: 'proxy',
    kind: 'proxy_decision',
    message: 'Proxy request evaluated',
    request_id: input.request_id,
    host: input.host,
    method: input.method,
    path: input.path,
    proxy_decision: input.proxy_decision,
    ...(input.status === undefined ? {} : { status: input.status }),
    is_admin_host: input.is_admin_host,
    is_admin_path: input.is_admin_path,
    is_admin_api_path: input.is_admin_api_path,
    admin_session_state: input.admin_session_state,
    is_prefetch: input.is_prefetch,
    ...(input.error_code === undefined ? {} : { error_code: input.error_code }),
  };

  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

function isPrefetchRequest(
  headers: Headers,
  searchParams: URLSearchParams
): boolean {
  return (
    headers.has('next-router-prefetch') ||
    headers.get('purpose')?.toLowerCase() === 'prefetch' ||
    headers.get('sec-purpose')?.toLowerCase().includes('prefetch') === true ||
    searchParams.has('_rsc')
  );
}

function shouldSkipProxyDecisionLog(
  decision: ProxyDecision,
  isPrefetch: boolean
): boolean {
  return isPrefetch && SKIPPABLE_PREFETCH_DECISIONS.has(decision);
}
