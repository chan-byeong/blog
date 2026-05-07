import 'server-only';

import { NextResponse, type NextRequest } from 'next/server';
import { AdminAuthError, requireAdmin } from './session';

const ADMIN_SESSION_COOKIE_NAME = 'admin_session';

interface AdminErrorResponse {
  success: false;
  error: string;
}

export function requireAdminRequest(request: NextRequest): void {
  requireAdmin(request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value);
}

export function createAdminAuthErrorResponse(
  error: unknown
): NextResponse<AdminErrorResponse> {
  if (error instanceof AdminAuthError && error.code === 'missing_admin_env') {
    return NextResponse.json<AdminErrorResponse>(
      { success: false, error: 'Authentication unavailable' },
      { status: 500 }
    );
  }

  return NextResponse.json<AdminErrorResponse>(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}

export function createAdminErrorResponse(
  error: string,
  status: number
): NextResponse<AdminErrorResponse> {
  return NextResponse.json<AdminErrorResponse>(
    { success: false, error },
    { status }
  );
}
