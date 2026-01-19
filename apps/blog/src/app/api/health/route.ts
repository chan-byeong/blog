import { NextResponse } from 'next/server';
import { logger } from '@/lib/unified-logger';

export async function GET(request: Request) {
  try {
    // 헬스체크는 빈번하므로 DEBUG 레벨로 로깅
    logger.debug('Health check requested', {
      path: '/api/health',
      meta: {
        uptime: process.uptime(),
      },
    });

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Health check failed', error as Error, {
      path: '/api/health',
    });
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    );
  }
}
