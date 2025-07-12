/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['knex', 'pg'],
  distDir: 'build',
  
  webpack: (config, { isServer, dev }) => {
    // Configurações específicas para o lado cliente
    if (!isServer) {
      // Fallback para módulos Node.js no cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'oracledb': false,
        'mysql': false,
        'mysql2': false,
        'sqlite3': false,
        'better-sqlite3': false,
        'tedious': false,
        'pg-native': false,
        'pg-query-stream': false,
        'fs': false,
        'net': false,
        'tls': false,
        'crypto': false,
        'stream': false,
        'url': false,
        'zlib': false,
        'http': false,
        'https': false,
        'assert': false,
        'os': false,
        'path': false,
        'util': false,
        'querystring': false,
        'events': false,
        'buffer': false,
      };

      // Configurar externals para drivers de banco
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'oracledb': 'oracledb',
          'mysql': 'mysql',
          'mysql2': 'mysql2',
          'sqlite3': 'sqlite3',
          'better-sqlite3': 'better-sqlite3',
          'tedious': 'tedious',
          'pg-native': 'pg-native',
        });
      } else {
        config.externals = {
          ...config.externals,
          'oracledb': 'oracledb',
          'mysql': 'mysql',
          'mysql2': 'mysql2',
          'sqlite3': 'sqlite3',
          'better-sqlite3': 'better-sqlite3',
          'tedious': 'tedious',
          'pg-native': 'pg-native',
        };
      }
    }

    // Configurar aliases para evitar problemas de resolução
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib/database-safe': require.resolve('./src/lib/database-safe.ts'),
    };

    // Apenas aplicar otimizações no cliente e em produção
    if (!isServer && !dev) {
      config.optimization.chunkIds = 'deterministic';
      
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 30,
            enforce: true,
            reuseExistingChunk: true,
          },
          apiClient: {
            test: /[\\/]src[\\/]lib[\\/]api-client/,
            name: 'api-client',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          authServices: {
            test: /[\\/]src[\\/]services[\\/]auth/,
            name: 'auth-services',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const match = module.context?.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              );
              
              if (!match || !match[1]) {
                return 'vendors';
              }
              
              const packageName = match[1];
              const bigPackages = ['react', 'react-dom', 'next', 'chart.js', 'antd'];
              if (bigPackages.includes(packageName)) {
                return `vendor-${packageName}`;
              }
              
              return 'vendors';
            },
            priority: 10,
          },
        },
      };
      
      config.optimization.minimize = true;
      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach(minimizer => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions.compress,
                drop_console: false,
              },
              keep_classnames: true,
              keep_fnames: true,
            };
          }
        });
      }
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
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
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
