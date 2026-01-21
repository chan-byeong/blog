import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LogLevel, LogSource, MiddlewareLogEntry } from './lib/log-schema';

// Trace ID 생성 함수 (Nginx에서 전달받지 못한 경우 fallback)
function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// 봇 User-Agent 감지
function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const botPatterns = [
    /bot/i,
    /crawl/i,
    /spider/i,
    /slurp/i,
    /googlebot/i,
    /bingbot/i,
    /yandex/i,
    /baidu/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegram/i,
    /discordbot/i,
    /pingdom/i,
    /uptimerobot/i,
    /monitoring/i,
    /healthcheck/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /java/i,
    /apache-httpclient/i,
    /go-http-client/i,
  ];
  return botPatterns.some((pattern) => pattern.test(userAgent));
}

// Prefetch 요청 감지
function isPrefetch(request: NextRequest): boolean {
  // Next.js Link prefetch는 'purpose: prefetch' 또는 'sec-purpose: prefetch' 헤더를 보냄
  const purpose = request.headers.get('purpose');
  const secPurpose = request.headers.get('sec-purpose');
  // RSC prefetch 감지
  const rscHeader = request.headers.get('rsc');
  const nextRouterPrefetch = request.headers.get('next-router-prefetch');

  return (
    purpose === 'prefetch' ||
    secPurpose === 'prefetch' ||
    nextRouterPrefetch === '1' ||
    (rscHeader === '1' && request.nextUrl.searchParams.has('_rsc'))
  );
}

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const userAgent = request.headers.get('user-agent');

  // 봇 요청은 로깅하지 않음
  if (isBot(userAgent)) {
    return NextResponse.next();
  }

  // Nginx에서 전달한 traceId 사용, 없으면 새로 생성
  const traceId =
    request.headers.get('x-trace-id') ||
    request.headers.get('x-request-id') ||
    generateTraceId();

  // Prefetch 여부 감지
  const prefetch = isPrefetch(request);

  // 통합 스키마 기반 요청 로깅
  const requestLog: MiddlewareLogEntry = {
    timestamp: new Date().toISOString(),
    level: LogLevel.INFO,
    source: LogSource.MIDDLEWARE,
    message: 'HTTP Request',
    method: request.method,
    url: request.url,
    path: request.nextUrl.pathname,
    pathname: request.nextUrl.pathname,
    ip:
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      undefined,
    user_agent: userAgent || undefined,
    referer: request.headers.get('referer') || undefined,
    host: request.headers.get('host') || undefined,
    trace_id: traceId,
    search_params: Object.fromEntries(request.nextUrl.searchParams),
    // Prefetch 여부 기록 (Grafana에서 필터링 가능)
    is_prefetch: prefetch,
  };

  console.log(JSON.stringify(requestLog));

  // 요청 헤더에 traceId 전달 (Application에서 사용)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-trace-id', traceId);

  // 응답 시간 계산
  const durationMs = Date.now() - startTime;

  // 응답 생성 (헤더 포함)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 응답 헤더에 메타데이터 추가
  response.headers.set('X-Middleware-Time', `${durationMs}ms`);
  response.headers.set('X-Trace-ID', traceId);

  return response;
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 요청 경로에서 실행:
     * - api/health (헬스체크는 로깅 제외)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico).*)',
  ],
};
