import { NextRequest, NextResponse } from 'next/server';
import {
  AdminAuthError,
  createAdminSessionCookie,
  verifyAdminCredentials,
} from '@/lib/admin/session';

const MAX_BODY_SIZE = 4 * 1024;
const DEFAULT_ADMIN_REDIRECT_URL = 'https://admin.byeoung.dev';

interface LoginSuccessResponse {
  success: true;
  redirectTo: string;
}

interface LoginErrorResponse {
  success: false;
  error: string;
}

interface LoginPayload {
  id: string;
  password: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
  if (isBodyTooLarge(request.headers.get('content-length'))) {
    return createBodyTooLargeResponse();
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return createInvalidCredentialsResponse();
  }

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_SIZE) {
    return createBodyTooLargeResponse();
  }

  const payload = parseLoginPayload(rawBody);

  if (payload === null) {
    return createInvalidCredentialsResponse();
  }

  try {
    const isValidCredentials = await verifyAdminCredentials(
      payload.id,
      payload.password
    );

    if (!isValidCredentials) {
      return createInvalidCredentialsResponse();
    }

    const sessionCookie = createAdminSessionCookie();
    const response = NextResponse.json<LoginSuccessResponse>({
      success: true,
      redirectTo:
        process.env.NEXT_PUBLIC_ADMIN_URL || DEFAULT_ADMIN_REDIRECT_URL,
    });

    response.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.options
    );

    return response;
  } catch (error) {
    if (error instanceof AdminAuthError && error.code === 'missing_admin_env') {
      return NextResponse.json<LoginErrorResponse>(
        { success: false, error: 'Authentication unavailable' },
        { status: 500 }
      );
    }

    return createInvalidCredentialsResponse();
  }
}

function isBodyTooLarge(contentLengthHeader: string | null): boolean {
  if (contentLengthHeader === null) {
    return false;
  }

  const contentLength = Number(contentLengthHeader);

  return Number.isFinite(contentLength) && contentLength > MAX_BODY_SIZE;
}

function parseLoginPayload(rawBody: string): LoginPayload | null {
  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return null;
  }

  if (!isLoginPayload(payload)) {
    return null;
  }

  const id = payload.id.trim();

  if (!id || !payload.password) {
    return null;
  }

  if (id.length > 64 || payload.password.length > 256) {
    return null;
  }

  return {
    id,
    password: payload.password,
  };
}

function isLoginPayload(value: unknown): value is LoginPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'password' in value &&
    typeof value.id === 'string' &&
    typeof value.password === 'string'
  );
}

function createInvalidCredentialsResponse(): NextResponse<LoginErrorResponse> {
  return NextResponse.json<LoginErrorResponse>(
    { success: false, error: 'Invalid credentials' },
    { status: 401 }
  );
}

function createBodyTooLargeResponse(): NextResponse<LoginErrorResponse> {
  return NextResponse.json<LoginErrorResponse>(
    { success: false, error: 'Request body too large' },
    { status: 413 }
  );
}
