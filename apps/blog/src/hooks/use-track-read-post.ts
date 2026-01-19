'use client';

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/unified-logger';

interface UseTrackReadPostProps {
  slug: string;
  title: string;
  delayMs?: number;
}

export const useTrackReadPost = ({
  slug,
  title,
  delayMs = 30000, // 30초 기본값
}: UseTrackReadPostProps) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    // 이미 추적했으면 중복 실행 방지
    if (hasTracked.current) {
      return;
    }

    const timer = setTimeout(() => {
      logger.info('Post read tracker triggered', {
        post_slug: slug,
        post_title: title,
      });
      hasTracked.current = true;
    }, delayMs);

    // cleanup: 컴포넌트 언마운트 시 타이머 취소
    return () => {
      clearTimeout(timer);
    };
  }, [slug, title, delayMs]);
};
