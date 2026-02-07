/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.genspark.ai'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.genspark.ai',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/pt',
        permanent: false,
        has: [
          {
            type: 'header',
            key: 'accept-language',
            value: '(.*pt.*)',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
