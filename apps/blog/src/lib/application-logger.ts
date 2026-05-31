import { getOrCreateRequestId, setResponseRequestId } from '@/lib/request-id';

export interface ApplicationRequestContext {
  requestId: string;
  host: string;
  method: string;
  path: string;
  startedAtMs: number;
}

interface ApplicationLogInput {
  level: 'info' | 'warn' | 'error';
  kind: 'app_event' | 'app_error';
  message: string;
  status: number;
  context: string;
  error_code?: string;
  error?: unknown;
  meta?: Record<string, unknown>;
}

type ApplicationResponseLogInput = Omit<ApplicationLogInput, 'status'>;

interface WriteApplicationLogOptions {
  now?: () => Date;
  write?: (line: string) => void;
}

export function createApplicationRequestContext(
  request: Request,
  now: Date = new Date()
): ApplicationRequestContext {
  const url = new URL(request.url);

  return {
    requestId: getOrCreateRequestId(request.headers),
    host: getNormalizedHost(request.headers.get('host') ?? url.host),
    method: request.method,
    path: url.pathname,
    startedAtMs: now.getTime(),
  };
}

export function withApplicationRequestId<T extends Response>(
  response: T,
  context: ApplicationRequestContext
): T {
  return setResponseRequestId(response, context.requestId);
}

export function logApplicationResponse<T extends Response>(
  response: T,
  context: ApplicationRequestContext,
  input: ApplicationResponseLogInput
): T {
  writeApplicationLog(context, {
    ...input,
    status: response.status,
  });

  return withApplicationRequestId(response, context);
}

export function writeApplicationLog(
  context: ApplicationRequestContext,
  input: ApplicationLogInput,
  options: WriteApplicationLogOptions = {}
): void {
  const now = options.now?.() ?? new Date();
  const error = getErrorFields(input.error);
  const entry = {
    timestamp: now.toISOString(),
    level: input.level,
    source: 'application',
    kind: input.kind,
    message: input.message,
    request_id: context.requestId,
    host: context.host,
    method: context.method,
    path: context.path,
    status: input.status,
    duration_ms: Math.max(0, now.getTime() - context.startedAtMs),
    context: input.context,
    ...(input.error_code === undefined ? {} : { error_code: input.error_code }),
    ...error,
    ...(input.meta === undefined ? {} : { meta: input.meta }),
  };

  const write = options.write ?? process.stdout.write.bind(process.stdout);

  write(`${JSON.stringify(entry)}\n`);
}

function getNormalizedHost(host: string): string {
  return host.split(':')[0]?.toLowerCase() ?? '';
}

function getErrorFields(error: unknown): { error?: string; stack?: string } {
  if (error instanceof Error) {
    return {
      error: error.message,
      ...(error.stack === undefined ? {} : { stack: error.stack }),
    };
  }

  if (error === undefined) {
    return {};
  }

  return { error: String(error) };
}
