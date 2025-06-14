#!/bin/bash

# Script para corrigir erros 404 do NextAuth
# Execute: bash fix-nextauth-404.sh

echo "🔧 CORRIGINDO ERROS 404 DO NEXTAUTH"
echo "==================================="

# 1. Rebuild do frontend com as correções
echo "📦 Fazendo rebuild do frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso"
else
    echo "❌ Erro no build"
    exit 1
fi

# 2. Restart do PM2
echo "🔄 Reiniciando aplicações PM2..."
pm2 restart PortalServerFrontend
pm2 restart PortalServerBackend

# 3. Verificar status
echo "📊 Verificando status..."
pm2 list

echo ""
echo "✅ CORREÇÕES APLICADAS!"
echo "======================"
echo ""
echo "🔧 Correções realizadas:"
echo "   • Removido SessionProvider do NextAuth"
echo "   • Removido imports NextAuth do LoginForm"
echo "   • Removido middleware NextAuth"
echo "   • Removido arquivo [...nextauth]/route.ts"
echo "   • Desabilitado login Google temporariamente"
echo ""
echo "🧪 Teste agora:"
echo "   https://portal.sabercon.com.br/"
echo ""
echo "📝 Verificar logs:"
echo "   pm2 logs PortalServerFrontend"
echo "   pm2 logs PortalServerBackend"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   • Não deve mais aparecer erro 404 para /api/auth/session"
echo "   • Login Google está desabilitado temporariamente"
echo "   • Use apenas email e senha para login"
echo "" 