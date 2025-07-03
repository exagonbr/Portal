#!/bin/bash

# Script completo de SSL Let's Encrypt - Portal Sabercon
# Frontend: localhost:3000 via HTTPS | Backend: localhost:3001 via HTTPS
# Execute como root: sudo bash setup-ssl.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Configurações
IP="54.232.72.62"
FRONTEND_PORT="3000"
BACKEND_PORT="3001"
EMAIL="admin@sabercon.com.br"  # ALTERE ESTE EMAIL

# Função para log
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌ $1${NC}"
}

# Header
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}🔒 PORTAL SABERCON - CONFIGURAÇÃO SSL COMPLETA${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}📱 Frontend:    https://$IP/ → localhost:$FRONTEND_PORT${NC}"
echo -e "${CYAN}🔧 Backend API: https://$IP/api/ → localhost:$BACKEND_PORT/api/${NC}"
echo -e "${CYAN}🔧 Backend:     https://$IP/backend/ → localhost:$BACKEND_PORT/${NC}"
echo -e "${CYAN}📧 Contato SSL: $EMAIL${NC}"
echo ""

# Verificar root
if [ "$EUID" -ne 0 ]; then
    log_error "Execute como root: sudo bash setup-ssl.sh"
    exit 1
fi

# Verificar conectividade
log "🌐 Verificando conectividade e DNS..."
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    log_success "Conectividade OK"
else
    log_error "Sem conectividade com a internet"
    exit 1
fi

# Verificar se as aplicações estão rodando
log "🔍 Verificando serviços Portal Sabercon..."
FRONTEND_RUNNING=false
BACKEND_RUNNING=false

if netstat -tlnp 2>/dev/null | grep -E "(127.0.0.1:${FRONTEND_PORT}|localhost:${FRONTEND_PORT}|:${FRONTEND_PORT})" > /dev/null; then
    log_success "Frontend encontrado na porta $FRONTEND_PORT"
    FRONTEND_RUNNING=true
else
    log_warning "Frontend não encontrado na porta $FRONTEND_PORT"
fi

if netstat -tlnp 2>/dev/null | grep -E "(127.0.0.1:${BACKEND_PORT}|localhost:${BACKEND_PORT}|:${BACKEND_PORT})" > /dev/null; then
    log_success "Backend encontrado na porta $BACKEND_PORT"
    BACKEND_RUNNING=true
else
    log_warning "Backend não encontrado na porta $BACKEND_PORT"
fi

if [ "$FRONTEND_RUNNING" = false ] || [ "$BACKEND_RUNNING" = false ]; then
    echo ""
    log_warning "Algumas aplicações não estão rodando. Verifique:"
    echo "  🔍 pm2 list"
    echo "  🔍 netstat -tlnp | grep -E '(3000|3001)'"
    echo ""
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Configuração cancelada"
        exit 1
    fi
fi

# Backup de configurações antigas
log "💾 Fazendo backup das configurações..."
BACKUP_DIR="/root/ssl-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

if [ -f "/etc/nginx/sites-available/default" ]; then
    cp /etc/nginx/sites-available/default $BACKUP_DIR/nginx-default.bak
    log_success "Backup Nginx criado em $BACKUP_DIR"
fi

# Atualizar sistema
log "📦 Atualizando sistema e instalando dependências..."
apt update -qq
apt install -y nginx certbot python3-certbot-nginx curl wget net-tools ufw software-properties-common

# Configurar firewall
log "🔥 Configurando firewall UFW..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow $FRONTEND_PORT
ufw allow $BACKEND_PORT
ufw --force enable
log_success "Firewall configurado"

# Parar serviços
log "⏹️  Parando serviços..."
systemctl stop nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true

# Configuração avançada do Nginx
log "⚙️ Configurando Nginx com otimizações..."

# Backup da configuração principal
cp /etc/nginx/nginx.conf $BACKUP_DIR/nginx.conf.bak 2>/dev/null || true

# Configuração principal otimizada
cat > /etc/nginx/nginx.conf << 'EOL'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # MIME Types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=1r/s;
    
    # Include sites
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOL

# Site específico para Portal Sabercon
cat > /etc/nginx/sites-available/default << EOF
# Portal Sabercon - Configuração SSL Completa
# Frontend: localhost:$FRONTEND_PORT | Backend: localhost:$BACKEND_PORT

server {
    listen 80;
    server_name $IP;
    
    # Redirecionamento para HTTPS será adicionado pelo Certbot
    
    # Frontend (raiz do site) → localhost:$FRONTEND_PORT
    location / {
        # Rate limiting suave para frontend
        limit_req zone=general burst=5 nodelay;
        
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Headers para PWA e WebSocket
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Timeout otimizado
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Headers de segurança
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://localhost:$FRONTEND_PORT;
            proxy_set_header Host \$host;
            expires 7d;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API → localhost:$BACKEND_PORT/api/
    location /api/ {
        # Rate limiting para API
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:$BACKEND_PORT/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Headers específicos para API
        proxy_set_header Content-Type application/json;
        proxy_set_header Accept application/json;
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials true always;
        
        # Preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
        
        # Timeout para APIs (maior)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # Backend direto → localhost:$BACKEND_PORT/
    location /backend/ {
        proxy_pass http://localhost:$BACKEND_PORT/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeout padrão
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Health check
    location /_health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
EOF

# Testar configuração
log "🧪 Testando configuração do Nginx..."
if nginx -t; then
    log_success "Configuração Nginx válida"
else
    log_error "Erro na configuração Nginx"
    exit 1
fi

# Iniciar Nginx
log "🚀 Iniciando Nginx..."
systemctl start nginx
systemctl enable nginx
log_success "Nginx iniciado"

# Verificar se está rodando
if systemctl is-active --quiet nginx; then
    log_success "Nginx ativo"
else
    log_error "Nginx não está ativo"
    exit 1
fi

# Obter certificado SSL
log "🔒 Obtendo certificado SSL Let's Encrypt..."
echo "Este processo pode demorar alguns minutos..."

if certbot --nginx --non-interactive --agree-tos --email $EMAIL -d $IP --redirect; then
    log_success "Certificado SSL obtido com sucesso!"
    
    # Verificar certificado
    if certbot certificates | grep -q $IP; then
        log_success "Certificado verificado"
    else
        log_warning "Certificado pode não estar configurado corretamente"
    fi
    
else
    log_error "Falha ao obter certificado SSL"
    echo ""
    echo "Possíveis causas:"
    echo "  • O servidor não está acessível na porta 80"
    echo "  • Firewall está bloqueando"
    echo "  • DNS não está resolvendo para este IP"
    echo "  • Rate limit do Let's Encrypt atingido"
    echo ""
    echo "Para diagnosticar:"
    echo "  curl -I http://$IP"
    echo "  systemctl status nginx"
    echo "  tail -f /var/log/nginx/error.log"
    exit 1
fi

# Configurar renovação automática
log "🔄 Configurando renovação automática..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Teste de renovação
if certbot renew --dry-run > /dev/null 2>&1; then
    log_success "Teste de renovação passou"
else
    log_warning "Teste de renovação falhou"
fi

# Verificações finais
log "🧪 Realizando verificações finais..."

# Testar HTTPS
sleep 3
if curl -s -I https://$IP | head -1 | grep -q "200"; then
    log_success "HTTPS respondendo corretamente"
else
    log_warning "HTTPS pode não estar respondendo"
fi

# Testar se frontend está acessível via HTTPS
if curl -s -o /dev/null -w "%{http_code}" https://$IP | grep -q "200\|301\|302"; then
    log_success "Frontend acessível via HTTPS"
else
    log_warning "Frontend pode não estar acessível via HTTPS"
fi

# Testar se backend está acessível
if curl -s -o /dev/null -w "%{http_code}" https://$IP/backend/ | grep -q "200\|301\|302\|404"; then
    log_success "Backend acessível via HTTPS"
else
    log_warning "Backend pode não estar acessível via HTTPS"
fi

# Otimizações finais do sistema
log "⚡ Aplicando otimizações finais..."

# Configurar logrotate para nginx
cat > /etc/logrotate.d/nginx << 'EOL'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data adm
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOL

# Script de monitoramento
cat > /usr/local/bin/portal-ssl-check.sh << 'EOF'
#!/bin/bash
# Script de monitoramento Portal Sabercon
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"; }

# Verificar serviços
if ! systemctl is-active --quiet nginx; then
    log "ERRO: Nginx não está rodando"
    systemctl restart nginx
fi

# Verificar certificado
DAYS_LEFT=$(certbot certificates 2>/dev/null | grep "VALID" | grep -o '[0-9]* days' | head -1 | grep -o '[0-9]*')
if [ "$DAYS_LEFT" -lt 30 ] 2>/dev/null; then
    log "AVISO: Certificado expira em $DAYS_LEFT dias"
fi

# Verificar portas
if ! netstat -tlnp | grep -q ":3000 "; then
    log "AVISO: Frontend (3000) não está respondendo"
fi

if ! netstat -tlnp | grep -q ":3001 "; then
    log "AVISO: Backend (3001) não está respondendo"
fi

log "Verificação concluída"
EOF

chmod +x /usr/local/bin/portal-ssl-check.sh

# Crontab para monitoramento
(crontab -l 2>/dev/null; echo "0 */6 * * * /usr/local/bin/portal-ssl-check.sh >> /var/log/portal-ssl-check.log 2>&1") | crontab -

log_success "Monitoramento configurado"

# Resultados finais
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}🎉 CONFIGURAÇÃO SSL CONCLUÍDA COM SUCESSO!${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🌐 URLs HTTPS configuradas:${NC}"
echo -e "${GREEN}📱 Frontend:    https://$IP/ → localhost:$FRONTEND_PORT${NC}"
echo -e "${GREEN}🔧 Backend API: https://$IP/api/ → localhost:$BACKEND_PORT/api/${NC}"
echo -e "${GREEN}🔧 Backend:     https://$IP/backend/ → localhost:$BACKEND_PORT/${NC}"
echo -e "${GREEN}📱 PWA agora funcionará perfeitamente com HTTPS!${NC}"
echo ""

# Status dos serviços
echo -e "${CYAN}📊 Status dos serviços:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Nginx:"
systemctl status nginx --no-pager -l | head -3

echo ""
echo "PM2 (Portal Sabercon):"
pm2 list 2>/dev/null | head -10 || echo "PM2 não encontrado ou sem processos"

echo ""
echo "Certificados SSL:"
certbot certificates | grep -A 5 -B 1 $IP || echo "Certificado não encontrado"

echo ""
echo "Portas em uso:"
netstat -tlnp | grep -E "(3000|3001|80|443)" | head -5

echo ""
echo -e "${CYAN}🔗 Comandos úteis:${NC}"
echo -e "${BLUE}  📊 Status Nginx:     systemctl status nginx${NC}"
echo -e "${BLUE}  📊 Status PM2:       pm2 list${NC}"
echo -e "${BLUE}  📝 Logs Nginx:       tail -f /var/log/nginx/access.log${NC}"
echo -e "${BLUE}  📝 Logs SSL:         tail -f /var/log/letsencrypt/letsencrypt.log${NC}"
echo -e "${BLUE}  🔒 Verificar SSL:    certbot certificates${NC}"
echo -e "${BLUE}  🔄 Renovar SSL:      certbot renew${NC}"
echo -e "${BLUE}  🧪 Testar HTTPS:     curl -I https://$IP${NC}"
echo -e "${BLUE}  🔍 Monitoramento:    /usr/local/bin/portal-ssl-check.sh${NC}"
echo -e "${BLUE}  🗂️  Backup em:        $BACKUP_DIR${NC}"
echo ""
echo -e "${GREEN}✅ Portal Sabercon SSL configurado e otimizado!${NC}"
echo -e "${GREEN}🎯 Acesse: https://$IP${NC}"
echo -e "${GREEN}🔒 Certificado válido por 90 dias (renovação automática)${NC}"
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" 