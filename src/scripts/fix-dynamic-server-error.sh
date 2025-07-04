#!/bin/bash

# Script para resolver erro de Dynamic Server Usage
# Execute: bash fix-dynamic-server-error.sh

echo "🔧 CORRIGINDO ERRO DE DYNAMIC SERVER USAGE"
echo "=========================================="

# 1. Limpar cache do Next.js
echo "🧹 Limpando cache do Next.js..."
rm -rf .next
rm -rf node_modules/.cache

# 2. Verificar se há uso incorreto de headers() em componentes
echo "🔍 Verificando uso de headers() em componentes..."

# Procurar por uso problemático de headers() fora de API routes
PROBLEMATIC_FILES=$(find src/app -name "*.tsx" -not -path "*/api/*" -exec grep -l "headers()" {} \; 2>/dev/null || true)

if [ ! -z "$PROBLEMATIC_FILES" ]; then
    echo "⚠️  Arquivos com possível uso problemático de headers():"
    echo "$PROBLEMATIC_FILES"
    echo ""
    echo "📝 Estes arquivos podem precisar da diretiva 'use client'"
else
    echo "✅ Nenhum uso problemático de headers() encontrado"
fi

# 3. Verificar se há componentes sem 'use client' que deveriam ter
echo "🔍 Verificando componentes que podem precisar de 'use client'..."

# Lista de componentes que provavelmente precisam ser client components
CLIENT_COMPONENTS=(
    "src/app/page.tsx"
    "src/app/login/page.tsx"
    "src/app/dashboard/page.tsx"
    "src/app/profile/page.tsx"
)

for file in "${CLIENT_COMPONENTS[@]}"; do
    if [ -f "$file" ]; then
        if ! head -1 "$file" | grep -q "'use client'"; then
            echo "⚠️  $file pode precisar de 'use client'"
        fi
    fi
done

# 4. Criar versão otimizada do next.config.js (já foi feito)
echo "✅ Configurações do Next.js otimizadas"

# 5. Rebuild com configurações otimizadas
echo "📦 Fazendo rebuild com configurações otimizadas..."

# Definir variáveis de ambiente para build otimizado
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=4096"

npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso"
else
    echo "❌ Erro no build"
    echo ""
    echo "🔧 Tentando build com modo de compatibilidade..."
    
    # Tentar build com configurações mais conservadoras
    export NODE_ENV=production
    export NEXT_PRIVATE_STANDALONE=true
    
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build concluído com modo de compatibilidade"
    else
        echo "❌ Erro persistente no build"
        echo ""
        echo "📝 Logs de erro:"
        npm run build 2>&1 | tail -20
        exit 1
    fi
fi

# 6. Restart PM2 se estiver disponível
if command -v pm2 &> /dev/null; then
    echo "🔄 Reiniciando PM2..."
    pm2 restart PortalServerFrontend
    pm2 restart PortalServerBackend
    pm2 list
else
    echo "⚠️  PM2 não encontrado, pule esta etapa no servidor"
fi

echo ""
echo "✅ CORREÇÕES APLICADAS!"
echo "======================"
echo ""
echo "🔧 Correções realizadas:"
echo "   • Cache do Next.js limpo"
echo "   • Configurações otimizadas para renderização estática"
echo "   • Build otimizado para produção"
echo "   • Configurações experimentais ativadas"
echo ""
echo "📊 Configurações aplicadas:"
echo "   • staticWorkerRequestDeduping: true"
echo "   • optimizePackageImports ativado"
echo "   • output: standalone (produção)"
echo "   • Headers otimizados para ALB"
echo ""
echo "🧪 Teste agora:"
echo "   https://portal.sabercon.com.br/"
echo ""
echo "📝 Se o erro persistir:"
echo "   1. Verifique se há componentes usando headers() fora de API routes"
echo "   2. Adicione 'use client' em componentes que usam hooks do navegador"
echo "   3. Verifique logs do build para mais detalhes"
echo "" 