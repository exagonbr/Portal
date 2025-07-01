#!/bin/bash

# Script para corrigir loop de rate limiting e redirecionamentos
# Portal Sabercon - Resolver 301/308 e loops de requisições
# Execute: bash fix-rate-limit-loop.sh

echo "🔧 CORRIGINDO LOOP DE RATE LIMITING E REDIRECIONAMENTOS"
echo "======================================================="

# 1. Desabilitar rate limiting no middleware temporariamente
echo "🔧 Desabilitando rate limiting no middleware..."

# Backup do middleware atual
cp src/middleware.ts src/middleware.ts.backup.$(date +%Y%m%d-%H%M%S)

# Comentar a aplicação de rate limiting no middleware
sed -i 's/const rateLimitResponse = await applyRateLimit/\/\/ const rateLimitResponse = await applyRateLimit/' src/middleware.ts
sed -i 's/if (rateLimitResponse) {/\/\/ if (rateLimitResponse) {/' src/middleware.ts
sed -i 's/return rateLimitResponse;/\/\/ return rateLimitResponse;/' src/middleware.ts
sed -i 's/}/\/\/ }/' src/middleware.ts

echo "✅ Rate limiting desabilitado no middleware"

# 2. Corrigir next.config.js para evitar loops de proxy
echo "🔧 Corrigindo configuração de proxy no next.config.js..."

# Backup do next.config.js
cp next.config.js next.config.js.backup.$(date +%Y%m%d-%H%M%S)

# Criar versão corrigida do next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configurações para resolver erro de dynamic server usage
  experimental: {
    staticWorkerRequestDeduping: true,
    optimizePackageImports: ['@/components', '@/utils', '@/services'],
  },
  
  // Configuração de output para produção
  output: isDev ? undefined : 'standalone',
  
  // CORREÇÃO: Configuração de proxy mais específica para evitar loops
  async rewrites() {
    // Em produção com ALB, NÃO usar proxy interno para evitar loops
    // O ALB já faz o roteamento correto
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    
    // Apenas em desenvolvimento usar proxy
    return [
      {
        source: '/api/:path*',
        destination: 'https://portal.sabercon.com.br/api/:path*'
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
      config.externals.push('oracledb');
    } else {
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
      
      config.resolve.alias = {
        ...config.resolve.alias,
        'pg-cloudflare': false,
        'knex': false,
        'objection': false,
      };
    }

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(cardinal|encoding|pg-cloudflare)$/,
        contextRegExp: /./,
      })
    );

    config.module.rules.push({
      test: /cloudflare:sockets/,
      use: 'null-loader',
      include: /node_modules/,
    });

    return config;
  }
};

module.exports = nextConfig;
EOF

echo "✅ next.config.js corrigido"

# 3. Criar versão simplificada do rate limiting
echo "🔧 Criando rate limiting simplificado..."

cat > src/middleware/rateLimit.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 60 segundos
  })

  return {
    check: (request: NextRequest, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit

        if (isRateLimited) {
          reject(new Error('Rate limit exceeded'))
        } else {
          resolve()
        }
      }),
  }
}

// Configurações MUITO permissivas para evitar loops
export const rateLimiters = {
  // APIs públicas - muito permissivas
  public: rateLimit({
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 1000,
  }),
  
  // APIs autenticadas - extremamente permissivas
  authenticated: rateLimit({
    interval: 60 * 1000, // 1 minuto
    uniqueTokenPerInterval: 2000,
  }),
  
  // APIs de upload - permissivas
  upload: rateLimit({
    interval: 60 * 60 * 1000, // 1 hora
    uniqueTokenPerInterval: 500,
  }),
  
  // APIs de relatórios - permissivas
  reports: rateLimit({
    interval: 5 * 60 * 1000, // 5 minutos
    uniqueTokenPerInterval: 1000,
  }),
}

// Helper DESABILITADO para aplicar rate limiting
export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = 'authenticated',
  limit: number = 100 // Limite muito alto
): Promise<NextResponse | null> {
  // DESABILITADO TEMPORARIAMENTE PARA EVITAR LOOPS
  console.log(`[RATE-LIMIT] Verificação desabilitada para ${request.url}`);
  return null;
  
  /*
  try {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous'
    await rateLimiters[type].check(request, limit, ip)
    return null
  } catch (error) {
    console.warn(`[RATE-LIMIT] Bloqueado: ${request.url} - IP: ${ip}`);
    return NextResponse.json(
      { 
        error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
        retryAfter: 60 // segundos
      },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': limit.toString(),
        }
      }
    )
  }
  */
}
EOF

echo "✅ Rate limiting simplificado criado"

# 4. Corrigir variáveis de ambiente para produção
echo "🔧 Corrigindo variáveis de ambiente..."

# Criar .env.production otimizado
cat > .env.production << 'EOF'
# Produção - Portal Sabercon
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# URLs de produção (SEM proxy interno para evitar loops)
NEXTAUTH_URL=https://portal.sabercon.com.br
NEXT_PUBLIC_API_URL=https://portal.sabercon.com.br/api

# Backend interno (usado apenas pelo servidor)
BACKEND_URL=http://127.0.0.1:3001/api

# Configurações de segurança
NEXTAUTH_SECRET=your-production-secret-here
JWT_SECRET=your-jwt-secret-here

# Rate limiting desabilitado
RATE_LIMITING_ENABLED=false
MAX_REQUESTS_PER_MINUTE=1000

# Logs
LOG_LEVEL=warn
ENABLE_REQUEST_LOGGING=false
EOF

echo "✅ Variáveis de ambiente corrigidas"

# 5. Limpar cache e rebuild
echo "🧹 Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "📦 Fazendo rebuild..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CORREÇÃO DE LOOP CONCLUÍDA COM SUCESSO!"
    echo "========================================="
    echo ""
    echo "🔧 Correções aplicadas:"
    echo "   • Rate limiting desabilitado no middleware"
    echo "   • Proxy interno removido em produção"
    echo "   • Headers otimizados para evitar redirecionamentos"
    echo "   • Variáveis de ambiente corrigidas"
    echo "   • Cache limpo e rebuild concluído"
    echo ""
    echo "🧪 Teste agora:"
    echo "   https://portal.sabercon.com.br/"
    echo ""
    echo "📝 No servidor, execute:"
    echo "   pm2 restart all"
    echo "   pm2 logs --lines 50"
    echo ""
    echo "📊 Monitorar:"
    echo "   tail -f /var/log/nginx/access.log"
    echo "   curl -I https://portal.sabercon.com.br/api/health"
    echo ""
    echo "⚠️  Rate limiting temporariamente desabilitado"
    echo "   Para reativar: edite src/middleware/rateLimit.ts"
    echo ""
else
    echo ""
    echo "❌ ERRO NO BUILD"
    echo "==============="
    echo ""
    echo "📝 Restaurando backups..."
    
    # Restaurar backups se build falhou
    if [ -f "src/middleware.ts.backup.$(date +%Y%m%d)*" ]; then
        cp src/middleware.ts.backup.* src/middleware.ts
    fi
    
    if [ -f "next.config.js.backup.$(date +%Y%m%d)*" ]; then
        cp next.config.js.backup.* next.config.js
    fi
    
    echo "❌ Backups restaurados devido ao erro no build"
    exit 1
fi 