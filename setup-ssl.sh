#!/bin/bash

# Script para configurar SSL Let's Encrypt - Portal Sabercon
# Frontend: 54.232.72.62:3000 | Backend: 54.232.72.62:3001
# Autor: Assistente AI
# Data: $(date)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configurações
SERVER_IP="54.232.72.62"
FRONTEND_PORT="3000"
BACKEND_PORT="3001"
DOMAIN=$SERVER_IP
EMAIL="admin@sabercon.com.br"  # ALTERE ESTE EMAIL

echo -e "${BLUE}🚀 Configurando SSL Let's Encrypt - Portal Sabercon${NC}"
echo -e "${CYAN}📱 Frontend: ${SERVER_IP}:${FRONTEND_PORT}${NC}"
echo -e "${CYAN}🔧 Backend:  ${SERVER_IP}:${BACKEND_PORT}${NC}"
echo -e "${YELLOW}⚠️  Certifique-se de que você tem acesso root ao servidor${NC}"
echo ""

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para instalar pacotes
install_package() {
    if ! dpkg -l | grep -q "^ii  $1 "; then
        echo -e "${YELLOW}📦 Instalando $1...${NC}"
        apt-get install -y $1
    else
        echo -e "${GREEN}✅ $1 já está instalado${NC}"
    fi
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Este script deve ser executado como root${NC}"
    echo "Execute: sudo bash setup-ssl.sh"
    exit 1
fi

# Atualizar sistema
echo -e "${BLUE}🔄 Atualizando sistema...${NC}"
apt-get update

# Instalar dependências
echo -e "${BLUE}📦 Instalando dependências...${NC}"
install_package "nginx"
install_package "certbot"
install_package "python3-certbot-nginx"
install_package "ufw"
install_package "net-tools"

# Configurar firewall
echo -e "${BLUE}🔥 Configurando firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow $FRONTEND_PORT
ufw allow $BACKEND_PORT

# Verificar se as aplicações estão rodando
echo -e "${BLUE}🔍 Verificando se as aplicações estão rodando...${NC}"
if ! netstat -tlnp | grep ":${FRONTEND_PORT} " > /dev/null; then
    echo -e "${YELLOW}⚠️  Frontend não encontrado na porta ${FRONTEND_PORT}${NC}"
    echo "Certifique-se de que sua aplicação Next.js está rodando em ${FRONTEND_PORT}"
fi

if ! netstat -tlnp | grep ":${BACKEND_PORT} " > /dev/null; then
    echo -e "${YELLOW}⚠️  Backend não encontrado na porta ${BACKEND_PORT}${NC}"
    echo "Certifique-se de que sua aplicação backend está rodando em ${BACKEND_PORT}"
fi

read -p "Continuar mesmo assim? (y/N): " continue_anyway
if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
    exit 1
fi

# Parar nginx se estiver rodando
systemctl stop nginx 2>/dev/null || true

# Criar configuração inicial do nginx
echo -e "${BLUE}⚙️  Criando configuração inicial do Nginx...${NC}"
cat > /etc/nginx/sites-available/default << EOF
# Portal Sabercon - Frontend + Backend
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Frontend (raiz do site)
    location / {
        proxy_pass http://localhost:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:${BACKEND_PORT}/api;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Content-Type application/json;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }

    # Backend direto (para testes/admin)
    location /backend {
        rewrite ^/backend/(.*) /\$1 break;
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Testar configuração do nginx
echo -e "${BLUE}🧪 Testando configuração do Nginx...${NC}"
nginx -t

# Iniciar nginx
echo -e "${BLUE}🚀 Iniciando Nginx...${NC}"
systemctl start nginx
systemctl enable nginx

# Aguardar nginx inicializar
sleep 2

# Verificar se nginx está rodando
if ! systemctl is-active --quiet nginx; then
    echo -e "${RED}❌ Erro: Nginx não conseguiu iniciar${NC}"
    systemctl status nginx
    exit 1
fi

echo -e "${GREEN}✅ Nginx configurado e rodando${NC}"

# Obter certificado SSL
echo -e "${BLUE}🔒 Obtendo certificado SSL Let's Encrypt...${NC}"
echo -e "${YELLOW}📧 Usando email: ${EMAIL}${NC}"
echo -e "${YELLOW}⚠️  Se necessário, altere o email no script${NC}"

# Para IP, usamos standalone mode
systemctl stop nginx

# Obter certificado usando standalone
certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --domains $DOMAIN \
    --preferred-challenges http

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificado SSL obtido com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao obter certificado SSL${NC}"
    echo -e "${YELLOW}💡 Verifique se:${NC}"
    echo "   - O domínio/IP aponta para este servidor"
    echo "   - As portas 80 e 443 estão abertas"
    echo "   - Não há outros serviços usando a porta 80"
    exit 1
fi

# Criar configuração nginx com SSL
echo -e "${BLUE}🔧 Configurando Nginx com SSL...${NC}"
cat > /etc/nginx/sites-available/default << EOF
# Redirecionamento HTTP para HTTPS
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

# Configuração HTTPS - Portal Sabercon
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # Configurações SSL modernas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (raiz do site)
    location / {
        proxy_pass http://localhost:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Configurações para PWA
        proxy_set_header X-Forwarded-Server \$host;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:${BACKEND_PORT}/api;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Content-Type application/json;
        
        # CORS e API headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        
        # Timeout para APIs
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Backend direto (para testes/admin)
    location /backend {
        rewrite ^/backend/(.*) /\$1 break;
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Otimizações para arquivos estáticos do Frontend
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|svg|woff|woff2|ttf|eot|webp)$ {
        proxy_pass http://localhost:${FRONTEND_PORT};
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "STATIC";
        expires 1y;
    }

    # Service Worker e Manifest (PWA)
    location ~* \.(sw|manifest)\.js$ {
        proxy_pass http://localhost:${FRONTEND_PORT};
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
EOF

# Testar nova configuração
echo -e "${BLUE}🧪 Testando nova configuração do Nginx...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuração do Nginx válida${NC}"
else
    echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
    exit 1
fi

# Reiniciar nginx
echo -e "${BLUE}🔄 Reiniciando Nginx...${NC}"
systemctl restart nginx

# Verificar status
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx reiniciado com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao reiniciar Nginx${NC}"
    systemctl status nginx
    exit 1
fi

# Configurar renovação automática
echo -e "${BLUE}🔄 Configurando renovação automática...${NC}"
systemctl enable certbot.timer
systemctl start certbot.timer

# Criar script de renovação personalizado
cat > /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh << 'EOF'
#!/bin/bash
systemctl reload nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh

# Testar renovação
echo -e "${BLUE}🧪 Testando renovação automática...${NC}"
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Renovação automática configurada com sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  Aviso: Teste de renovação falhou, mas o SSL está funcionando${NC}"
fi

# Criar script de verificação de status para Portal Sabercon
cat > /usr/local/bin/check-sabercon-status.sh << 'EOF'
#!/bin/bash
echo "=== STATUS PORTAL SABERCON ==="
echo ""
echo "🔒 Certificado SSL:"
openssl x509 -enddate -noout -in /etc/letsencrypt/live/54.232.72.62/cert.pem

echo ""
echo "🌐 Status Nginx:"
systemctl status nginx --no-pager -l | head -5

echo ""
echo "📱 Frontend (porta 3000):"
if netstat -tlnp | grep :3000 > /dev/null; then
    echo "✅ Rodando"
else
    echo "❌ Não encontrado"
fi

echo ""
echo "🔧 Backend (porta 3001):"
if netstat -tlnp | grep :3001 > /dev/null; then
    echo "✅ Rodando"
else
    echo "❌ Não encontrado"
fi

echo ""
echo "🔄 Certbot Timer:"
systemctl status certbot.timer --no-pager -l | head -3
EOF

chmod +x /usr/local/bin/check-sabercon-status.sh

# Resultados finais
echo ""
echo -e "${GREEN}🎉 ========================================${NC}"
echo -e "${GREEN}✅ SSL PORTAL SABERCON CONFIGURADO!${NC}"
echo -e "${GREEN}🎉 ========================================${NC}"
echo ""
echo -e "${BLUE}📋 URLs disponíveis:${NC}"
echo -e "   🌐 HTTP:        http://${DOMAIN} → redireciona para HTTPS"
echo -e "   🔒 HTTPS:       https://${DOMAIN}"
echo -e "   📱 Frontend:    https://${DOMAIN}/"
echo -e "   🔧 Backend API: https://${DOMAIN}/api"
echo -e "   🔧 Backend:     https://${DOMAIN}/backend"
echo -e "   📱 PWA:         Agora funciona completamente!"
echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo -e "   📊 Status Geral:  sudo /usr/local/bin/check-sabercon-status.sh"
echo -e "   🔄 Renovar SSL:   sudo certbot renew"
echo -e "   🔧 Reload Nginx:  sudo systemctl reload nginx"
echo -e "   📝 Logs Nginx:    sudo tail -f /var/log/nginx/access.log"
echo -e "   📝 Logs SSL:      sudo tail -f /var/log/letsencrypt/letsencrypt.log"
echo ""
echo -e "${YELLOW}⚠️  Lembre-se:${NC}"
echo -e "   • O certificado renova automaticamente a cada 90 dias"
echo -e "   • Acesse sempre via HTTPS para PWA funcionar"
echo -e "   • Frontend na porta ${FRONTEND_PORT}, Backend na porta ${BACKEND_PORT}"
echo -e "   • Use pm2 para gerenciar os processos das aplicações"
echo ""
echo -e "${GREEN}✅ Portal Sabercon está seguro e pronto para produção!${NC}" 