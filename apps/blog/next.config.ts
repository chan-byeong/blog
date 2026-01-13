import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/:company',
        has: [
          {
            type: 'host',
            value: 'resume.byeoung.dev',
          },
        ],
        destination:
          'https://byeoung.dev/?utm_source=resume&utm_medium=subdomain&utm_campaign=:company',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
