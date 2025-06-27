/** @type {import('next').NextConfig} */

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
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
  
  // Configurações para melhorar a hidratação e carregamento de chunks
  experimental: {
    // Melhorar a hidratação de componentes
    optimizePackageImports: ['react-hot-toast', 'lucide-react'],
    // Desabilitar turbo temporariamente para evitar problemas de chunk
    turbo: false,
    // Melhorar o carregamento de chunks
    esmExternals: 'loose',
    // CORREÇÃO: Forçar configurações específicas para CSS
    forceSwcTransforms: true,
  },
  
  // Configurações webpack para melhorar o carregamento de chunks
  webpack: (config, { dev, isServer }) => {
    // Melhorar o splitting de chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // CORREÇÃO: Separar CSS vendors especificamente
          cssVendor: {
            test: /[\\/]node_modules[\\/].*\.(css|scss|sass)$/,
            name: 'css-vendors',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    // CORREÇÃO: Configurar loaders específicos para CSS
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        },
      ],
    });
    
    // Configurar resolução de módulos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
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
  
  // CORREÇÃO: Redirects para evitar conflitos de CSS
  async redirects() {
    return [
      // Redirecionar arquivos CSS mal formados
      {
        source: '/_next/static/css/:path*.js',
        destination: '/_next/static/css/:path*.css',
        permanent: false,
      },
    ];
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
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
      // CORREÇÃO: Headers mais específicos e agressivos para arquivos CSS
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Content-Disposition',
            value: 'inline'
          }
        ]
      },
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      },
      {
        source: '/_next/static/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      },
      // CORREÇÃO: Headers globais para todos os arquivos estáticos
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
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
          }
        ]
      }
    ];
  },
  
  webpack: (config, { isServer, webpack, dev }) => {
    // Configuração básica para arquivos PDF
    config.module.rules.push({
      test: /\.(pdf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[path][name].[hash][ext]'
      }
    });

    // CORREÇÃO: Configuração mais simples e robusta
    if (!isServer) {
      // Configuração de splitChunks mais conservadora
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: dev ? 500000 : 250000,
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
          },
        },
      };

      // CORREÇÃO: Configuração de output simplificada
      config.output = {
        ...config.output,
        crossOriginLoading: 'anonymous',
        chunkLoadTimeout: 30000,
        globalObject: 'this',
        publicPath: '/_next/',
      };

      // CORREÇÃO: Resolver configuração
      config.resolve = {
        ...config.resolve,
        symlinks: false,
        modules: ['node_modules'],
      };

      // CORREÇÃO: Configuração específica para desenvolvimento
      if (dev) {
        config.devtool = 'eval-cheap-module-source-map';
        config.optimization.runtimeChunk = 'single';
      }
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

    // Plugins essenciais
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(cardinal|encoding|pg-cloudflare)$/,
        contextRegExp: /./,
      }),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: dev ? 15 : 30
      })
    );

    // CORREÇÃO: Configuração para evitar problemas de factory
    if (!isServer && !dev) {
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
  },



  // Movido de experimental para raiz
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

// This ensures the PWA configuration is properly recognized
module.exports = withPWA(nextConfig);
