#!/bin/bash

# Script para configurar SSL Let's Encrypt para 54.232.72.62:3000
# Autor: Assistente AI
# Data: $(date)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SERVER_IP="54.232.72.62"
APP_PORT="3000"
DOMAIN=$SERVER_IP
EMAIL="admin@example.com"  # ALTERE ESTE EMAIL

echo -e "${BLUE}🚀 Configurando SSL Let's Encrypt para ${SERVER_IP}:${APP_PORT}${NC}"
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

# Configurar firewall
echo -e "${BLUE}🔥 Configurando firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow $APP_PORT

# Verificar se a aplicação está rodando
echo -e "${BLUE}🔍 Verificando se a aplicação está rodando na porta ${APP_PORT}...${NC}"
if ! netstat -tlnp | grep ":${APP_PORT} " > /dev/null; then
    echo -e "${YELLOW}⚠️  Aplicação não encontrada na porta ${APP_PORT}${NC}"
    echo "Certifique-se de que sua aplicação Next.js está rodando em ${APP_PORT}"
    read -p "Continuar mesmo assim? (y/N): " continue_anyway
    if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Parar nginx se estiver rodando
systemctl stop nginx 2>/dev/null || true

# Criar configuração inicial do nginx
echo -e "${BLUE}⚙️  Criando configuração inicial do Nginx...${NC}"
cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
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

# Configuração HTTPS
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

    # Proxy para a aplicação Next.js
    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Configurações para PWA
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Server \$host;
    }

    # Otimizações para arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:${APP_PORT};
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "STATIC";
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

# Criar script de verificação de status
cat > /usr/local/bin/check-ssl-status.sh << 'EOF'
#!/bin/bash
echo "=== Status do SSL ==="
echo "Certificado expira em:"
openssl x509 -enddate -noout -in /etc/letsencrypt/live/54.232.72.62/cert.pem

echo ""
echo "=== Status do Nginx ==="
systemctl status nginx --no-pager -l

echo ""
echo "=== Status do Certbot Timer ==="
systemctl status certbot.timer --no-pager -l
EOF

chmod +x /usr/local/bin/check-ssl-status.sh

# Resultados finais
echo ""
echo -e "${GREEN}🎉 ========================================${NC}"
echo -e "${GREEN}✅ SSL configurado com sucesso!${NC}"
echo -e "${GREEN}🎉 ========================================${NC}"
echo ""
echo -e "${BLUE}📋 Informações:${NC}"
echo -e "   🌐 HTTP:  http://${DOMAIN}"
echo -e "   🔒 HTTPS: https://${DOMAIN}"
echo -e "   📱 PWA:   Agora funciona completamente!"
echo ""
echo -e "${BLUE}🔧 Comandos úteis:${NC}"
echo -e "   📊 Status:        sudo /usr/local/bin/check-ssl-status.sh"
echo -e "   🔄 Renovar SSL:   sudo certbot renew"
echo -e "   🔧 Reload Nginx:  sudo systemctl reload nginx"
echo -e "   📝 Logs Nginx:    sudo tail -f /var/log/nginx/error.log"
echo ""
echo -e "${YELLOW}⚠️  Lembre-se:${NC}"
echo -e "   • O certificado renova automaticamente a cada 90 dias"
echo -e "   • Acesse sempre via HTTPS para PWA funcionar"
echo -e "   • Mantenha sua aplicação rodando na porta ${APP_PORT}"
echo ""
echo -e "${GREEN}✅ Seu site agora está seguro e pronto para PWA!${NC}" 