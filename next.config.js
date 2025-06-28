/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

// Gerar versão de cache única para cada build
const cacheVersion = process.env.NEXT_PUBLIC_CACHE_VERSION || `dev-${Date.now()}`;

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Configurações para melhorar a hidratação
  experimental: {
    // Melhorar a hidratação de componentes
    optimizePackageImports: ['react-hot-toast', 'lucide-react'],
    // Reduzir problemas de hidratação
    serverComponentsExternalPackages: ['epubjs'],
  },
  
  // Configurações de compilação para evitar problemas de hidratação
  compiler: {
    // Remover console.log em produção
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Configuração de output para produção
  output: isDev ? undefined : 'standalone',
  
  // CORREÇÃO: Configuração de proxy mais específica para evitar loops
  // CORREÇÃO: Configuração de proxy mais específica para evitar loops
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const apiDestination = 'https://portal.sabercon.com.br/api/:path*';
      
      console.log(`🔄 Proxy configurado para : ${apiDestination}`);
      
      return [
        // As rotas do Next.js têm prioridade sobre o proxy automaticamente
        {
          source: '/api/:path*',
          destination: apiDestination
        }
      ];
    }
    
    return [];
  },
  
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
  
  // CORREÇÃO: Headers otimizados para CORS GLOBAL - PERMITIR TODAS AS ORIGENS
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
            value: '*'
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
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'false'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          },
          // CORREÇÃO: Cache otimizado para APIs
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0'
          },
          // Adicionar header de versão para debugging
          {
            key: 'X-Cache-Version',
            value: cacheVersion
          }
        ]
      },
      {
        source: '/:path*',
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
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'false'
          },
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
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob: *",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: *",
              "style-src 'self' 'unsafe-inline' https: *",
              "img-src 'self' data: blob: https: *",
              "font-src 'self' data: https: *",
              "connect-src 'self' https: wss: *",
              "media-src 'self' https: *",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' *"
            ].join('; ')
          }
        ]
      }
    ];
  },
  
  webpack: (config, { isServer, webpack }) => {
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
  async headers() {
    return [
      {
        source: '/books/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/epub+zip'
          }
        ]
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization'
          }
        ]
      }
    ];
  }
};

// This ensures the PWA configuration is properly recognized
module.exports = nextConfig;
