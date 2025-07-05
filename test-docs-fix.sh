#!/bin/bash

# Script para testar se o loop da rota /api/docs foi resolvido
# Portal Sabercon - Verificar correção do loop 301
# Execute: bash test-docs-fix.sh

echo "🧪 TESTANDO CORREÇÃO DO LOOP /api/docs"
echo "======================================"

# Função para testar uma URL e detectar loops
test_url_for_loops() {
    local url=$1
    local max_redirects=5
    local timeout=10
    
    echo "📡 Testando: $url"
    
    # Usar curl com limite de redirecionamentos para detectar loops
    local response=$(curl -s -L --max-redirs $max_redirects --connect-timeout $timeout \
                     -w "HTTPSTATUS:%{http_code};REDIRECTS:%{num_redirects};TIME:%{time_total}" \
                     "$url" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        local http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        local redirects=$(echo "$response" | grep -o "REDIRECTS:[0-9]*" | cut -d: -f2)
        local time=$(echo "$response" | grep -o "TIME:[0-9.]*" | cut -d: -f2)
        
        echo "   Status: $http_code"
        echo "   Redirecionamentos: $redirects"
        echo "   Tempo: ${time}s"
        
        if [ "$redirects" -ge "$max_redirects" ]; then
            echo "   ⚠️  POSSÍVEL LOOP DETECTADO (muitos redirecionamentos)"
            return 1
        elif [ "$http_code" = "200" ]; then
            echo "   ✅ OK - Sem loop"
            return 0
        elif [ "$http_code" = "301" ] || [ "$http_code" = "302" ]; then
            echo "   ⚠️  Redirecionamento detectado"
            return 1
        else
            echo "   ℹ️  Status: $http_code"
            return 0
        fi
    else
        echo "   ❌ Erro na conexão"
        return 1
    fi
}

# Testar se o backend está rodando
echo "🔍 Verificando se o backend está rodando..."

if pgrep -f "node.*backend" > /dev/null; then
    echo "✅ Backend está rodando"
elif pgrep -f "npm.*start" > /dev/null; then
    echo "✅ Processo npm start detectado"
else
    echo "⚠️  Backend pode não estar rodando"
    echo "💡 Para testar, inicie o backend com: cd backend && npm start"
fi

echo ""

# URLs para testar
urls=(
    "https://portal.sabercon.com.br/api/docs"
    "https://portal.sabercon.com.br/api/health"
    "https://portal.sabercon.com.br/api/docs.json"
)

echo "🧪 Testando URLs para detectar loops..."
echo ""

all_ok=true

for url in "${urls[@]}"; do
    if ! test_url_for_loops "$url"; then
        all_ok=false
    fi
    echo ""
done

# Teste específico para detectar loop repetindo a mesma URL
echo "🔄 Teste específico de loop - fazendo 10 requisições para /api/docs..."

loop_detected=false
for i in {1..10}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" https://portal.sabercon.com.br/api/docs 2>/dev/null)
    if [ "$response" = "301" ] || [ "$response" = "302" ]; then
        echo "   Requisição $i: $response (redirecionamento)"
        loop_detected=true
    elif [ "$response" = "200" ]; then
        echo "   Requisição $i: $response (OK)"
    else
        echo "   Requisição $i: $response"
    fi
done

echo ""

# Resultado final
if [ "$all_ok" = true ] && [ "$loop_detected" = false ]; then
    echo "✅ TESTE CONCLUÍDO - LOOP RESOLVIDO!"
    echo "=================================="
    echo ""
    echo "🎉 A rota /api/docs não apresenta mais loops"
    echo "✅ Todas as URLs testadas estão funcionando corretamente"
    echo ""
    echo "📝 Próximos passos no servidor:"
    echo "   1. bash deploy-production.sh"
    echo "   2. pm2 restart PortalServerBackend"
    echo "   3. pm2 logs PortalServerBackend --lines 20"
    echo ""
elif [ "$loop_detected" = true ]; then
    echo "❌ LOOP AINDA DETECTADO"
    echo "======================"
    echo ""
    echo "⚠️  A rota /api/docs ainda apresenta redirecionamentos"
    echo "💡 Possíveis causas:"
    echo "   • Backend não foi reiniciado"
    echo "   • Configuração do Nginx ainda problemática"
    echo "   • Cache do navegador/proxy"
    echo ""
    echo "🔧 Soluções:"
    echo "   1. Reiniciar o backend: pm2 restart PortalServerBackend"
    echo "   2. Limpar cache do Nginx: sudo systemctl restart nginx"
    echo "   3. Verificar logs: pm2 logs PortalServerBackend"
    echo ""
else
    echo "⚠️  ALGUNS PROBLEMAS DETECTADOS"
    echo "=============================="
    echo ""
    echo "💡 Verifique os resultados acima e:"
    echo "   • Certifique-se de que o backend está rodando"
    echo "   • Verifique se as portas estão corretas"
    echo "   • Reinicie os serviços se necessário"
    echo ""
fi

echo "📊 Para monitorar em produção:"
echo "   tail -f /var/log/nginx/access.log | grep '/api/docs'"
echo "   pm2 logs PortalServerBackend --lines 50 | grep 'GET /api/docs'"
echo "" 