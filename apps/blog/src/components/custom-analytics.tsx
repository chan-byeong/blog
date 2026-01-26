'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { userAnalytics } from '@/lib/user-analytics';
import { EventType } from '@/types/event-type';

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 초기 마운트에만 실행 (첫 방문 추적)
  useEffect(() => {
    const data: Record<string, string> = { pathname };
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      return;
    }

    sessionStorage.setItem('hasVisited', 'true');

    // referrer가 있으면 추가
    if (document.referrer) {
      data.referrer = document.referrer;
    }

    // UTM 파라미터 추출
    const utmCampaign = searchParams.get('utm_campaign');
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');

    if (utmCampaign) data.utm_campaign = utmCampaign;
    if (utmSource) data.utm_source = utmSource;
    if (utmMedium) data.utm_medium = utmMedium;

    userAnalytics.track(EventType.FIRST_VISIT, data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pathname 변경 시 페이지뷰 추적
  useEffect(() => {
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
