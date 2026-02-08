/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  // basePath e assetPrefix removidos para root domain (nomadway.com.br)
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
