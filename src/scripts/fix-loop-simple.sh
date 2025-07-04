#!/bin/bash

# Script simples para corrigir loop de rate limiting
# Portal Sabercon - Resolver 301/308 e loops de requisições
# Execute: bash fix-loop-simple.sh

echo "🔧 CORREÇÃO SIMPLES - LOOP DE RATE LIMITING"
echo "==========================================="

# 1. Desabilitar rate limiting criando versão simplificada
echo "🔧 Desabilitando rate limiting..."

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
    ttl: options?.interval || 60000,
  })

  return {
    check: (request: NextRequest, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        // DESABILITADO: sempre resolve para evitar loops
        resolve()
      }),
  }
}

// Configurações desabilitadas
export const rateLimiters = {
  public: rateLimit(),
  authenticated: rateLimit(),
  upload: rateLimit(),
  reports: rateLimit(),
}

// Helper DESABILITADO para aplicar rate limiting
export async function applyRateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = 'authenticated',
  limit: number = 100
): Promise<NextResponse | null> {
  // COMPLETAMENTE DESABILITADO PARA EVITAR LOOPS
  console.log(`[RATE-LIMIT] DESABILITADO para ${request.url}`);
  return null;
}
EOF

echo "✅ Rate limiting desabilitado"

# 2. Corrigir next.config.js para remover proxy em produção
echo "🔧 Corrigindo next.config.js..."

# Backup
cp next.config.js next.config.js.backup.$(date +%Y%m%d-%H%M%S)

# Substituir apenas a função rewrites
cat > temp_rewrites.js << 'EOF'
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
    const apiDestination = 'https://portal.sabercon.com.br/api/:path*';
    
    console.log(`🔄 Proxy configurado para desenvolvimento: ${apiDestination}`);
    
    return [
      {
        source: '/api/:path*',
        destination: apiDestination
      }
    ];
  },
EOF

# Substituir a função rewrites no next.config.js
sed -i '/async rewrites()/,/},/c\
  // CORREÇÃO: Configuração de proxy mais específica para evitar loops\
  async rewrites() {\
    // Em produção com ALB, NÃO usar proxy interno para evitar loops\
    // O ALB já faz o roteamento correto\
    if (process.env.NODE_ENV === '\''production'\'') {\
      console.log('\''🚫 Proxy interno desabilitado em produção para evitar loops'\'');\
      return [];\
    }\
    \
    // Apenas em desenvolvimento usar proxy\
    const isDev = process.env.NODE_ENV === '\''development'\'';\
    const apiDestination = '\''https://portal.sabercon.com.br/api/:path*'\'';\
    \
    console.log(`🔄 Proxy configurado para desenvolvimento: ${apiDestination}`);\
    \
    return [\
      {\
        source: '\''/api/:path*'\'',\
        destination: apiDestination\
      }\
    ];\
  },' next.config.js

rm temp_rewrites.js

echo "✅ next.config.js corrigido"

# 3. Criar .env.production otimizado
echo "🔧 Criando .env.production otimizado..."

cat > .env.production << 'EOF'
# Produção - Portal Sabercon
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# URLs de produção (SEM proxy interno para evitar loops)
NEXTAUTH_URL=https://portal.sabercon.com.br
NEXT_PUBLIC_API_URL=https://portal.sabercon.com.br/api

# Backend interno (usado apenas pelo servidor)
BACKEND_URL=https://portal.sabercon.com.br/api

# Rate limiting desabilitado
RATE_LIMITING_ENABLED=false
MAX_REQUESTS_PER_MINUTE=1000

# Logs reduzidos
LOG_LEVEL=warn
ENABLE_REQUEST_LOGGING=false
EOF

echo "✅ .env.production criado"

# 4. Limpar cache e rebuild
echo "🧹 Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "📦 Fazendo rebuild..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CORREÇÃO SIMPLES CONCLUÍDA COM SUCESSO!"
    echo "========================================="
    echo ""
    echo "🔧 Correções aplicadas:"
    echo "   • Rate limiting completamente desabilitado"
    echo "   • Proxy interno removido em produção"
    echo "   • .env.production otimizado"
    echo "   • Cache limpo e rebuild concluído"
    echo ""
    echo "🧪 Teste agora:"
    echo "   https://portal.sabercon.com.br/"
    echo ""
    echo "📝 No servidor, execute:"
    echo "   bash deploy-production.sh"
    echo "   pm2 restart all"
    echo ""
    echo "📊 Monitorar:"
    echo "   pm2 logs --lines 20"
    echo "   curl -I https://portal.sabercon.com.br/api/health"
    echo ""
    echo "⚠️  RATE LIMITING COMPLETAMENTE DESABILITADO"
    echo "   Sistema funcionará sem limitação de requisições"
    echo ""
else
    echo ""
    echo "❌ ERRO NO BUILD"
    echo "==============="
    echo ""
    echo "📝 Restaurando backup do next.config.js..."
    
    # Restaurar backup se build falhou
    if [ -f "next.config.js.backup.$(date +%Y%m%d)*" ]; then
        cp next.config.js.backup.* next.config.js
        echo "✅ Backup restaurado"
    fi
    
    echo "💡 Tente executar manualmente: npm run build"
    exit 1
fi 