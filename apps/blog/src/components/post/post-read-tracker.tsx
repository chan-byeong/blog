'use client';

import { useTrackReadPost } from '@/hooks/use-track-read-post';

interface PostReadTrackerProps {
  slug: string;
  title: string;
}

export const PostReadTracker = ({ slug, title }: PostReadTrackerProps) => {
  useTrackReadPost({ slug, title });

  return null; // UI를 렌더링하지 않음
};
