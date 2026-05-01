import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

const SIGNATURE_HEADER_PREFIX = 'sha256=';

export type GitHubWebhookSignatureErrorCode =
  | 'missing_secret'
  | 'missing_signature'
  | 'invalid_signature';

export class GitHubWebhookSignatureError extends Error {
  readonly code: GitHubWebhookSignatureErrorCode;
  readonly status: number;

  constructor(
    message: string,
    code: GitHubWebhookSignatureErrorCode,
    status: number
  ) {
    super(message);
    this.name = 'GitHubWebhookSignatureError';
    this.code = code;
    this.status = status;
  }
}

interface VerifyGitHubWebhookSignatureOptions {
  rawBody: string | Uint8Array;
  signature: string | null;
  secret?: string;
}

export function verifyGitHubWebhookSignature({
  rawBody,
  signature,
  secret = process.env.GITHUB_WEBHOOK_SECRET,
}: VerifyGitHubWebhookSignatureOptions): void {
  const normalizedSecret = secret?.trim();

  if (!normalizedSecret) {
    throw new GitHubWebhookSignatureError(
      'Missing required environment variable: GITHUB_WEBHOOK_SECRET.',
      'missing_secret',
      500
    );
  }

  if (!signature) {
    throw new GitHubWebhookSignatureError(
      'Missing required GitHub webhook signature header: X-Hub-Signature-256.',
      'missing_signature',
      403
    );
  }

  const expectedSignature = createSignature(rawBody, normalizedSecret);

  if (!isValidSignature(signature, expectedSignature)) {
    throw new GitHubWebhookSignatureError(
      'GitHub webhook signature does not match the request body.',
      'invalid_signature',
      403
    );
  }
}

function createSignature(rawBody: string | Uint8Array, secret: string): string {
  return `${SIGNATURE_HEADER_PREFIX}${createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')}`;
}

function isValidSignature(
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
