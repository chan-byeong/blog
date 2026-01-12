import { getAllPosts } from '@/lib/posts';
import type { MetadataRoute } from 'next';

/**
 * Generate sitemap entries for the site root and all posts.
 *
 * The root entry uses priority 1 and monthly change frequency; each post entry uses priority 0.8 and monthly change frequency.
 *
 * @returns An array of sitemap entries combining the root page and one entry per post, each with `url`, `lastModified`, `changeFrequency`, and `priority`.
 */
export default async function sitemap() {
  const posts = await getAllPosts();
  const baseUrl = 'https://byeoung.dev';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticPages, ...postPages];
}