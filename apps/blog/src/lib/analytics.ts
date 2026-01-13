import { sendGAEvent } from '@next/third-parties/google';

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || undefined;

export const isGAEnabled = (): boolean => {
  return (
    process.env.NODE_ENV === 'production' && GA_MEASUREMENT_ID !== undefined
  );
};

export interface GAEvent {
  action: 'click_post' | 'read_post' | 'click_nav_button';
  params?: Record<string, unknown>;
}

export const trackEvent = (event: GAEvent) => {
  if (!isGAEnabled()) {
    return;
  }

  sendGAEvent(event.action, { ...event.params });
};

// 포스트 클릭 이벤트
export const trackClickPost = (postSlug: string, postTitle: string) => {
  trackEvent({
    action: 'click_post',
    params: {
      post_slug: postSlug,
      post_title: postTitle,
    },
  });
};

// 포스트 읽기 이벤트 (30초 이상 체류)
export const trackReadPost = (postSlug: string, postTitle: string) => {
  trackEvent({
    action: 'read_post',
    params: {
      post_slug: postSlug,
      post_title: postTitle,
      read_time: '30s+',
    },
  });
};

// 네비게이션 버튼 클릭 이벤트
export const trackClickNavButton = (buttonLabel: string) => {
  trackEvent({
    action: 'click_nav_button',
    params: {
      nav_button_label: buttonLabel,
    },
  });
};
