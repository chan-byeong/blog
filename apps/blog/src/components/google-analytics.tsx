'use client';

import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';
import { GA_MEASUREMENT_ID, isGAEnabled } from '@/lib/analytics';

export const GoogleAnalytics = () => {
  if (!isGAEnabled()) {
    return null;
  }

  return <NextGoogleAnalytics gaId={GA_MEASUREMENT_ID!} />;
};
