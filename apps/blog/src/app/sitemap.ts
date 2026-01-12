import { getAllPosts } from '@/lib/posts';
import type { MetadataRoute } from 'next';

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
