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
  
  // Configuração de output para produção
  output: isDev ? undefined : 'standalone',
  
  // CORREÇÃO: Configuração de proxy mais específica para evitar loops
  // CORREÇÃO: Configuração de proxy mais específica para evitar loops
  async rewrites() {
    // Em produção com ALB, NÃO usar proxy interno para evitar loops
    // O ALB já faz o roteamento correto
    if (process.env.NODE_ENV === 'production') {
      console.log('🚫 Proxy interno desabilitado em produção para evitar loops');
      return [];
    }
    
    // Apenas em desenvolvimento usar proxy
    const isDev = process.env.NODE_ENV === 'development';
    const apiDestination = 'http://localhost:3001/api/:path*';
    
    console.log(`🔄 Proxy configurado para desenvolvimento: ${apiDestination}`);
    
    return [
      {
        source: '/api/((?!screenshots).*)',
        destination: 'http://localhost:3001/api/$1'
      }
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
    ]
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  
  // CORREÇÃO: Headers otimizados para evitar redirecionamentos
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
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
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: isDev ? '*' : 'https://portal.sabercon.com.br'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization, X-CSRF-Token'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
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
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https: wss:",
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ]
      }
    ];
  },
  
  webpack: (config, { isServer, webpack }) => {
    config.module.rules.push({
      test: /\.(pdf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/chunks/[path][name].[hash][ext]'
      }
    });

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
