/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

// Configurações de segurança CSP
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.youtube.com *.handtalk.me;
  child-src 'self' *.youtube.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: *.openlibrary.org *.unsplash.com *.ssl-images-amazon.com *.youtube.com;
  font-src 'self' data:;
  connect-src 'self' *.sabercon.com.br ws: wss:;
  media-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig = {
  // Configurações básicas do TypeScript
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // Configurações de desenvolvimento
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  devIndicators: false,
  
  // ESLint
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['src', 'pages', 'components', 'lib', 'utils'],
  },

  // Configurações experimentais
  experimental: {
    optimizePackageImports: [
      'react-hot-toast',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'date-fns',
    ],
    serverExternalPackages: [
      'epubjs',
      'sharp',
      'canvas',
      'jsdom',
      'puppeteer',
    ],
  },

  // Pacotes externos para componentes do servidor
  serverExternalPackages: [
    'epubjs',
    'sharp',
    'canvas',
    'jsdom',
    'puppeteer',
  ],

  // Configurações do compilador
  compiler: {
    removeConsole: isProd ? {
      exclude: ['error', 'warn', 'info']
    } : false,
    reactRemoveProperties: isProd,
  },

  // Configuração de output
  output: isProd ? 'standalone' : undefined,
  distDir: '.next',
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,

  // Configuração de imagens
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
        protocol: 'https',
        hostname: 'portal.sabercon.com.br'
      }
    ]
  },

  // Configuração de proxy para development e production
  async rewrites() {
    const apiUrl = isProd
      ? 'https://api.sabercon.com.br'
      : 'http://localhost:3001';

    return [
      {
        source: '/api/proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },

  // Headers de segurança
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
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
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
      },
      ...(isProd ? [{
        key: 'Content-Security-Policy',
        value: ContentSecurityPolicy
      }] : [])
    ];

    // Cache específico apenas para dados de sessão/auth
    const authNoCacheHeaders = [
      {
        key: 'Cache-Control',
        value: 'private, no-cache, no-store, max-age=0, must-revalidate'
      },
      {
        key: 'Pragma',
        value: 'no-cache'
      }
    ];

    return [
      // Headers gerais com cache normal
      {
        source: '/:path*',
        headers: securityHeaders
      },
      // No-cache apenas para rotas de autenticação e dados sensíveis
      {
        source: '/api/auth/:path*',
        headers: [
          ...securityHeaders,
          ...authNoCacheHeaders
        ]
      },
      {
        source: '/api/user/:path*',
        headers: [
          ...securityHeaders,
          ...authNoCacheHeaders
        ]
      },
      {
        source: '/api/session/:path*',
        headers: [
          ...securityHeaders,
          ...authNoCacheHeaders
        ]
      },
      // Cache normal para assets estáticos
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Cache para imagens
      {
        source: '/(.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)$)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=86400'
          }
        ]
      }
    ];
  },

  // Configuração robusta do Webpack
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Configurações de logging otimizadas
    config.stats = dev ? 'minimal' : 'errors-warnings';
    config.infrastructureLogging = {
      level: dev ? 'warn' : 'error',
    };
    config.performance = {
      hints: isProd ? 'warning' : false,
    }

    // Configurações de paralelização para 10 cores
    config.parallelism = 10;
    
    // Configurações de desenvolvimento otimizadas
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    // Configuração para diferentes tipos de arquivo
    config.module.rules.push(
      {
        test: /\.(pdf|epub)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash:8].[ext]'
        }
      }
    );

         // Configurações específicas para o cliente
     if (!isServer) {
       // Otimizações de bundle splitting (apenas em produção para evitar problemas em dev)
       if (isProd) {
         config.optimization = {
           ...config.optimization,
           moduleIds: 'deterministic',
           chunkIds: 'deterministic',
           minimize: true,
           usedExports: true,
           sideEffects: false,
           splitChunks: {
             chunks: 'all',
             minSize: 20000,
             maxSize: 244000,
             minChunks: 1,
             maxAsyncRequests: 30,
             maxInitialRequests: 30,
             enforceSizeThreshold: 50000,
             cacheGroups: {
               // Framework chunk (React, Next.js)
               framework: {
                 chunks: 'all',
                 name: 'framework',
                 test: /(?:react|react-dom|scheduler|prop-types|use-subscription)/,
                 priority: 40,
                 enforce: true,
               },
               // Vendor libraries
               vendor: {
                 test: /[\\/]node_modules[\\/]/,
                 name: 'vendors',
                 chunks: 'all',
                 priority: 30,
                 enforce: true,
               },
               // UI components
               ui: {
                 test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
                 name: 'ui-components',
                 chunks: 'all',
                 priority: 25,
                 enforce: true,
               },
               // API client
               apiClient: {
                 test: /[\\/]src[\\/]lib[\\/]api-client/,
                 name: 'api-client',
                 chunks: 'all',
                 priority: 20,
                 enforce: true,
               },
               // Auth services
               auth: {
                 test: /[\\/]src[\\/](services|contexts)[\\/].*auth/i,
                 name: 'auth-services',
                 chunks: 'all',
                 priority: 15,
                 enforce: true,
               },
               // Common utilities
               common: {
                 test: /[\\/]src[\\/](utils|lib|hooks)[\\/]/,
                 name: 'common',
                 chunks: 'all',
                 priority: 10,
                 minChunks: 2,
               },
               // Default
               default: {
                 minChunks: 2,
                 priority: 5,
                 reuseExistingChunk: true,
               },
             },
           },
         };
       }

             // Configurações de output robustas
       config.output = {
         ...config.output,
         crossOriginLoading: 'anonymous',
         chunkLoadTimeout: 60000, // 60 segundos
       };

       // Configurar retry automático para chunks falhados (apenas em produção)
       if (isProd) {
         config.plugins.push(
           new webpack.optimize.LimitChunkCountPlugin({
             maxChunks: 50,
           })
         );
       }
    }

    // Configurações para o servidor
    if (isServer) {
      config.externals = [
        ...config.externals,
        {
          'oracledb': 'commonjs oracledb',
          'mysql': 'commonjs mysql',
          'mysql2': 'commonjs mysql2',
          'sqlite3': 'commonjs sqlite3',
          'better-sqlite3': 'commonjs better-sqlite3',
          'tedious': 'commonjs tedious',
          'pg': 'commonjs pg',
          'pg-native': 'commonjs pg-native',
          'sharp': 'commonjs sharp',
        }
      ];
    } else {
      // Fallbacks para o cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        // Database-related
        'pg': false,
        'pg-native': false,
        'pg-query-stream': false,
        'oracledb': false,
        'mysql': false,
        'mysql2': false,
        'sqlite3': false,
        'better-sqlite3': false,
        'tedious': false,
      };

      // Aliases para evitar problemas
      config.resolve.alias = {
        ...config.resolve.alias,
        'pg-cloudflare': false,
        'knex': false,
        'objection': false,
      };
    }

    // Plugins para ignorar módulos problemáticos
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(cardinal|encoding|pg-cloudflare|bufferutil|utf-8-validate)$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /cloudflare:sockets/,
      })
    );

    // Configurações de paralelização para TerserPlugin (apenas em produção)
    if (isProd && !isServer) {
      const TerserPlugin = require('terser-webpack-plugin');
      
      config.optimization = {
        ...config.optimization,
        minimizer: [
          new TerserPlugin({
            parallel: 10, // Usar 10 workers para minificação
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
              },
              mangle: true,
            },
          }),
        ],
      };
    }

    // Configurações específicas para desenvolvimento - Menu mais rápido
    if (dev) {
      config.watchOptions = {
        poll: false,
        ignored: /node_modules/,
        aggregateTimeout: 100, // Resposta mais rápida
      };
      
      // Desabilitar source maps para performance
      config.devtool = false;
    }

    return config;
  },

  // Configuração de redirecionamentos
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // Configuração para PWA (se aplicável)
  env: {
    CUSTOM_KEY: 'my-value',
    CACHE_VERSION: cacheVersion,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_NO_CACHE: 'true',
  },
  
  // Configurações adicionais para desabilitar cache
  serverRuntimeConfig: {
    // Desabilitar cache do servidor
    unstable_runtimeJS: false,
  },
  
  publicRuntimeConfig: {
    // Configurações públicas
    noCache: true,
  },
};

module.exports = nextConfig;
