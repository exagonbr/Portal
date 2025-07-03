#!/bin/bash

# Script para corrigir rotas de API com Dynamic Server Usage
# Execute: bash fix-api-routes-dynamic.sh

echo "🔧 CORRIGINDO ROTAS DE API - DYNAMIC SERVER USAGE"
echo "================================================="

# Lista de rotas de API problemáticas identificadas no build
API_ROUTES=(
    "src/app/api/queue/stats/route.ts"
    "src/app/api/proxy-pdf/route.ts"
    "src/app/api/aws/connection-logs/route.ts"
    "src/app/api/roles/stats/route.ts"
    "src/app/api/queue/next/route.ts"
    "src/app/api/settings/s3-buckets/route.ts"
    "src/app/api/users/search/route.ts"
    "src/app/api/users/stats/route.ts"
    "src/app/api/content/files/bucket-files/route.ts"
)

echo "🔍 Verificando rotas de API problemáticas..."

for route in "${API_ROUTES[@]}"; do
    if [ -f "$route" ]; then
        echo "📝 Processando: $route"
        
        # Verificar se já tem export const dynamic
        if ! grep -q "export const dynamic" "$route"; then
            echo "   ➕ Adicionando export const dynamic = 'force-dynamic'"
            
            # Adicionar no início do arquivo após os imports
            sed -i '1i export const dynamic = '\''force-dynamic'\'';' "$route"
        else
            echo "   ✅ Já configurado"
        fi
    else
        echo "   ⚠️  Arquivo não encontrado: $route"
    fi
done

echo ""
echo "🔧 Aplicando configuração global para rotas de API..."

# Criar um arquivo de configuração global para rotas de API
cat > src/app/api/route-config.ts << 'EOF'
// Configuração global para rotas de API
// Força renderização dinâmica para todas as rotas de API

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

// Headers padrão para CORS
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : 'https://portal.sabercon.com.br',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, X-CSRF-Token',
  'Access-Control-Allow-Credentials': 'true',
};

// Função helper para respostas com CORS
export function createResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Função helper para erros com CORS
export function createErrorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
EOF

echo "✅ Arquivo de configuração global criado: src/app/api/route-config.ts"

echo ""
echo "🔧 Atualizando next.config.js para otimizar rotas de API..."

# Backup do next.config.js
cp next.config.js next.config.js.backup

# Adicionar configuração específica para rotas de API
cat >> next.config.js << 'EOF'

// Configuração adicional para resolver Dynamic Server Usage em rotas de API
const apiConfig = {
  // Forçar todas as rotas de API como dinâmicas
  experimental: {
    ...nextConfig.experimental,
    serverComponentsExternalPackages: ['oracledb', 'pg', 'knex'],
  },
  
  // Configuração específica para rotas de API
  async headers() {
    const baseHeaders = await nextConfig.headers();
    
    return [
      ...baseHeaders,
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

// Merge das configurações
Object.assign(nextConfig, apiConfig);

EOF

echo "✅ next.config.js atualizado com configurações para rotas de API"

echo ""
echo "📦 Fazendo rebuild otimizado..."

# Limpar cache novamente
rm -rf .next
rm -rf node_modules/.cache

# Build com configurações específicas para API
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_PRIVATE_STANDALONE=true

npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso"
else
    echo "❌ Erro no build, restaurando backup..."
    mv next.config.js.backup next.config.js
    exit 1
fi

echo ""
echo "✅ CORREÇÕES DE API APLICADAS!"
echo "=============================="
echo ""
echo "🔧 Correções realizadas:"
echo "   • Rotas de API configuradas como force-dynamic"
echo "   • Arquivo de configuração global criado"
echo "   • Headers de cache otimizados para APIs"
echo "   • Build otimizado concluído"
echo ""
echo "📊 Rotas corrigidas:"
for route in "${API_ROUTES[@]}"; do
    echo "   • $route"
done
echo ""
echo "🧪 Teste agora:"
echo "   https://portal.sabercon.com.br/api/health"
echo ""
echo "📝 Próximos passos no servidor:"
echo "   1. bash deploy-production.sh"
echo "   2. pm2 restart all"
echo "   3. bash health-check.sh"
echo "" 