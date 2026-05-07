import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';

const ADMIN_SESSION_COOKIE_NAME = 'admin_session';
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 2;
const ADMIN_ROLE = 'admin';

export interface AdminSessionPayload {
  sub: string;
  role: 'admin';
  iat: number;
  exp: number;
}

interface AdminSessionCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
  domain?: string;
}

interface AdminSessionCookie {
  name: typeof ADMIN_SESSION_COOKIE_NAME;
  value: string;
  options: AdminSessionCookieOptions;
}

export type AdminAuthErrorCode =
  | 'missing_admin_env'
  | 'invalid_credentials'
  | 'missing_session'
  | 'invalid_session'
  | 'expired_session'
  | 'forbidden';

export class AdminAuthError extends Error {
  readonly code: AdminAuthErrorCode;

  constructor(message: string, code: AdminAuthErrorCode) {
    super(message);
    this.name = 'AdminAuthError';
    this.code = code;
  }
}

export async function verifyAdminCredentials(
  id: string,
  password: string
): Promise<boolean> {
  const { adminId, adminPasswordHash } = getAdminCredentialsConfig();

  if (!id.trim() || !password) {
    return false;
  }

  if (id.trim() !== adminId) {
    return false;
  }

  try {
    return await bcrypt.compare(password, adminPasswordHash);
  } catch {
    return false;
  }
}

export function createAdminSessionCookie(
  now: Date = new Date()
): AdminSessionCookie {
  const { adminId, adminSessionSecret } = getAdminSessionConfig();
  const issuedAt = toUnixTimestamp(now);
  const expiresAt = issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS;
  const payload: AdminSessionPayload = {
    sub: adminId,
    role: ADMIN_ROLE,
    iat: issuedAt,
    exp: expiresAt,
  };
  const encodedPayload = encodeSessionPayload(payload);
  const signature = signSessionPayload(encodedPayload, adminSessionSecret);

  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    value: `${encodedPayload}.${signature}`,
    options: getSessionCookieOptions(ADMIN_SESSION_MAX_AGE_SECONDS),
  };
}

export function readAdminSession(
  cookieValue?: string | null,
  now: Date = new Date()
): AdminSessionPayload | null {
  if (!cookieValue) {
    return null;
  }

  const { adminId, adminSessionSecret } = getAdminSessionConfig();
  const parts = cookieValue.split('.');

  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = parts;
  const expectedSignature = signSessionPayload(
    encodedPayload,
    adminSessionSecret
  );

  if (!isEqualSignature(signature, expectedSignature)) {
    return null;
  }

  const payload = decodeSessionPayload(encodedPayload);

  if (payload === null) {
    return null;
  }

  if (payload.role !== ADMIN_ROLE || payload.sub !== adminId) {
    return null;
  }

  if (payload.exp <= toUnixTimestamp(now)) {
    return null;
  }

  return payload;
}

export function clearAdminSessionCookie(): AdminSessionCookie {
  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    value: '',
    options: getSessionCookieOptions(0),
  };
}

export function requireAdmin(
  cookieValue?: string | null,
  now: Date = new Date()
): AdminSessionPayload {
  if (!cookieValue) {
    throw new AdminAuthError(
      'Missing admin session cookie.',
      'missing_session'
    );
  }

  const session = readAdminSession(cookieValue, now);

  if (session === null) {
    throw new AdminAuthError(
      'Invalid admin session cookie.',
      'invalid_session'
    );
  }

  return session;
}

function getAdminCredentialsConfig(): {
  adminId: string;
  adminPasswordHash: string;
} {
  const adminId = process.env.ADMIN_ID?.trim();
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const adminSessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!adminId || !adminPasswordHash || !adminSessionSecret) {
    throw new AdminAuthError(
      'Missing required admin authentication environment variables.',
      'missing_admin_env'
    );
  }

  return {
    adminId,
    adminPasswordHash,
  };
}

function getAdminSessionConfig(): {
  adminId: string;
  adminSessionSecret: string;
} {
  const adminId = process.env.ADMIN_ID?.trim();
  const adminSessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!adminId || !adminSessionSecret) {
    throw new AdminAuthError(
      'Missing required admin session environment variables.',
      'missing_admin_env'
    );
  }

  return {
    adminId,
    adminSessionSecret,
  };
}

function getSessionCookieOptions(maxAge: number): AdminSessionCookieOptions {
  const cookieDomain = process.env.ADMIN_COOKIE_DOMAIN?.trim();

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };
}

function encodeSessionPayload(payload: AdminSessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodeSessionPayload(
  encodedPayload: string
): AdminSessionPayload | null {
  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as unknown;

    if (!isAdminSessionPayload(payload)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function signSessionPayload(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
}

function isEqualSignature(
  signature: string,
  expectedSignature: string
): boolean {
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
}

function isAdminSessionPayload(value: unknown): value is AdminSessionPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sub' in value &&
    'role' in value &&
    'iat' in value &&
    'exp' in value &&
    typeof value.sub === 'string' &&
    value.role === ADMIN_ROLE &&
    Number.isInteger(value.iat) &&
    Number.isInteger(value.exp)
  );
}

function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
