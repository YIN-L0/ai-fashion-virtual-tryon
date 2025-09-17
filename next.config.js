/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.fashn.ai', 'example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
