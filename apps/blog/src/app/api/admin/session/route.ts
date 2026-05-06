import { NextResponse, type NextRequest } from 'next/server';
import {
  createAdminAuthErrorResponse,
  requireAdminRequest,
} from '@/lib/admin/api';

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
  try {
    requireAdminRequest(request);
  } catch (error) {
    return createAdminAuthErrorResponse(error);
  }

  return NextResponse.json<SessionSuccessResponse>({
    success: true,
    redirectTo: process.env.NEXT_PUBLIC_ADMIN_URL || DEFAULT_ADMIN_REDIRECT_URL,
  });
}
