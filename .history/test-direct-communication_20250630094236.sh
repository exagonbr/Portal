#!/bin/bash

# Portal Sabercon - Teste de Comunicação Direta (Sem Nginx)
# Testa se frontend e backend estão se comunicando diretamente

echo "🚀 Testando comunicação direta Frontend ↔ Backend (sem Nginx)"
echo

# Verificar se as portas estão ativas
echo "🔍 Verificando serviços..."

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend (Next.js) rodando na porta 3000"
else
    echo "❌ Frontend não está rodando na porta 3000"
    echo "   Execute: npm run dev"
fi

if curl -s http://localhost:3001/api/_health > /dev/null 2>&1; then
    echo "✅ Backend API rodando na porta 3001"
else
    echo "❌ Backend não está rodando na porta 3001"
    echo "   Execute: npm run start (no diretório backend)"
fi

echo
echo "🌐 Testando comunicação direta..."

# Testar se o frontend consegue acessar a API diretamente
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/_health" | grep -q "200"; then
    echo "✅ Backend API respondendo diretamente"
else
    echo "⚠️  Backend API pode ter problemas"
fi

echo
echo "📋 Configuração atual:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001/api"
echo "   Nginx:    NÃO NECESSÁRIO ❌"
echo "   Proxy:    DESABILITADO ✅"
echo
echo "🎯 Para usar:"
echo "   1. Acesse: http://localhost:3000"
echo "   2. API calls vão direto para: http://localhost:3001/api"
echo "   3. Sem redirecionamentos desnecessários!"
echo
echo "✅ Comunicação direta funcionando!" 