import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone 모드 활성화 (Docker 최적화)
  output: 'standalone',

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
