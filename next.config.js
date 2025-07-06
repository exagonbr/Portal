/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações básicas
  reactStrictMode: true,
  
  // Configuração para resolver problemas de módulos (Nova sintaxe do Next.js 15)
  serverExternalPackages: [
    'oracledb',
    'mysql',
    'mysql2', 
    'sqlite3',
    'better-sqlite3',
    'tedious',
    'pg-native',
    'sharp',
    'knex'
  ],

  // Configuração do Webpack para resolver o problema do oracledb
  webpack: (config, { isServer }) => {
    // Configurações específicas para servidor
    if (isServer) {
      // Marcar drivers de banco como externos
      config.externals.push(
        'oracledb', 
        'mysql', 
        'mysql2', 
        'sqlite3', 
        'better-sqlite3', 
        'tedious', 
        'pg-native'
      );
    } else {
      // Fallbacks para o cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'oracledb': false,
        'mysql': false,
        'mysql2': false,
        'sqlite3': false,
        'better-sqlite3': false,
        'tedious': false,
        'pg-native': false,
      };
    }

    // Plugins para ignorar módulos problemáticos
    const webpack = require('webpack');
    config.plugins.push(
      // Ignorar drivers de banco específicos do Knex
      new webpack.IgnorePlugin({
        resourceRegExp: /^oracledb$/,
        contextRegExp: /knex/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^mysql$/,
        contextRegExp: /knex/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^mysql2$/,
        contextRegExp: /knex/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^sqlite3$/,
        contextRegExp: /knex/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^better-sqlite3$/,
        contextRegExp: /knex/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^tedious$/,
        contextRegExp: /knex/,
      })
    );

    // Otimizações para PWA e chunks
    if (!isServer) {
      // Configurar split chunks para melhor carregamento
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Commons chunk
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
            // React/Next.js framework chunk
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
          },
        },
        // Usar IDs determinísticos para melhor cache
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      };

      // Configurar output para melhor compatibilidade
      config.output = {
        ...config.output,
        // Timeout maior para carregamento de chunks
        chunkLoadTimeout: 120000, // 2 minutos
        // Nome de chunks mais limpo
        chunkFilename: 'static/chunks/[name].[contenthash].js',
        // Configurar CORS para chunks
        crossOriginLoading: 'anonymous',
      };

      // Adicionar plugin para melhor tratamento de erros
      config.plugins.push(
        new webpack.DefinePlugin({
          '__CACHE_VERSION__': JSON.stringify(new Date().toISOString()),
        })
      );
    }

    return config;
  },
  
  // Headers customizados para melhor controle de cache
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Adicionar header para controle de cache mais agressivo
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // Headers específicos para páginas HTML
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '.*text/html.*',
          },
        ],
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      // Headers específicos para chunks JavaScript
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
        ],
      },
      // Headers para CSS
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8',
          },
        ],
      },
      // Headers para imagens e outros assets
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      // Headers para API routes - sem cache
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Configurações experimentais para melhor performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@ant-design/icons', 'antd', 'lodash'],
    // Configuração de workers para build paralela
    workerThreads: true,
    cpus: 10,
  },
};

module.exports = nextConfig; 