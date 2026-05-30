import { NextResponse, type NextRequest } from 'next/server';
import {
  createApplicationRequestContext,
  logApplicationResponse,
} from '@/lib/application-logger';
import { clearAdminSessionCookie } from '@/lib/admin/session';

interface LogoutSuccessResponse {
  success: true;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<LogoutSuccessResponse>> {
  const context = createApplicationRequestContext(request);
  const sessionCookie = clearAdminSessionCookie();
  const response = NextResponse.json<LogoutSuccessResponse>({ success: true });

  response.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.options
  );

  return logApplicationResponse(response, context, {
    level: 'info',
    kind: 'app_event',
    message: 'Admin logout succeeded.',
    context: 'admin_logout',
  });
}
