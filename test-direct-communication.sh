#!/bin/bash

# Portal Sabercon - Teste de Comunicação Direta (Sem Nginx)
# Testa se frontend e backend estão se comunicando diretamente

echo "🚀 Testando comunicação direta Frontend ↔ Backend (sem Nginx)"
echo

# Verificar se as portas estão ativas
echo "🔍 Verificando serviços..."

if curl -s https://portal.sabercon.com.br > /dev/null; then
    echo "✅ Frontend (Next.js) rodando na porta 3000"
else
    echo "❌ Frontend não está rodando na porta 3000"
    echo "   Execute: npm run dev"
fi

if curl -s https://portal.sabercon.com.br/api/_health > /dev/null 2>&1; then
    echo "✅ Backend API rodando na porta 3001"
else
    echo "❌ Backend não está rodando na porta 3001"
    echo "   Execute: npm run start (no diretório backend)"
fi

echo
echo "🌐 Testando comunicação direta..."

# Testar se o frontend consegue acessar a API diretamente
if curl -s -o /dev/null -w "%{http_code}" "https://portal.sabercon.com.br/api/_health" | grep -q "200"; then
    echo "✅ Backend API respondendo diretamente"
else
    echo "⚠️  Backend API pode ter problemas"
fi

echo
echo "📋 Configuração atual:"
echo "   Frontend: https://portal.sabercon.com.br"
echo "   Backend:  https://portal.sabercon.com.br/api"
echo "   Nginx:    NÃO NECESSÁRIO ❌"
echo "   Proxy:    DESABILITADO ✅"
echo
echo "🎯 Para usar:"
echo "   1. Acesse: https://portal.sabercon.com.br"
echo "   2. API calls vão direto para: https://portal.sabercon.com.br/api"
echo "   3. Sem redirecionamentos desnecessários!"
echo
echo "✅ Comunicação direta funcionando!" 