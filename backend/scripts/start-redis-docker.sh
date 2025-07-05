#!/bin/bash

# Script para iniciar Redis com Docker
# Útil para desenvolvimento local

echo "🐳 Iniciando Redis com Docker..."

# Verifica se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale o Docker primeiro."
    echo "📦 Baixe em: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Para qualquer instância existente do Redis
echo "🛑 Parando instâncias existentes do Redis..."
docker stop redis-portal 2>/dev/null || echo "ℹ️  Nenhuma instância Redis rodando"
docker rm redis-portal 2>/dev/null || echo "ℹ️  Nenhum container Redis para remover"

# Inicia nova instância do Redis
echo "🚀 Iniciando nova instância do Redis..."
docker run -d \
  --name redis-portal \
  -p 6379:6379 \
  --restart unless-stopped \
  redis:alpine \
  redis-server --appendonly yes

# Verifica se iniciou corretamente
sleep 2
if docker ps | grep -q redis-portal; then
    echo "✅ Redis iniciado com sucesso!"
    echo "🔗 Conectado na porta 6379"
    echo "📊 Para verificar logs: docker logs redis-portal"
    echo "🛑 Para parar: docker stop redis-portal"
    echo ""
    echo "🧪 Testando conexão..."
    
    # Testa a conexão
    if command -v redis-cli &> /dev/null; then
        redis-cli ping
    else
        echo "💡 Para testar manualmente: redis-cli ping"
        echo "💡 Ou execute: npm run check:redis"
    fi
else
    echo "❌ Erro ao iniciar Redis"
    docker logs redis-portal
    exit 1
fi 