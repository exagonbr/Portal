/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações básicas
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Desabilitar indicadores de desenvolvimento
  devIndicators: false,
  
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
  webpack: (config, { dev, isServer }) => {
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

      // Adicionar retry logic para carregamento de chunks
      config.output.chunkLoadingGlobal = 'webpackChunkportal';
      config.output.crossOriginLoading = 'anonymous';
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
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 90000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )[1];
                return `vendor.${packageName.replace('@', '')}`;
              },
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Configurar output para melhor compatibilidade
      config.output = {
        ...config.output,
        chunkLoadTimeout: 120000,
        chunkFilename: isServer
          ? 'static/chunks/[name].[chunkhash].js'
          : 'static/chunks/[name].[contenthash].js',
        crossOriginLoading: 'anonymous',
      };

      // Adicionar plugin para melhor tratamento de erros
      config.plugins.push(
        new webpack.DefinePlugin({
          '__CACHE_VERSION__': JSON.stringify(new Date().toISOString())
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
      }
    ];
  },
  
  // Configurações experimentais para melhor performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    workerThreads: true,
    cpus: 4,
    optimizePackageImports: [
      'react',
      'react-dom',
      'next',
      '@heroicons/react',
      'lucide-react',
      'framer-motion'
    ],
    optimisticClientCache: true,
    trustHostHeader: true,
  },

  // Configurações de build
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configurações de imagens
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd26a2wm7tuz2gu.cloudfront.net',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Configuração para informar ao Next.js que estamos atrás de um proxy seguro
  serverRuntimeConfig: {
    // Configurações disponíveis apenas no servidor
  },
  publicRuntimeConfig: {
    // Configurações disponíveis no cliente e servidor
  },
  // Configuração para confiar em headers de proxy (X-Forwarded-Proto, X-Forwarded-Host)
  trailingSlash: false,
  basePath: '',
  assetPrefix: '',
  productionBrowserSourceMaps: false,

  // Configurações experimentais para melhor performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    workerThreads: true,
    cpus: 4,
    optimizePackageImports: [
      'react',
      'react-dom',
      'next',
      '@heroicons/react',
      'lucide-react',
      'framer-motion'
    ],
    optimisticClientCache: true,
  },
};

// Configuração para carregar variáveis de ambiente
const withEnv = (nextConfig) => {
  return {
    ...nextConfig,
    env: {
      ...nextConfig.env,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      // Adicionar variáveis específicas para cookies seguros
      USE_SECURE_COOKIES: process.env.NODE_ENV === 'production' ? 'true' : process.env.USE_SECURE_COOKIES || 'false',
      TRUST_PROXY: process.env.NODE_ENV === 'production' ? 'true' : process.env.TRUST_PROXY || 'false',
    }
  };
};

module.exports = withEnv(nextConfig); 