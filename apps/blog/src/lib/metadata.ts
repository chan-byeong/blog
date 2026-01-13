import { Metadata } from 'next';

export const siteConfig = {
  name: 'byeoung blog',
  description: 'Personal blog by byeoung | github: @chan-byeong',
  url: 'https://www.byeoung.dev',
  links: {
    github: 'https://github.com/chan-byeong',
  },
};

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Frontend',
    'React',
    'JavaScript',
    'TypeScript',
    'Web Development',
    'byeoung',
    'Next.js',
    '웹개발',
  ],
  creator: '@chan-byeong',

  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
};
