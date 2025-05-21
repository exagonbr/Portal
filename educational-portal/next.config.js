/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.sabercon.com.br'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.sabercon.com.br',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig
