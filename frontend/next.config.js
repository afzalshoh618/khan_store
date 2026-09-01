/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  async rewrites() {
    const rawHost =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      'https://khanstore-production-f1be.up.railway.app';
    const backendHost = rawHost.replace(/\/$/, '').replace(/\/api\/v1$/, '');
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendHost}/api/v1/:path*`,
      },
      {
        source: '/static/:path*',
        destination: `${backendHost}/static/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
