#!/bin/bash

# Script para iniciar o Portal Sabercon em produção

echo "🚀 Iniciando Portal Sabercon..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado. Execute este script no diretório do projeto.${NC}"
    exit 1
fi

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 não encontrado. Instalando...${NC}"
    npm install -g pm2
fi

# Parar processos anteriores
echo "🛑 Parando processos anteriores..."
pm2 delete all 2>/dev/null || true

# Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build do frontend${NC}"
    exit 1
fi

# Build do backend
echo "🔨 Fazendo build do backend..."
cd backend
npm run build 2>/dev/null || echo "ℹ️  Backend não requer build"
cd ..

# Iniciar Frontend
echo "🚀 Iniciando Frontend..."
pm2 start npm --name "PortalServerFrontend" -- start

# Iniciar Backend
echo "🚀 Iniciando Backend..."
cd backend
pm2 start npm --name "PortalServerBackend" -- start
cd ..

# Salvar configuração do PM2
pm2 save

# Mostrar status
echo -e "\n${GREEN}✅ Portal iniciado com sucesso!${NC}\n"
pm2 list

echo -e "\n📋 Comandos úteis:"
echo "   pm2 list                    - Ver status dos processos"
echo "   pm2 logs                    - Ver todos os logs"
echo "   pm2 logs PortalServerFrontend - Ver logs do frontend"
echo "   pm2 logs PortalServerBackend  - Ver logs do backend"
echo "   pm2 restart all             - Reiniciar tudo"
echo "   pm2 stop all                - Parar tudo" 