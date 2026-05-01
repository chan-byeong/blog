export const POSTS_CACHE_TAG = 'posts';

export function getPostCacheTag(slug: string): string {
  return `post:${slug}`;
}
