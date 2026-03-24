/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['nomadway.com.br', 'localhost'],
    unoptimized: false,
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig