export interface AnalyticsAttribution {
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  captured_at: string;
}

interface BuildAnalyticsAttributionInput {
  searchParams: Pick<URLSearchParams, 'get'>;
  referrer?: string;
  capturedAt?: string;
}

const ANALYTICS_ATTRIBUTION_STORAGE_KEY = 'analytics_attribution';
const UTM_FIELDS = [
  'utm_campaign',
  'utm_source',
  'utm_medium',
  'utm_term',
  'utm_content',
] as const;

export function buildAnalyticsAttribution({
  searchParams,
  referrer,
  capturedAt = new Date().toISOString(),
}: BuildAnalyticsAttributionInput): AnalyticsAttribution | null {
  const attribution: Partial<AnalyticsAttribution> = {};

  for (const field of UTM_FIELDS) {
    const value = searchParams.get(field)?.trim();

    if (value) {
      attribution[field] = value;
    }
  }

  const trimmedReferrer = referrer?.trim();

  if (trimmedReferrer) {
    attribution.referrer = trimmedReferrer;
  }

  if (!hasAttributionFields(attribution)) {
    return null;
  }

  return {
    ...attribution,
    captured_at: capturedAt,
  };
}

export function mergeAnalyticsAttribution(
  currentAttribution: AnalyticsAttribution | null,
  incomingAttribution: AnalyticsAttribution | null
): AnalyticsAttribution | null {
  if (incomingAttribution === null) {
    return currentAttribution;
  }

  if (hasUtmAttribution(incomingAttribution)) {
    return incomingAttribution;
  }

  return currentAttribution ?? incomingAttribution;
}

export function readStoredAnalyticsAttribution(): AnalyticsAttribution | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return parseStoredAnalyticsAttribution(
    window.sessionStorage.getItem(ANALYTICS_ATTRIBUTION_STORAGE_KEY)
  );
}

export function writeStoredAnalyticsAttribution(
  attribution: AnalyticsAttribution | null
): void {
  if (typeof window === 'undefined' || attribution === null) {
    return;
  }

  window.sessionStorage.setItem(
    ANALYTICS_ATTRIBUTION_STORAGE_KEY,
    JSON.stringify(attribution)
  );
}

export function captureStoredAnalyticsAttribution({
  searchParams,
  referrer,
}: {
  searchParams: Pick<URLSearchParams, 'get'>;
  referrer?: string;
}): void {
  const currentAttribution = readStoredAnalyticsAttribution();
  const incomingAttribution = buildAnalyticsAttribution({
    searchParams,
    referrer,
  });
  const nextAttribution = mergeAnalyticsAttribution(
    currentAttribution,
    incomingAttribution
  );

  if (nextAttribution !== currentAttribution) {
    writeStoredAnalyticsAttribution(nextAttribution);
  }
}

export function parseStoredAnalyticsAttribution(
  storedValue: string | null
): AnalyticsAttribution | null {
  if (!storedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedValue) as unknown;

    if (!isRecord(parsed)) {
      return null;
    }

    const attribution: Partial<AnalyticsAttribution> = {};

    for (const field of UTM_FIELDS) {
      const value = parsed[field];

      if (typeof value === 'string' && value.trim()) {
        attribution[field] = value.trim();
      }
    }

    if (typeof parsed.referrer === 'string' && parsed.referrer.trim()) {
      attribution.referrer = parsed.referrer.trim();
    }

    if (!hasAttributionFields(attribution)) {
      return null;
    }

    return {
      ...attribution,
      captured_at:
        typeof parsed.captured_at === 'string' && parsed.captured_at.trim()
          ? parsed.captured_at.trim()
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function hasUtmAttribution(attribution: AnalyticsAttribution): boolean {
  return UTM_FIELDS.some((field) => Boolean(attribution[field]));
}

function hasAttributionFields(
  attribution: Partial<AnalyticsAttribution>
): boolean {
  return (
    UTM_FIELDS.some((field) => Boolean(attribution[field])) ||
    Boolean(attribution.referrer)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
