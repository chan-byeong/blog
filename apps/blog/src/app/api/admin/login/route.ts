import { NextRequest, NextResponse } from 'next/server';
import {
  createApplicationRequestContext,
  logApplicationResponse,
  type ApplicationRequestContext,
} from '@/lib/application-logger';
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
  const context = createApplicationRequestContext(request);

  if (isBodyTooLarge(request.headers.get('content-length'))) {
    return createBodyTooLargeResponse(context);
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return createInvalidCredentialsResponse(context, 'invalid_request_body');
  }

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_SIZE) {
    return createBodyTooLargeResponse(context);
  }

  const payload = parseLoginPayload(rawBody);

  if (payload === null) {
    return createInvalidCredentialsResponse(context, 'invalid_credentials');
  }

  try {
    const isValidCredentials = await verifyAdminCredentials(
      payload.id,
      payload.password
    );

    if (!isValidCredentials) {
      return createInvalidCredentialsResponse(context, 'invalid_credentials');
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

    return logApplicationResponse(response, context, {
      level: 'info',
      kind: 'app_event',
      message: 'Admin login succeeded.',
      context: 'admin_login',
    });
  } catch (error) {
    if (error instanceof AdminAuthError && error.code === 'missing_admin_env') {
      return logApplicationResponse(
        NextResponse.json<LoginErrorResponse>(
          { success: false, error: 'Authentication unavailable' },
          { status: 500 }
        ),
        context,
        {
          level: 'error',
          kind: 'app_error',
          message: 'Admin login configuration is unavailable.',
          context: 'admin_login',
          error_code: error.code,
        }
      );
    }

    return logApplicationResponse(
      createInvalidCredentialsJsonResponse(),
      context,
      {
        level: 'error',
        kind: 'app_error',
        message: 'Admin login failed unexpectedly.',
        context: 'admin_login',
        error_code: 'unexpected_admin_login_error',
        error,
      }
    );
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

function createInvalidCredentialsJsonResponse(): NextResponse<LoginErrorResponse> {
  return NextResponse.json<LoginErrorResponse>(
    { success: false, error: 'Invalid credentials' },
    { status: 401 }
  );
}

function createInvalidCredentialsResponse(
  context: ApplicationRequestContext,
  errorCode: 'invalid_request_body' | 'invalid_credentials'
): NextResponse<LoginErrorResponse> {
  return logApplicationResponse(
    createInvalidCredentialsJsonResponse(),
    context,
    {
      level: 'warn',
      kind: 'app_event',
      message: 'Admin login credentials rejected.',
      context: 'admin_login',
      error_code: errorCode,
    }
  );
}

function createBodyTooLargeResponse(
  context: ApplicationRequestContext
): NextResponse<LoginErrorResponse> {
  return logApplicationResponse(
    NextResponse.json<LoginErrorResponse>(
      { success: false, error: 'Request body too large' },
      { status: 413 }
    ),
    context,
    {
      level: 'warn',
      kind: 'app_event',
      message: 'Admin login body rejected.',
      context: 'admin_login',
      error_code: 'body_too_large',
      meta: {
        max_body_size: MAX_BODY_SIZE,
      },
    }
  );
}
