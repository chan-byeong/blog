import { NextRequest, NextResponse } from 'next/server';
import { EventType } from '@/types/event-type';

const MAX_BODY_SIZE = 50 * 1024; // 50KB (배치 이벤트 허용)

interface AnalyticsEvent {
  event: EventType;
  timestamp: string;
  session_id: string;
  [key: string]: unknown;
}

interface AnalyticsPayload {
  events: AnalyticsEvent[];
}

export async function POST(req: NextRequest) {
  try {
    const contentLength = parseInt(req.headers.get('content-length') || '0');

    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Request body too large' },
        { status: 413 }
      );
    }

    const body = (await req.json()) as AnalyticsPayload;

    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload format' },
        { status: 400 }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // 각 이벤트를 개별 로그로 출력 (Promtail에서 수집)
    for (const event of body.events) {
      const logEntry = {
        ...event,
        source: 'client_analytics',
        client_ip: clientIp,
        user_agent: userAgent,
        received_at: new Date().toISOString(),
      };

      // stdout으로 JSON 출력 (Promtail → Grafana Cloud)
      process.stdout.write(JSON.stringify(logEntry) + '\n');
    }

    return NextResponse.json({ success: true, received: body.events.length });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }
    console.error('Unknown error', error);
    return NextResponse.json(
      { success: false, error: 'Unknown error' },
      { status: 500 }
    );
  }
}
