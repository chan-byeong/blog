import { NextResponse, type NextRequest } from 'next/server';
import { AdminAuthError, readAdminSession } from '@/lib/admin/session';
import {
  createProxyRequestContext,
  logProxyDecision,
  type ProxyRequestContext,
} from '@/lib/proxy-logger';

const ADMIN_HOSTS = new Set(['admin.byeoung.dev', 'admin.localhost']);
const PUBLIC_HOSTS = new Set([
  'byeoung.dev',
  'www.byeoung.dev',
  'resume.byeoung.dev',
]);
const DEVELOPMENT_HOSTS = new Set(['localhost', '127.0.0.1']);
const ADMIN_SESSION_COOKIE_NAME = 'admin_session';
const PUBLIC_ADMIN_API_PATHS = new Set([
  '/api/admin/login',
  '/api/admin/logout',
  '/api/admin/session',
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = getNormalizedHost(request);
  const adminHost = isAdminHost(host);
  const adminPath = isAdminPath(pathname);
  const adminApiPath = isAdminApiPath(pathname);
  const requestContext = createProxyRequestContext(
    request.headers,
    request.nextUrl.searchParams
  );
  const logContext = {
    request_id: requestContext.requestId,
    host,
    method: request.method,
    path: pathname,
    is_admin_host: adminHost,
    is_admin_path: adminPath,
    is_admin_api_path: adminApiPath,
    is_prefetch: requestContext.isPrefetch,
  };

  if (isUnknownHost(host) || !isKnownHost(host)) {
    logProxyDecision({
      ...logContext,
      level: 'warn',
      proxy_decision: 'reject_unknown_host',
      status: 404,
      admin_session_state: 'not_checked',
    });

    return createNotFoundResponse(requestContext);
  }

  if (PUBLIC_ADMIN_API_PATHS.has(pathname)) {
    logProxyDecision({
      ...logContext,
      level: 'info',
      proxy_decision: 'allow_public_admin_api',
      admin_session_state: 'not_checked',
    });

    return createNextResponse(requestContext);
  }

  const isAdminRootRequest = adminHost && pathname === '/';
  const needsAdminSession = isAdminRootRequest || adminPath || adminApiPath;

  if (!needsAdminSession) {
    return createNextResponse(requestContext);
  }

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  let session;

  try {
    session = readAdminSession(sessionCookie);
  } catch (error) {
    if (error instanceof AdminAuthError && error.code === 'missing_admin_env') {
      logProxyDecision({
        ...logContext,
        level: 'error',
        proxy_decision: 'admin_session_configuration_error',
        status: 500,
        admin_session_state: 'configuration_error',
        error_code: 'missing_admin_env',
      });

      return createInternalServerErrorResponse(adminApiPath, requestContext);
    }

    throw error;
  }

  if (session === null) {
    logProxyDecision({
      ...logContext,
      level: 'warn',
      proxy_decision: adminApiPath
        ? 'reject_unauthorized_admin_api'
        : 'rewrite_unauthorized_admin_page',
      ...(adminApiPath ? { status: 401 } : {}),
      admin_session_state: sessionCookie ? 'invalid' : 'missing',
    });

    return adminApiPath
      ? createUnauthorizedJsonResponse(requestContext)
      : createNotFoundPageRewrite(request, requestContext);
  }

  if (isAdminRootRequest) {
    logProxyDecision({
      ...logContext,
      level: 'info',
      proxy_decision: 'rewrite_admin_root',
      admin_session_state: 'valid',
    });

    return createRewriteResponse(
      new URL('/admin', request.url),
      requestContext
    );
  }

  logProxyDecision({
    ...logContext,
    level: 'info',
    proxy_decision: 'allow_authorized_admin',
    admin_session_state: 'valid',
  });

  return createNextResponse(requestContext);
}

export const config = {
  matcher: ['/', '/admin/:path*', '/api/admin/:path*'],
};

function getNormalizedHost(request: NextRequest): string {
  const host = request.headers.get('host') ?? '';

  return host.split(':')[0]?.toLowerCase() ?? '';
}

function isAdminHost(host: string): boolean {
  return ADMIN_HOSTS.has(host);
}

function isPublicHost(host: string): boolean {
  return PUBLIC_HOSTS.has(host);
}

function isDevelopmentHost(host: string): boolean {
  return DEVELOPMENT_HOSTS.has(host);
}

function isKnownHost(host: string): boolean {
  return isAdminHost(host) || isPublicHost(host) || isDevelopmentHost(host);
}

function isUnknownHost(host: string): boolean {
  return !host;
}

function isAdminApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/admin/');
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

function createNotFoundResponse(context: ProxyRequestContext): NextResponse {
  return withRequestId(new NextResponse('Not Found', { status: 404 }), context);
}

function createNotFoundPageRewrite(
  request: NextRequest,
  context: ProxyRequestContext
): NextResponse {
  return createRewriteResponse(
    new URL('/_admin-not-found', request.url),
    context
  );
}

function createUnauthorizedJsonResponse(
  context: ProxyRequestContext
): NextResponse {
  return withRequestId(
    NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    ),
    context
  );
}

function createInternalServerErrorResponse(
  isAdminApiRequest: boolean,
  context: ProxyRequestContext
): NextResponse {
  const response = isAdminApiRequest
    ? NextResponse.json(
        { success: false, error: 'Internal Server Error' },
        { status: 500 }
      )
    : new NextResponse('Internal Server Error', { status: 500 });

  return withRequestId(response, context);
}

function createNextResponse(context: ProxyRequestContext): NextResponse {
  return withRequestId(
    NextResponse.next({
      request: {
        headers: context.downstreamHeaders,
      },
    }),
    context
  );
}

function createRewriteResponse(
  destination: URL,
  context: ProxyRequestContext
): NextResponse {
  return withRequestId(
    NextResponse.rewrite(destination, {
      request: {
        headers: context.downstreamHeaders,
      },
    }),
    context
  );
}

function withRequestId(
  response: NextResponse,
  context: ProxyRequestContext
): NextResponse {
  response.headers.set('X-Request-ID', context.requestId);

  return response;
}
