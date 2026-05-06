'use client';

import { Header } from '@/components/side-bar/header';
import { useAdminAnalyticsContext } from '@/components/admin/admin-analytics-provider';

export function AdminAnalyticsHeader() {
  const { report } = useAdminAnalyticsContext();

  return <Header title='Analytics' totalPosts={report.totalSessions} />;
}
