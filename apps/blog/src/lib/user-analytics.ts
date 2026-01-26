import { EventType } from '@/types/event-type';

interface AnalyticsEvent {
  event: EventType;
  timestamp: string;
  session_id: string;
  pathname?: string;
  referrer?: string;
  utm_campaign?: string;
  post_slug?: string;
  post_title?: string;
  [key: string]: unknown;
}

/**
 * 세션 ID 생성 및 관리
 * sessionStorage를 사용하여 탭/세션 단위로 사용자 추적
 */
function getSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const stored = window.sessionStorage.getItem('analytics_session_id');
  if (stored) {
    return stored;
  }

  const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  window.sessionStorage.setItem('analytics_session_id', sessionId);
  return sessionId;
}

class UserAnalytics {
  private queue: AnalyticsEvent[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly flushInterval = 5000; // 5초마다 배치 전송
  private readonly maxQueueSize = 10;
  private isInitialized = false;

  /**
   * 클라이언트 사이드에서 초기화
   */
  init(): void {
    if (typeof window === 'undefined' || this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    this.setupBeforeUnload();
  }

  /**
   * 이벤트 추적
   */
  track(
    event: EventType,
    data?: Omit<AnalyticsEvent, 'event' | 'timestamp' | 'session_id'>
  ): void {
    if (typeof window === 'undefined') {
      return; // 클라이언트에서만 동작
    }

    // 자동 초기화
    if (!this.isInitialized) {
      this.init();
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      session_id: getSessionId(),
      ...data,
    };

    this.queue.push(analyticsEvent);

    // 큐가 가득 차면 즉시 전송
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  /**
   * 배치 전송 스케줄링
   */
  private scheduleFlush(): void {
    if (this.flushTimeout) {
      return; // 이미 스케줄됨
    }

    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * 큐에 있는 이벤트 전송
   */
  flush(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    // 배치로 한 번에 전송
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
      keepalive: true,
    }).catch(() => {
      // 실패 시 큐에 다시 추가 (재시도)
      this.queue.unshift(...events);
    });
  }

  /**
   * 페이지 이탈 시 남은 이벤트 전송
   */
  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      if (this.queue.length === 0) {
        return;
      }

      // sendBeacon은 페이지 이탈 시에도 안정적으로 전송
      const events = [...this.queue];
      this.queue = [];

      navigator.sendBeacon('/api/analytics', JSON.stringify({ events }));
    });
  }
}

// 싱글톤 인스턴스
export const userAnalytics = new UserAnalytics();
