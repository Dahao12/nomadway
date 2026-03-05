/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' - disabled for Vercel deployment
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  trailingSlash: true,
}

module.exports = nextConfig