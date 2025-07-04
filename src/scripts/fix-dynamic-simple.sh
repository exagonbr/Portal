#!/bin/bash

# Script simples para corrigir Dynamic Server Usage
# Execute: bash fix-dynamic-simple.sh

echo "🔧 CORREÇÃO SIMPLES - DYNAMIC SERVER USAGE"
echo "=========================================="

# Rotas de API que precisam ser corrigidas
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

echo "🔍 Corrigindo rotas de API problemáticas..."

for route in "${API_ROUTES[@]}"; do
    if [ -f "$route" ]; then
        echo "📝 Processando: $route"
        
        # Verificar se já tem export const dynamic
        if ! grep -q "export const dynamic" "$route"; then
            echo "   ➕ Adicionando configuração dinâmica"
            
            # Criar arquivo temporário com a configuração no topo
            {
                echo "export const dynamic = 'force-dynamic';"
                echo "export const runtime = 'nodejs';"
                echo ""
                cat "$route"
            } > "${route}.tmp"
            
            # Substituir o arquivo original
            mv "${route}.tmp" "$route"
            echo "   ✅ Configurado"
        else
            echo "   ✅ Já configurado"
        fi
    else
        echo "   ⚠️  Arquivo não encontrado: $route"
    fi
done

echo ""
echo "🧹 Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache

echo ""
echo "📦 Fazendo build..."

# Build simples
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CORREÇÃO CONCLUÍDA COM SUCESSO!"
    echo "================================="
    echo ""
    echo "🔧 Rotas corrigidas:"
    for route in "${API_ROUTES[@]}"; do
        if [ -f "$route" ]; then
            echo "   ✅ $route"
        fi
    done
    echo ""
    echo "🧪 Teste agora:"
    echo "   https://portal.sabercon.com.br/"
    echo ""
    echo "📝 No servidor, execute:"
    echo "   pm2 restart all"
    echo ""
else
    echo ""
    echo "❌ ERRO NO BUILD"
    echo "==============="
    echo ""
    echo "📝 Verifique os logs acima para mais detalhes"
    echo "💡 Tente executar: npm run build"
    echo ""
    exit 1
fi 