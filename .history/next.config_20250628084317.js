/** @type {import('next').NextConfig} */

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Configurações experimentais simplificadas
  experimental: {
    optimizePackageImports: ['react-hot-toast', 'lucide-react'],
  },
  
  // Configuração webpack simplificada
  webpack: (config, { dev, isServer, webpack }) => {
    // Configuração básica para arquivos PDF
    config.module.rules.push({
      test: /\.(pdf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[path][name].[hash][ext]'
      }
    });

    // Configurações apenas para o cliente
    if (!isServer) {
      // Configuração de splitChunks otimizada para evitar erros de originalFactory
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Chunk específico para React e dependências críticas
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
        },
      };

      // Configuração adicional para evitar erros de chunk
      config.optimization.runtimeChunk = 'single';

      // Fallbacks para cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        pg: false,
        'pg-native': false,
        'pg-query-stream': false,
        oracledb: false,
      };
    }

    // Configurações para servidor
    if (isServer) {
      config.externals.push({
        'oracledb': 'commonjs oracledb',
        'mysql': 'commonjs mysql',
        'mysql2': 'commonjs mysql2',
        'sqlite3': 'commonjs sqlite3',
        'better-sqlite3': 'commonjs better-sqlite3',
        'tedious': 'commonjs tedious'
      });
    }

    // Plugins essenciais
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(cardinal|encoding|pg-cloudflare)$/,
        contextRegExp: /./,
      })
    );

    // Configurações adicionais para evitar erros de originalFactory
    if (!isServer) {
      // Não sobrescrever alias do React para evitar conflitos com jsx-runtime
      // O Next.js já gerencia isso corretamente
    }

    return config;
  },
  
  // Configurações de compilação
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Configuração de output
  output: isDev ? undefined : 'standalone',
  
  // Proxy para desenvolvimento removido - usando rotas Next.js API
  async rewrites() {
    return [];
  },
  
  // Configuração de imagens
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        pathname: '/b/**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com'
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com'
      },
      {
        protocol: 'http',
        hostname: 'localhost'
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers corrigidos para resolver problema de MIME type CSS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization, X-CSRF-Token, Cache-Control, Pragma, Accept, Origin, Cookie'
          },
        ]
      },
      // CORREÇÃO: Headers específicos para CSS do Next.js
      {
        source: '/_next/static/css/:path*.css',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ]
      },
      // CORREÇÃO: Headers para chunks JavaScript
      {
        source: '/_next/static/chunks/:path*.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ]
      },
      // Headers genéricos para assets estáticos
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ]
      },
    ];
  },

  // Pacotes externos para servidor
  serverExternalPackages: [
    'knex',
    'mysql2',
    'pg',
    'sqlite3',
    'better-sqlite3',
    'oracledb',
    'tedious'
  ],
};

module.exports = withPWA(nextConfig);
