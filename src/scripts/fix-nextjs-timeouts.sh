#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Aplicando correção de timeout para Next.js stack frames...${NC}"

# Fazer backup da configuração atual
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup-$(date +%Y%m%d-%H%M%S)

# Adicionar a configuração específica para Next.js
sudo sed -i '/location \/ {/i\
    # Next.js development endpoints (stack traces, HMR, etc)\
    location ~ ^\/(_next\/webpack-hmr|__nextjs_original-stack-frame) {\ 
        proxy_pass http://frontend_backend;\ 
        proxy_http_version 1.1;\ 
        proxy_set_header Upgrade $http_upgrade;\ 
        proxy_set_header Connection '\''upgrade'\'';\ 
        proxy_set_header Host $host;\ 
        proxy_set_header X-Real-IP $remote_addr;\ 
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\ 
        proxy_set_header X-Forwarded-Proto $scheme;\ 
        \ 
        # Timeouts aumentados para stack traces\ 
        proxy_connect_timeout 300s;\ 
        proxy_send_timeout 300s;\ 
        proxy_read_timeout 300s;\ 
        \ 
        # Desabilitar buffering para respostas em tempo real\ 
        proxy_buffering off;\ 
        proxy_cache off;\ 
        \ 
        # Aumentar tamanho dos buffers\ 
        proxy_buffer_size 128k;\ 
        proxy_buffers 4 256k;\ 
        proxy_busy_buffers_size 256k;\ 
    }\ 
    ' /etc/nginx/sites-available/default

# Testar configuração
if sudo nginx -t; then
    echo -e "${GREEN}✅ Configuração do Nginx válida${NC}"
    
    # Recarregar Nginx
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx recarregado com sucesso${NC}"
else
    echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Correção aplicada com sucesso!${NC}"
