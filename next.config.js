/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 10,
    workerThreads: true,
    webpackBuildWorker: true,
  },
  // Permitir origens de desenvolvimento para resolver problemas de CORS
  allowedDevOrigins: [
    'portal.sabercon.com.br',
    'localhost:3000',
    '10.0.14.254:3000'
  ],
  // Configuração de headers para CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  // Configuração de rewrites para proxy
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 