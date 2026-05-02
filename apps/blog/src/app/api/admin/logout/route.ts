import { NextResponse } from 'next/server';
import { clearAdminSessionCookie } from '@/lib/admin/session';

interface LogoutSuccessResponse {
  success: true;
}

export async function POST(): Promise<NextResponse<LogoutSuccessResponse>> {
  const sessionCookie = clearAdminSessionCookie();
  const response = NextResponse.json<LogoutSuccessResponse>({ success: true });

  response.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.options
  );

  return response;
}
