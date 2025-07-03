/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

// Gerar versão de cache única para cada build
const cacheVersion = process.env.NEXT_PUBLIC_CACHE_VERSION || `dev-${Date.now()}`;

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Desabilitar fast refresh
  fastRefresh: false,
  
  // Configurações para melhorar a hidratação
  experimental: {
    // Melhorar a hidratação de componentes
    optimizePackageImports: ['react-hot-toast', 'lucide-react'],
  },
  
  // Pacotes externos para componentes do servidor
  serverExternalPackages: ['epubjs'],
  
  // Configurações de compilação para evitar problemas de hidratação
  compiler: {
    // Remover console.log em produção
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Configuração de output para produção
  output: isDev ? undefined : 'standalone',
  
  // REMOVIDO: Configuração de proxy (rewrites) eliminada para comunicação direta
  // O frontend agora se comunica diretamente com o backend via URLs configuradas
  // Frontend: https://portal.sabercon.com.br (porta 3000)
  // Backend: http://localhost:3001 (comunicação interna via Nginx)
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        pathname: '/b/**'
      },
      {
        protocol: 'http',
        hostname: 'covers.openlibrary.org',
        pathname: '/b/**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'http',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com'
      },
      {
        protocol: 'http',
        hostname: 'images-na.ssl-images-amazon.com'
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com'
      },
      {
        protocol: 'http',
        hostname: 'img.youtube.com'
      },
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      {
        protocol: 'https',
        hostname: 'localhost'
      }
    ]
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  
  // Headers otimizados para comunicação direta (sem proxy)
  async headers() {
    return [
      {
        source: '/books/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/epub+zip'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://portal.sabercon.com.br'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization, X-CSRF-Token, Cache-Control, Pragma, Accept, Origin, Cookie'
          }
        ]
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Cache otimizado para assets estáticos
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          // Header de versão para debugging
          {
            key: 'X-Cache-Version',
            value: cacheVersion
          }
        ]
      }
    ];
  },
  
  webpack: (config, { isServer, webpack }) => {
    // Desabilitar debug de issues do webpack
    config.stats = 'errors-only';
    config.infrastructureLogging = {
      level: 'error',
    };
    
    // Injetar versão de cache no Service Worker
    if (!isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          '__CACHE_VERSION__': JSON.stringify(cacheVersion)
        })
      );
    }

    config.module.rules.push({
      test: /\.(pdf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[path][name].[hash][ext]'
      }
    });

    // Configurações específicas para melhorar carregamento de chunks
    if (!isServer) {
      // Otimizar divisão de chunks para evitar ChunkLoadError
      config.optimization = {
          minimize: true,
          namedModules: true,
          namedChunks: true,
          removeAvailableModules: true,
          flagIncludedChunks: true,
          occurrenceOrder: false,
          usedExports: true,
          concatenateModules: true,
          sideEffects: false, // <----- in prod defaults to true if left blank
      }

        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Criar chunk específico para api-client
            apiClient: {
              test: /[\\/]src[\\/]lib[\\/]api-client/,
              name: 'api-client',
              chunks: 'all',
              priority: 20,
              enforce: true,
            },
            // Chunk para serviços de autenticação
            authServices: {
              test: /[\\/]src[\\/]services[\\/]auth/,
              name: 'auth-services',
              chunks: 'all',
              priority: 15,
              enforce: true,
            },
          },
        },
      };

      // Configurar retry automático para chunks falhados
      config.output = {
        ...config.output,
        crossOriginLoading: 'anonymous',
        // Adicionar configuração para retry de chunks
        chunkLoadTimeout: 30000, // 30 segundos
      };
    }

    if (isServer) {
      config.externals.push({
        'oracledb': 'commonjs oracledb',
        'mysql': 'commonjs mysql',
        'mysql2': 'commonjs mysql2',
        'sqlite3': 'commonjs sqlite3',
        'better-sqlite3': 'commonjs better-sqlite3',
        'tedious': 'commonjs tedious'
      })
    } else {
      // No lado do cliente, adicionar fallbacks para módulos de servidor
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'oracledb': false,
        'fs': false,
        'net': false,
        'tls': false,
        'pg': false,
        'pg-native': false,
        'pg-query-stream': false,
      };

      // Adicionar alias para módulos relacionados ao PostgreSQL no cliente
      config.resolve.alias = {
        ...config.resolve.alias,
        'pg-cloudflare': false,
        'knex': false,
        'objection': false,
      };
    }

    // Ignorar módulos específicos que causam problemas
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(cardinal|encoding|pg-cloudflare)$/,
        contextRegExp: /./,
      })
    );

    // Adicionar plugin para lidar com o esquema cloudflare:sockets
    config.module.rules.push({
      test: /cloudflare:sockets/,
      use: 'null-loader',
      include: /node_modules/,
    });

    return config;
  },
};

// This ensures the PWA configuration is properly recognized
module.exports = nextConfig;
