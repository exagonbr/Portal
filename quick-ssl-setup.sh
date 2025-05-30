#!/bin/bash

# Script rápido para SSL Let's Encrypt - Portal Sabercon
# Frontend: 54.232.72.62:3000 | Backend: 54.232.72.62:3001
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
echo -e "${BLUE}📱 Frontend: $IP:$FRONTEND_PORT${NC}"
echo -e "${BLUE}🔧 Backend:  $IP:$BACKEND_PORT${NC}"
echo -e "${BLUE}📧 Email: $EMAIL${NC}"
echo ""

# Verificar root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Execute como root: sudo bash quick-ssl-setup.sh${NC}"
    exit 1
fi

# Verificar se as aplicações estão rodando
echo -e "${BLUE}🔍 Verificando se as aplicações estão rodando...${NC}"
if ! netstat -tlnp | grep ":${FRONTEND_PORT} " > /dev/null; then
    echo -e "${YELLOW}⚠️  Frontend não encontrado na porta ${FRONTEND_PORT}${NC}"
fi
if ! netstat -tlnp | grep ":${BACKEND_PORT} " > /dev/null; then
    echo -e "${YELLOW}⚠️  Backend não encontrado na porta ${BACKEND_PORT}${NC}"
fi

# Atualizar e instalar
echo -e "${BLUE}📦 Instalando dependências...${NC}"
apt update -qq
apt install -y nginx certbot python3-certbot-nginx

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
    
    # Frontend (raiz do site)
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
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT/api;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Content-Type application/json;
    }
    
    # Backend direto (para testes)
    location /backend {
        rewrite ^/backend/(.*) /\$1 break;
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
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
    echo -e "${GREEN}🌐 URLs disponíveis:${NC}"
    echo -e "${GREEN}📱 Frontend:    https://$IP${NC}"
    echo -e "${GREEN}🔧 Backend API: https://$IP/api${NC}"
    echo -e "${GREEN}🔧 Backend:     https://$IP/backend${NC}"
    echo -e "${GREEN}📱 PWA agora funcionará!${NC}"
else
    echo -e "${RED}❌ Erro no SSL. Verifique se:${NC}"
    echo "  - O servidor está acessível na porta 80"
    echo "  - Não há firewall bloqueando"
    echo "  - O IP está correto"
    echo "  - As aplicações estão rodando nas portas corretas"
fi

# Configurar renovação
systemctl enable certbot.timer
systemctl start certbot.timer

echo -e "${BLUE}🔄 Renovação automática configurada${NC}"

# Mostrar status final
echo ""
echo -e "${GREEN}📊 Status dos serviços:${NC}"
systemctl status nginx --no-pager -l | head -3
echo ""
echo -e "${GREEN}🔗 Comandos úteis:${NC}"
echo -e "${BLUE}  📊 Status Nginx: systemctl status nginx${NC}"
echo -e "${BLUE}  📝 Logs Nginx:   tail -f /var/log/nginx/access.log${NC}"
echo -e "${BLUE}  🔒 Certificados: certbot certificates${NC}"
echo -e "${BLUE}  🔄 Renovar SSL:  certbot renew${NC}"
echo ""
echo -e "${GREEN}✅ Configuração concluída!${NC}" 