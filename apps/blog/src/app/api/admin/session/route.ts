import { NextResponse, type NextRequest } from 'next/server';
import {
  createApplicationRequestContext,
  logApplicationResponse,
  withApplicationRequestId,
} from '@/lib/application-logger';
import {
  createAdminAuthErrorResponse,
  requireAdminRequest,
} from '@/lib/admin/api';
import { AdminAuthError } from '@/lib/admin/session';

const DEFAULT_ADMIN_REDIRECT_URL = 'https://admin.byeoung.dev';

interface SessionSuccessResponse {
  success: true;
  redirectTo: string;
}

interface SessionErrorResponse {
  success: false;
  error: string;
}

export function GET(
  request: NextRequest
): NextResponse<SessionSuccessResponse | SessionErrorResponse> {
  const context = createApplicationRequestContext(request);

  try {
    requireAdminRequest(request);
  } catch (error) {
    const response = createAdminAuthErrorResponse(error);

    if (error instanceof AdminAuthError && error.code === 'missing_admin_env') {
      return logApplicationResponse(response, context, {
        level: 'error',
        kind: 'app_error',
        message: 'Admin session configuration is unavailable.',
        context: 'admin_session',
        error_code: error.code,
      });
    }

    return withApplicationRequestId(response, context);
  }

  return withApplicationRequestId(
    NextResponse.json<SessionSuccessResponse>({
      success: true,
      redirectTo:
        process.env.NEXT_PUBLIC_ADMIN_URL || DEFAULT_ADMIN_REDIRECT_URL,
    }),
    context
  );
}
