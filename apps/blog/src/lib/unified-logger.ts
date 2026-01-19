import { LogLevel, LogSource, ApplicationLogEntry } from './log-schema';

// 요청 추적을 위한 trace ID 생성
function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

class UnifiedLogger {
  private traceId: string | null = null;

  /**
   * Trace ID 설정 (요청 시작 시 호출)
   */
  setTraceId(traceId: string): void {
    this.traceId = traceId;
  }

  /**
   * Trace ID 생성 및 반환
   */
  createTraceId(): string {
    const traceId = generateTraceId();
    this.setTraceId(traceId);
    return traceId;
  }

  /**
   * Trace ID 초기화
   */
  clearTraceId(): void {
    this.traceId = null;
  }

  /**
   * 통합 로그 작성
   */
  private writeLog(entry: ApplicationLogEntry): void {
    const logEntry = {
      ...entry,
      ...(this.traceId && { trace_id: this.traceId }),
    };
    const logLine = JSON.stringify(logEntry);

    if (typeof window === 'undefined') {
      // console.log 대신 process.stdout.write 사용 (로그 잘림 방지)
      process.stdout.write(logLine + '\n');
    } else {
      fetch('/api/logs', {
        method: 'POST',
        body: logLine,
        keepalive: true,
      });
    }
  }

  /**
   * 공통 로그 엔트리 생성
   */
  private createBaseEntry(
    level: LogLevel,
    message: string
  ): ApplicationLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      source: LogSource.APPLICATION,
      message,
    };
  }

  /**
   * DEBUG 로그
   */
  debug(message: string, data?: Partial<ApplicationLogEntry>): void {
    const entry = {
      ...this.createBaseEntry(LogLevel.DEBUG, message),
      ...data,
    };
    this.writeLog(entry);
  }

  /**
   * INFO 로그
   */
  info(message: string, data?: Partial<ApplicationLogEntry>): void {
    const entry = {
      ...this.createBaseEntry(LogLevel.INFO, message),
      ...data,
    };
    this.writeLog(entry);
  }

  /**
   * WARN 로그
   */
  warn(message: string, data?: Partial<ApplicationLogEntry>): void {
    const entry = {
      ...this.createBaseEntry(LogLevel.WARN, message),
      ...data,
    };
    this.writeLog(entry);
  }

  /**
   * ERROR 로그
   */
  error(
    message: string,
    error?: Error,
    data?: Partial<ApplicationLogEntry>
  ): void {
    const entry = {
      ...this.createBaseEntry(LogLevel.ERROR, message),
      error: error?.message,
      stack: error?.stack,
      ...data,
    };
    this.writeLog(entry);
  }
}

// 싱글톤 인스턴스
export const logger = new UnifiedLogger();
