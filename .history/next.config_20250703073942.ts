import type { NextConfig } from 'next';
import webpack from 'webpack';

const isDev: boolean = process.env.NODE_ENV === 'development';
const isProd: boolean = process.env.NODE_ENV === 'production';

// Gerar versão de cache única para cada build
const cacheVersion: string = process.env.NEXT_PUBLIC_CACHE_VERSION || `v${Date.now()}`;

// Configurações de segurança CSP
const ContentSecurityPolicy: string = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.youtube.com *.handtalk.me;
  child-src 'self' *.youtube.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: *.openlibrary.org *.unsplash.com *.ssl-images-amazon.com *.youtube.com;
  font-src 'self' data:;
  connect-src 'self' ${isDev ? 'localhost:* 127.0.0.1:*' : ''} ${process.env.FRONTEND_URL?.replace('https://', '').replace('http://', '') || '*.sabercon.com.br'} ws: wss:;
  media-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  // Configurações básicas do TypeScript
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // Configurações de desenvolvimento
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  // Desativar o ícone de "dev tools" do Next.js
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
    webpackBuildWorker: true,
    workerThreads: true,
    cpus: 10,
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

  // Configuração de imagens otimizada
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 ano
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
        hostname: process.env.FRONTEND_URL?.replace('https://', '').replace('http://', '') || 'portal.sabercon.com.br'
      }
    ]
  },

  // Headers de segurança e performance
  async headers() {
    const securityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
      ...(isProd ? [{ key: 'Content-Security-Policy', value: ContentSecurityPolicy }] : [])
    ];

    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Vary', value: 'Accept-Encoding, Authorization' },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/((?!api/).*)',
        headers: [
          ...securityHeaders,
          { key: 'X-Cache-Version', value: cacheVersion }
        ]
      }
    ];
  },

  // Configuração do Webpack
  webpack: (config, { buildId, dev, isServer, webpack }) => {
    // ... (manter a configuração do webpack como está, pois parece complexa e específica)
    config.stats = dev ? 'minimal' : 'errors-warnings';
    config.infrastructureLogging = {
      level: dev ? 'warn' : 'error',
    };
    config.performance = {
      hints: isProd ? 'warning' : false,  
    };
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      version: cacheVersion,  
    };
    if (!isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          '__CACHE_VERSION__': JSON.stringify(cacheVersion),
          '__BUILD_ID__': JSON.stringify(buildId),
        })
      );
    }
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
    if (isServer) {
      config.externals.push(
        'oracledb', 'mysql', 'mysql2', 'sqlite3', 'better-sqlite3', 
        'tedious', 'pg', 'pg-native', 'sharp'
      );
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, net: false, tls: false, crypto: false, stream: false, 
        url: false, zlib: false, http: false, https: false, assert: false, 
        os: false, path: false, 'pg': false, 'pg-native': false, 
        'pg-query-stream': false, 'oracledb': false, 'mysql': false, 
        'mysql2': false, 'sqlite3': false, 'better-sqlite3': false, 'tedious': false,
      };
    }
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(cardinal|encoding|pg-cloudflare|bufferutil|utf-8-validate)$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /cloudflare:sockets/,
      })
    );
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

  // Configuração de rewrites - Proxy para o backend
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("ERRO: A variável de ambiente BACKEND_URL não está definida.");
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: '/public/:path*',
        destination: `${backendUrl}/public/:path*`,
      },
    ];
  },

  // Variáveis de ambiente expostas ao cliente são gerenciadas em src/config/env.ts
  // A seção 'env' aqui não é mais necessária.

  // Configurações de proxy HTTP
  httpAgentOptions: {
    keepAlive: true,
  },
};

export default nextConfig;