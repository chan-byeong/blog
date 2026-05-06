'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  AdminAnalyticsGroup,
  AdminAnalyticsReport,
  AdminAnalyticsSession,
} from '@/lib/admin-analytics';
import type {
  AdminAnalyticsWindow,
  AdminAnalyticsWindowOption,
} from '@/lib/admin-analytics-client';
import { useAdminAnalytics } from '@/hooks/use-admin-analytics';

interface AdminAnalyticsContextValue {
  report: AdminAnalyticsReport;
  errorMessage: string | null;
  isLoading: boolean;
  selectedWindow: AdminAnalyticsWindow;
  setSelectedWindow: (analyticsWindow: AdminAnalyticsWindow) => void;
  windowOptions: AdminAnalyticsWindowOption[];
  refreshAnalytics: () => Promise<void>;
  selectedGroup: AdminAnalyticsGroup | undefined;
  selectedSession: AdminAnalyticsSession | undefined;
  selectGroup: (group: AdminAnalyticsGroup) => void;
  selectSession: (session: AdminAnalyticsSession) => void;
}

interface AdminAnalyticsProviderProps {
  children: ReactNode;
}

const AdminAnalyticsContext =
  createContext<AdminAnalyticsContextValue | null>(null);

export function AdminAnalyticsProvider({
  children,
}: AdminAnalyticsProviderProps) {
  const analytics = useAdminAnalytics();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  const selectedGroup = useMemo(
    () => getSelectedGroup(analytics.report, selectedGroupId),
    [analytics.report, selectedGroupId]
  );
  const selectedSession = useMemo(
    () => getSelectedSession(selectedGroup, selectedSessionId),
    [selectedGroup, selectedSessionId]
  );

  const selectGroup = useCallback((group: AdminAnalyticsGroup) => {
    setSelectedGroupId(group.id);
    setSelectedSessionId(group.sessions[0]?.sessionId ?? null);
  }, []);

  const selectSession = useCallback((session: AdminAnalyticsSession) => {
    setSelectedSessionId(session.sessionId);
  }, []);

  const value = useMemo<AdminAnalyticsContextValue>(
    () => ({
      report: analytics.report,
      errorMessage: analytics.errorMessage,
      isLoading: analytics.isLoading,
      selectedWindow: analytics.selectedWindow,
      setSelectedWindow: analytics.setSelectedWindow,
      windowOptions: analytics.windowOptions,
      refreshAnalytics: analytics.refreshAnalytics,
      selectedGroup,
      selectedSession,
      selectGroup,
      selectSession,
    }),
    [analytics, selectedGroup, selectedSession, selectGroup, selectSession]
  );

  return (
    <AdminAnalyticsContext.Provider value={value}>
      {children}
    </AdminAnalyticsContext.Provider>
  );
}

export function useAdminAnalyticsContext(): AdminAnalyticsContextValue {
  const context = useContext(AdminAnalyticsContext);

  if (context === null) {
    throw new Error(
      'useAdminAnalyticsContext must be used within AdminAnalyticsProvider.'
    );
  }

  return context;
}

function getSelectedGroup(
  report: AdminAnalyticsReport,
  selectedGroupId: string | null
): AdminAnalyticsGroup | undefined {
  return (
    report.groups.find((group) => group.id === selectedGroupId) ??
    report.groups[0]
  );
}

function getSelectedSession(
  group: AdminAnalyticsGroup | undefined,
  selectedSessionId: string | null
): AdminAnalyticsSession | undefined {
  return (
    group?.sessions.find((session) => session.sessionId === selectedSessionId) ??
    group?.sessions[0]
  );
}
