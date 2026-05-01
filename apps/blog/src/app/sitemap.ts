import type { MetadataRoute } from 'next';

export default async function sitemap() {
  const baseUrl = 'https://byeoung.dev';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];

  return [...staticPages];
}
