#!/bin/bash

# Script para corrigir erro 502 Bad Gateway

echo "🔧 Corrigindo erro 502 Bad Gateway..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Verificar status do Nginx
echo -e "\n${BLUE}1. Verificando Nginx...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx está rodando${NC}"
else
    echo -e "${RED}❌ Nginx não está rodando. Iniciando...${NC}"
    sudo systemctl start nginx
fi

# 2. Verificar se as aplicações estão rodando
echo -e "\n${BLUE}2. Verificando aplicações...${NC}"

# Verificar PM2
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 list 2>/dev/null | grep -E "PortalServer|online" || echo "")
    if [ -z "$PM2_STATUS" ]; then
        echo -e "${YELLOW}⚠️  Nenhuma aplicação rodando no PM2${NC}"
        NEED_START=true
    else
        echo -e "${GREEN}✅ Aplicações encontradas no PM2${NC}"
        pm2 list
    fi
else
    echo -e "${YELLOW}⚠️  PM2 não instalado. Instalando...${NC}"
    sudo npm install -g pm2
    NEED_START=true
fi

# 3. Verificar portas
echo -e "\n${BLUE}3. Verificando portas...${NC}"
if sudo netstat -tlnp | grep -q ":3000"; then
    echo -e "${GREEN}✅ Frontend rodando na porta 3000${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend não está rodando na porta 3000${NC}"
    NEED_START=true
fi

if sudo netstat -tlnp | grep -q ":3001"; then
    echo -e "${GREEN}✅ Backend rodando na porta 3001${NC}"
else
    echo -e "${YELLOW}⚠️  Backend não está rodando na porta 3001${NC}"
    NEED_START=true
fi

# 4. Iniciar aplicações se necessário
if [ "$NEED_START" = true ]; then
    echo -e "\n${BLUE}4. Iniciando aplicações...${NC}"
    
    # Parar tudo primeiro
    pm2 delete all 2>/dev/null || true
    
    # Verificar se existe build
    if [ ! -d ".next" ]; then
        echo -e "${YELLOW}⚠️  Build não encontrado. Executando build...${NC}"
        echo "Isso pode levar alguns minutos..."
        npm run build || {
            echo -e "${RED}❌ Erro no build. Tentando modo desenvolvimento...${NC}"
            # Iniciar em modo desenvolvimento se o build falhar
            pm2 start npm --name "PortalServerFrontend" -- run dev
            cd backend && pm2 start npm --name "PortalServerBackend" -- run dev && cd ..
            pm2 save
            echo -e "${YELLOW}⚠️  Aplicações iniciadas em modo DESENVOLVIMENTO${NC}"
            echo -e "${YELLOW}   Para produção, corrija os erros de build e execute novamente${NC}"
            exit 0
        }
    fi
    
    # Iniciar em modo produção
    echo "Iniciando frontend..."
    pm2 start npm --name "PortalServerFrontend" -- start
    
    echo "Iniciando backend..."
    cd backend && pm2 start npm --name "PortalServerBackend" -- start && cd ..
    
    # Salvar configuração
    pm2 save
    pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true
    
    echo -e "${GREEN}✅ Aplicações iniciadas${NC}"
fi

# 5. Verificar configuração do Nginx
echo -e "\n${BLUE}5. Verificando configuração do Nginx...${NC}"
NGINX_CONFIG="/etc/nginx/sites-enabled/default"
if [ -f "$NGINX_CONFIG" ]; then
    if grep -q "proxy_pass.*localhost:3000" "$NGINX_CONFIG"; then
        echo -e "${GREEN}✅ Nginx configurado para proxy do frontend${NC}"
    else
        echo -e "${YELLOW}⚠️  Nginx pode não estar configurado corretamente${NC}"
        echo "   Verifique $NGINX_CONFIG"
    fi
else
    echo -e "${RED}❌ Arquivo de configuração do Nginx não encontrado${NC}"
fi

# 6. Testar conexão
echo -e "\n${BLUE}6. Testando conexão...${NC}"
sleep 5  # Aguardar serviços iniciarem

# Testar frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Frontend respondendo corretamente${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend pode não estar respondendo corretamente${NC}"
fi

# Testar backend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep -q "200\|404"; then
    echo -e "${GREEN}✅ Backend respondendo${NC}"
else
    echo -e "${YELLOW}⚠️  Backend pode não estar respondendo corretamente${NC}"
fi

# 7. Resumo final
echo -e "\n${BLUE}=== RESUMO ===${NC}"
pm2 list
echo -e "\n${GREEN}✅ Processo de correção concluído!${NC}"
echo -e "\n📋 Comandos úteis:"
echo "   pm2 logs                    - Ver todos os logs"
echo "   pm2 logs PortalServerFrontend - Ver logs do frontend"
echo "   pm2 logs PortalServerBackend  - Ver logs do backend"
echo "   pm2 restart all             - Reiniciar tudo"
echo "   sudo nginx -s reload        - Recarregar Nginx"
echo -e "\n${YELLOW}⚠️  Se o erro 502 persistir:${NC}"
echo "   1. Verifique os logs: pm2 logs"
echo "   2. Verifique o Nginx: sudo nginx -t"
echo "   3. Verifique as portas: sudo netstat -tlnp | grep -E '3000|3001'" 