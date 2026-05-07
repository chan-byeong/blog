import { NextResponse, type NextRequest } from 'next/server';
import { readAdminSession } from '@/lib/admin/session';

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

  if (isUnknownHost(host) || !isKnownHost(host)) {
    return createNotFoundResponse();
  }

  if (PUBLIC_ADMIN_API_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const isAdminRootRequest = isAdminHost(host) && pathname === '/';
  const needsAdminSession =
    isAdminRootRequest || isAdminPath(pathname) || isAdminApiPath(pathname);

  if (!needsAdminSession) {
    return NextResponse.next();
  }

  const session = readAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value
  );

  if (session === null) {
    return isAdminApiPath(pathname)
      ? createUnauthorizedJsonResponse()
      : createNotFoundPageRewrite(request);
  }

  if (isAdminRootRequest) {
    return NextResponse.rewrite(new URL('/admin', request.url));
  }

  return NextResponse.next();
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

function createNotFoundResponse(): NextResponse {
  return new NextResponse('Not Found', { status: 404 });
}

function createNotFoundPageRewrite(request: NextRequest): NextResponse {
  return NextResponse.rewrite(new URL('/_admin-not-found', request.url));
}

function createUnauthorizedJsonResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}
