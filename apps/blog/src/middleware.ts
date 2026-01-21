import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LogLevel,
  LogSource,
  MiddlewareLogEntry,
  UTMParams,
} from './lib/log-schema';

// Trace ID 생성 함수 (Nginx에서 전달받지 못한 경우 fallback)
function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// UTM 파라미터 추출
function extractUTMParams(
  searchParams: URLSearchParams
): UTMParams | undefined {
  const utm: UTMParams = {};
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmTerm = searchParams.get('utm_term');
  const utmContent = searchParams.get('utm_content');

  if (utmSource) utm.utm_source = utmSource;
  if (utmMedium) utm.utm_medium = utmMedium;
  if (utmCampaign) utm.utm_campaign = utmCampaign;
  if (utmTerm) utm.utm_term = utmTerm;
  if (utmContent) utm.utm_content = utmContent;

  return Object.keys(utm).length > 0 ? utm : undefined;
}

// Referer에서 도메인 추출
function extractReferrerDomain(referer: string | null): string | undefined {
  if (!referer) return undefined;
  try {
    const url = new URL(referer);
    return url.hostname;
  } catch {
    return undefined;
  }
}

// 트래픽 소스 분류
function classifyTrafficSource(
  referer: string | null,
  utm: UTMParams | undefined,
  host: string | null
): string {
  // UTM 캠페인이 있으면 campaign
  if (utm?.utm_source || utm?.utm_campaign) {
    return 'campaign';
  }

  if (!referer) {
    return 'direct';
  }

  try {
    const refererUrl = new URL(referer);
    const refererHost = refererUrl.hostname;

    // 같은 도메인이면 internal
    if (host && refererHost.includes(host.replace('www.', ''))) {
      return 'internal';
    }

    // 검색엔진
    const searchEngines = [
      'google',
      'bing',
      'yahoo',
      'naver',
      'daum',
      'duckduckgo',
      'baidu',
    ];
    if (searchEngines.some((engine) => refererHost.includes(engine))) {
      return 'organic';
    }

    // 소셜 미디어
    const socialPlatforms = [
      'facebook',
      'twitter',
      'instagram',
      'linkedin',
      'youtube',
      'tiktok',
      'reddit',
      'pinterest',
    ];
    if (socialPlatforms.some((platform) => refererHost.includes(platform))) {
      return 'social';
    }

    // 그 외는 referral
    return 'referral';
  } catch {
    return 'direct';
  }
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

  // 유입 분석용 데이터 추출
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  const utm = extractUTMParams(request.nextUrl.searchParams);
  const referrerDomain = extractReferrerDomain(referer);
  const trafficSource = classifyTrafficSource(referer, utm, host);

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
    referer: referer || undefined,
    host: host || undefined,
    trace_id: traceId,
    search_params: Object.fromEntries(request.nextUrl.searchParams),
    // Prefetch 여부 기록 (Grafana에서 필터링 가능)
    is_prefetch: prefetch,
    // 유입 분석
    utm,
    referrer_domain: referrerDomain,
    traffic_source: trafficSource,
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
