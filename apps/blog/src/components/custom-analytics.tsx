'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureStoredAnalyticsAttribution } from '@/lib/analytics-attribution';
import { userAnalytics } from '@/lib/user-analytics';
import { EventType } from '@/types/event-type';

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAdminPath(pathname)) {
      return;
    }

    captureStoredAnalyticsAttribution({
      searchParams,
      referrer: document.referrer,
    });
  }, [pathname, searchParams]);

  // 초기 마운트에만 실행 (첫 방문 추적)
  useEffect(() => {
    if (isAdminPath(pathname)) {
      return;
    }

    const data: Record<string, string> = { pathname };
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      return;
    }

    sessionStorage.setItem('hasVisited', 'true');

    userAnalytics.track(EventType.FIRST_VISIT, data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pathname 변경 시 페이지뷰 추적
  useEffect(() => {
    if (isAdminPath(pathname)) {
      return;
    }

    userAnalytics.track(EventType.PAGE_VIEW, { pathname });
  }, [pathname]);

  return null;
}

export const CustomAnalytics = () => {
  return (
    <Suspense fallback={null}>
      <AnalyticsTracker />
    </Suspense>
  );
};
