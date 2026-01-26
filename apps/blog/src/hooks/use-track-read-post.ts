'use client';

import { useEffect, useRef } from 'react';
import { userAnalytics } from '@/lib/user-analytics';
import { EventType } from '@/types/event-type';

interface UseTrackReadPostProps {
  slug: string;
  title: string;
  delayMs?: number;
}

export const useTrackReadPost = ({
  slug,
  title,
  delayMs = 10000, // 10초 기본값
}: UseTrackReadPostProps) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    // 이미 추적했으면 중복 방지
    if (hasTracked.current) {
      return;
    }

    const timer = setTimeout(() => {
      userAnalytics.track(EventType.READ_POST, {
        post_slug: slug,
        post_title: title,
      });
      hasTracked.current = true;
    }, delayMs);

    return () => clearTimeout(timer);
  }, [slug, title, delayMs]);
};
