'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createAdminAnalyticsReport,
  type AdminAnalyticsReport,
} from '@/lib/admin-analytics';
import {
  buildAdminAnalyticsRequestUrl,
  DEFAULT_ADMIN_ANALYTICS_WINDOW,
  parseAdminAnalyticsResponsePayload,
  ADMIN_ANALYTICS_WINDOW_OPTIONS,
  type AdminAnalyticsWindow,
  type AdminAnalyticsWindowOption,
  type AdminAnalyticsLoadState,
} from '@/lib/admin-analytics-client';

interface UseAdminAnalyticsResult {
  report: AdminAnalyticsReport;
  loadState: AdminAnalyticsLoadState;
  errorMessage: string | null;
  isLoading: boolean;
  selectedWindow: AdminAnalyticsWindow;
  setSelectedWindow: (analyticsWindow: AdminAnalyticsWindow) => void;
  windowOptions: AdminAnalyticsWindowOption[];
  refreshAnalytics: () => Promise<void>;
}

export function useAdminAnalytics(): UseAdminAnalyticsResult {
  const [selectedWindow, setSelectedWindow] = useState<AdminAnalyticsWindow>(
    DEFAULT_ADMIN_ANALYTICS_WINDOW
  );
  const [lokiData, setLokiData] = useState<unknown>(null);
  const [loadState, setLoadState] = useState<AdminAnalyticsLoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const report = useMemo(
    () => createAdminAnalyticsReport(lokiData),
    [lokiData]
  );

  const refreshAnalytics = useCallback(async () => {
    setLoadState('loading');
    setErrorMessage(null);

    try {
      const response = await fetch(
        buildAdminAnalyticsRequestUrl(selectedWindow),
        {
          method: 'GET',
          cache: 'no-store',
        }
      );
      const payload = parseAdminAnalyticsResponsePayload(await response.json());

      if (!response.ok || !payload.success) {
        const nextErrorMessage = payload.success
          ? 'Failed to load analytics.'
          : payload.error;

        throw new Error(nextErrorMessage);
      }
      setLokiData(payload.data);
      setLoadState('success');
    } catch (error) {
      setLoadState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load analytics.'
      );
    }
  }, [selectedWindow]);

  useEffect(() => {
    void refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    report,
    loadState,
    errorMessage,
    isLoading: loadState === 'loading',
    selectedWindow,
    setSelectedWindow,
    windowOptions: ADMIN_ANALYTICS_WINDOW_OPTIONS,
    refreshAnalytics,
  };
}
