/** @type {import('next').NextConfig} */
const defaultApi = process.env.NODE_ENV === 'production'
  ? 'https://medverify-api-y6am.onrender.com'
  : 'http://localhost:4000';
const apiBase = (process.env.NEXT_PUBLIC_API_URL || defaultApi).replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
