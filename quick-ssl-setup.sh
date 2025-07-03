#!/bin/bash

# Script rápido para SSL Let's Encrypt - Portal Sabercon
# Frontend: localhost:3000 via HTTPS | Backend: localhost:3001 via HTTPS
# Execute como root: sudo bash quick-ssl-setup.sh

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configurações
IP="54.232.72.62"
FRONTEND_PORT="3000"
BACKEND_PORT="3001"
EMAIL="admin@sabercon.com.br"  # ALTERE ESTE EMAIL

echo -e "${BLUE}🚀 Configuração SSL Portal Sabercon${NC}"
echo -e "${BLUE}📱 Frontend: https://$IP → localhost:$FRONTEND_PORT${NC}"
echo -e "${BLUE}🔧 Backend:  https://$IP/api → localhost:$BACKEND_PORT${NC}"
echo -e "${BLUE}🔧 Backend:  https://$IP/backend → localhost:$BACKEND_PORT${NC}"
echo -e "${BLUE}📧 Email: $EMAIL${NC}"
echo ""

# Verificar root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Execute como root: sudo bash quick-ssl-setup.sh${NC}"
    exit 1
fi

# Verificar se as aplicações estão rodando
echo -e "${BLUE}🔍 Verificando se as aplicações estão rodando...${NC}"
if ! netstat -tlnp | grep "127.0.0.1:${FRONTEND_PORT}\|localhost:${FRONTEND_PORT}\|:${FRONTEND_PORT}" > /dev/null; then
    echo -e "${YELLOW}⚠️  Frontend não encontrado na porta ${FRONTEND_PORT}${NC}"
    echo "Execute: pm2 list para verificar se PortalServerFrontend está rodando"
fi
if ! netstat -tlnp | grep "127.0.0.1:${BACKEND_PORT}\|localhost:${BACKEND_PORT}\|:${BACKEND_PORT}" > /dev/null; then
    echo -e "${YELLOW}⚠️  Backend não encontrado na porta ${BACKEND_PORT}${NC}"
    echo "Execute: pm2 list para verificar se PortalServerBackend está rodando"
fi

# Atualizar e instalar
echo -e "${BLUE}📦 Instalando dependências...${NC}"
apt update -qq
apt install -y nginx certbot python3-certbot-nginx net-tools

# Configurar firewall básico
echo -e "${BLUE}🔥 Configurando firewall...${NC}"
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow $FRONTEND_PORT
ufw allow $BACKEND_PORT
ufw --force enable

# Parar nginx
systemctl stop nginx 2>/dev/null || true

# Configuração nginx com proxy para ambos serviços
echo -e "${BLUE}⚙️ Configurando Nginx para Frontend e Backend...${NC}"
cat > /etc/nginx/sites-available/default << EOF
# Portal Sabercon - Frontend + Backend
server {
    listen 80;
    server_name $IP;
    
    # Frontend (raiz do site) → localhost:3000
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Headers para PWA
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Timeout
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Backend API → localhost:3001/api
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Headers para API
        proxy_set_header Content-Type application/json;
        proxy_set_header Accept application/json;
        
        # CORS básico
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        
        # Timeout para APIs
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Backend direto → localhost:3001
    location /backend/ {
        proxy_pass http://localhost:$BACKEND_PORT/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeout
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
EOF

# Testar configuração
echo -e "${BLUE}🧪 Testando configuração do Nginx...${NC}"
nginx -t

# Iniciar nginx
systemctl start nginx
systemctl enable nginx

echo -e "${BLUE}🔒 Obtendo certificado SSL...${NC}"

# Obter certificado
certbot --nginx --non-interactive --agree-tos --email $EMAIL -d $IP

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL configurado com sucesso!${NC}"
    echo ""
    echo -e "${GREEN}🌐 URLs HTTPS disponíveis:${NC}"
    echo -e "${GREEN}📱 Frontend:    https://$IP/ → localhost:$FRONTEND_PORT${NC}"
    echo -e "${GREEN}🔧 Backend API: https://$IP/api/ → localhost:$BACKEND_PORT/api/${NC}"
    echo -e "${GREEN}🔧 Backend:     https://$IP/backend/ → localhost:$BACKEND_PORT/${NC}"
    echo -e "${GREEN}📱 PWA agora funcionará perfeitamente!${NC}"
    
    echo ""
    echo -e "${BLUE}🧪 Testando conexões:${NC}"
    
    # Testar se frontend responde
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$FRONTEND_PORT | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ Frontend localhost:$FRONTEND_PORT está respondendo${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend localhost:$FRONTEND_PORT pode não estar respondendo${NC}"
    fi
    
    # Testar se backend responde  
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT | grep -q "200\|301\|302\|404"; then
        echo -e "${GREEN}✅ Backend localhost:$BACKEND_PORT está respondendo${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend localhost:$BACKEND_PORT pode não estar respondendo${NC}"
    fi
    
else
    echo -e "${RED}❌ Erro no SSL. Verifique se:${NC}"
    echo "  - O servidor está acessível na porta 80"
    echo "  - Não há firewall bloqueando"
    echo "  - O IP está correto"
    echo "  - As aplicações estão rodando nas portas corretas"
    echo ""
    echo -e "${BLUE}🔍 Para diagnosticar:${NC}"
    echo "  pm2 list"
    echo "  netstat -tlnp | grep -E '(3000|3001)'"
    echo "  systemctl status nginx"
fi

# Configurar renovação
systemctl enable certbot.timer
systemctl start certbot.timer

echo -e "${BLUE}🔄 Renovação automática configurada${NC}"

# Mostrar status final
echo ""
echo -e "${GREEN}📊 Status dos serviços:${NC}"
echo "PM2:"
pm2 list 2>/dev/null | head -10 || echo "PM2 não encontrado ou sem processos"

echo ""
echo "Portas em uso:"
netstat -tlnp | grep -E "(3000|3001|80|443)" | head -5

echo ""
echo -e "${GREEN}🔗 Comandos úteis:${NC}"
echo -e "${BLUE}  📊 Status Nginx: systemctl status nginx${NC}"
echo -e "${BLUE}  📊 Status PM2:   pm2 list${NC}"
echo -e "${BLUE}  📝 Logs Nginx:   tail -f /var/log/nginx/access.log${NC}"
echo -e "${BLUE}  🔒 Certificados: certbot certificates${NC}"
echo -e "${BLUE}  🔄 Renovar SSL:  certbot renew${NC}"
echo -e "${BLUE}  🧪 Testar:       curl -I https://$IP${NC}"
echo ""
echo -e "${GREEN}✅ Portal Sabercon SSL configurado!${NC}"
echo -e "${GREEN}🎯 Acesse: https://$IP${NC}" 