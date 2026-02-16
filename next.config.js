/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removido 'output: export' - Vercel suporta Next.js nativo
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig