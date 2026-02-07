/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: '/nomadway',
  assetPrefix: '/nomadway',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
