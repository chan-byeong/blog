/**
 * 통합 로그 스키마
 * Nginx, Middleware, Application 모두 동일한 스키마 사용
 * Grafana Loki/Prometheus 호환
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum LogSource {
  NGINX = 'nginx',
  MIDDLEWARE = 'middleware',
  APPLICATION = 'application',
}

/**
 * 통합 로그 엔트리 인터페이스
 * Nginx JSON 포맷과 호환되도록 설계
 */
export interface UnifiedLogEntry {
  // === 필수 공통 필드 ===
  timestamp: string; // ISO 8601 형식
  level: LogLevel; // 로그 레벨
  source: LogSource; // 로그 소스

  // === HTTP 요청 정보 ===
  method?: string; // GET, POST, etc.
  path?: string; // /posts/react-ssr
  url?: string; // 전체 URL (Middleware용)
  status?: number; // HTTP 상태 코드

  // === 네트워크 정보 ===
  ip?: string; // 클라이언트 IP
  user_agent?: string; // User-Agent
  referer?: string; // Referer

  // === 성능 메트릭 ===
  request_time?: number; // 전체 요청 처리 시간 (초)
  duration_ms?: number; // 밀리초 단위 (Application용)

  // === Upstream 정보 (Nginx 전용) ===
  upstream_addr?: string;
  upstream_status?: string;
  upstream_response_time?: string;
  upstream_connect_time?: string;
  upstream_header_time?: string;

  // === 인프라 정보 ===
  host?: string; // 호스트명
  protocol?: string; // HTTP/1.1, HTTP/2.0
  ssl_protocol?: string; // TLSv1.3
  ssl_cipher?: string;

  // === 요청 추적 ===
  trace_id?: string; // 분산 추적 ID
  request_id?: string; // 요청 고유 ID

  // === 애플리케이션 컨텍스트 ===
  user_id?: string; // 로그인 사용자 ID
  session_id?: string; // 세션 ID

  // === 메시지 및 데이터 ===
  message?: string; // 로그 메시지
  error?: string; // 에러 메시지
  stack?: string; // 스택 트레이스

  // === 커스텀 데이터 ===
  [key: string]: unknown;
}

/**
 * Nginx 로그를 UnifiedLogEntry 형식으로 변환하는 타입
 * (실제로는 Nginx 설정에서 직접 이 형식으로 출력)
 */
export interface NginxLogEntry extends UnifiedLogEntry {
  source: LogSource.NGINX;
  level: LogLevel.INFO | LogLevel.WARN | LogLevel.ERROR;
  body_bytes_sent?: number;
  http_x_forwarded_for?: string;
}

/**
 * Middleware 로그 타입
 */
export interface MiddlewareLogEntry extends UnifiedLogEntry {
  source: LogSource.MIDDLEWARE;
  pathname?: string;
  search_params?: Record<string, string>;
}

/**
 * Application 로그 타입
 */
export interface ApplicationLogEntry extends UnifiedLogEntry {
  source: LogSource.APPLICATION;
  context?: string; // 로그가 발생한 컨텍스트
  meta?: Record<string, unknown>;
}

/**
 * 로그 레벨 우선순위 (Grafana 필터링용)
 */
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/**
 * Grafana 레이블 추출 함수
 */
export function extractGrafanaLabels(
  log: UnifiedLogEntry
): Record<string, string> {
  return {
    level: log.level,
    source: log.source,
    method: log.method || 'unknown',
    status: log.status?.toString() || 'unknown',
    host: log.host || 'unknown',
  };
}
