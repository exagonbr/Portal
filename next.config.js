/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

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
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const apiDestination = 'http://localhost:3001/api/:path*';
      
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
          // CORREÇÃO: Evitar cache de redirecionamentos
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
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
    // Configuração básica para arquivos PDF
    config.module.rules.push({
      test: /\.(pdf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[path][name].[hash][ext]'
      }
    });

    // CORREÇÃO: Configuração mais robusta para evitar problemas de factory
    if (!isServer) {
      // Configuração mais conservadora para splitChunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 250000,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
              enforce: true,
            },
            // Separar React e Next.js em chunk próprio
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'react',
              priority: 10,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };

      // Configuração de output mais robusta
      config.output = {
        ...config.output,
        crossOriginLoading: 'anonymous',
        chunkLoadTimeout: 60000, // Aumentar timeout para 60 segundos
        // CORREÇÃO: Configuração mais específica para evitar problemas de factory
        chunkFilename: isDev 
          ? 'static/chunks/[name].js' 
          : 'static/chunks/[name].[contenthash:8].js',
        // Adicionar configuração para melhor handling de erros
        globalObject: 'this',
        publicPath: '/_next/',
      };

      // CORREÇÃO: Adicionar configuração para resolver problemas de módulos
      config.resolve = {
        ...config.resolve,
        symlinks: false,
        modules: ['node_modules'],
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
      })
    } else {
      // Fallbacks para cliente
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

      // Alias para módulos problemáticos
      config.resolve.alias = {
        ...config.resolve.alias,
        'pg-cloudflare': false,
        'knex': false,
        'objection': false,
      };
    }

    // Plugins para ignorar módulos problemáticos e melhorar carregamento
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(cardinal|encoding|pg-cloudflare)$/,
        contextRegExp: /./,
      }),
      // CORREÇÃO: Plugin para melhorar carregamento de chunks
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 50
      })
    );

    // CORREÇÃO: Configuração adicional para evitar problemas de factory
    if (!isServer) {
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      };
    }

    // Regra para cloudflare:sockets
    config.module.rules.push({
      test: /cloudflare:sockets/,
      use: 'null-loader',
      include: /node_modules/,
    });

    return config;
  }
};

// This ensures the PWA configuration is properly recognized
module.exports = nextConfig;
