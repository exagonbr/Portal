#!/bin/bash

# Script de emergência para reiniciar o portal
echo "🚨 REINICIALIZAÇÃO DE EMERGÊNCIA DO PORTAL"
echo "=========================================="

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Execute como root: sudo bash emergency-restart.sh"
    exit 1
fi

# Parar todos os processos Node.js
echo "⏹️  Parando todos os processos Node.js..."
pkill -f node || true
sleep 2

# Verificar se ainda há processos
if pgrep -f node > /dev/null; then
    echo "⚠️  Forçando parada de processos Node.js..."
    pkill -9 -f node || true
    sleep 2
fi

# Iniciar o frontend
echo "🚀 Iniciando o frontend..."
cd /var/www/portal
NODE_ENV=production nohup node server.js > /var/log/portal-frontend.log 2>&1 &
echo "✅ Frontend iniciado"

# Iniciar o backend
echo "🚀 Iniciando o backend..."
cd /var/www/portal/backend
NODE_ENV=production nohup node dist/index.js > /var/log/portal-backend.log 2>&1 &
echo "✅ Backend iniciado"

# Verificar se os processos estão rodando
echo "🔍 Verificando processos..."
sleep 5

if pgrep -f "node server.js" > /dev/null; then
    echo "✅ Frontend está rodando"
else
    echo "❌ Frontend não está rodando"
fi

if pgrep -f "node dist/index.js" > /dev/null; then
    echo "✅ Backend está rodando"
else
    echo "❌ Backend não está rodando"
fi

echo ""
echo "📝 Logs:"
echo "   Frontend: /var/log/portal-frontend.log"
echo "   Backend: /var/log/portal-backend.log"
echo ""
echo "✅ REINICIALIZAÇÃO CONCLUÍDA"
echo "" 