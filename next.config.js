/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    workerThreads: true,
    cpus: 2,
  },
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
}

module.exports = nextConfig 