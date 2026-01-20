import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LogLevel, LogSource, MiddlewareLogEntry } from './lib/log-schema';

// Trace ID 생성 함수
function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const traceId = generateTraceId();

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
    user_agent: request.headers.get('user-agent') || undefined,
    referer: request.headers.get('referer') || undefined,
    host: request.headers.get('host') || undefined,
    trace_id: traceId,
    search_params: Object.fromEntries(request.nextUrl.searchParams),
  };

  // JSON 한 줄로 로깅 (Grafana Loki 수집)
  console.log(JSON.stringify(requestLog));

  // 응답 생성
  const response = NextResponse.next();

  // 응답 시간 계산
  const durationMs = Date.now() - startTime;

  // 응답 헤더에 메타데이터 추가
  response.headers.set('X-Middleware-Time', `${durationMs}ms`);
  response.headers.set('X-Trace-ID', traceId);

  // 응답 로깅 (비동기로 처리하여 성능 영향 최소화)
  // Note: Middleware에서는 응답 상태를 알 수 없으므로 요청만 로깅
  // 실제 응답 상태는 Application Logger에서 처리

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
