#!/bin/bash

# Script de Configuração Produção AWS - Portal Sabercon
# Para usar com certificados SSL existentes da AWS
# Domínio: https://portal.sabercon.com.br
# Frontend: porta 3000 | Backend: porta 3001
# Execute como root: sudo bash setup-production-aws-existing-ssl.sh

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

# Configurações de Produção
DOMAIN="portal.sabercon.com.br"
FRONTEND_PORT="3000"
BACKEND_PORT="3001"
NODE_ENV="production"

# Caminhos dos certificados SSL (ajuste conforme necessário)
SSL_CERT_PATH="/etc/ssl/certs/portal.sabercon.com.br.crt"
SSL_KEY_PATH="/etc/ssl/private/portal.sabercon.com.br.key"
SSL_CHAIN_PATH="/etc/ssl/certs/portal.sabercon.com.br-chain.crt"

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

print_header() {
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}🚀 $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Header principal
clear
print_header "PORTAL SABERCON - CONFIGURAÇÃO PRODUÇÃO AWS (SSL EXISTENTE)"
echo ""
echo -e "${CYAN}🌐 Domínio:     https://$DOMAIN${NC}"
echo -e "${CYAN}📱 Frontend:    https://$DOMAIN/ → localhost:$FRONTEND_PORT${NC}"
echo -e "${CYAN}🔧 Backend API: https://$DOMAIN/api/ → localhost:$BACKEND_PORT/api/${NC}"
echo -e "${CYAN}🔧 Backend:     https://$DOMAIN/backend/ → localhost:$BACKEND_PORT/${NC}"
echo -e "${CYAN}🏗️  Ambiente:    $NODE_ENV${NC}"
echo -e "${CYAN}🔒 SSL:         Certificados AWS existentes${NC}"
echo ""

# Verificar root
if [ "$EUID" -ne 0 ]; then
    log_error "Execute como root: sudo bash setup-production-aws-existing-ssl.sh"
    exit 1
fi

# Verificar se os certificados existem
log "🔍 Verificando certificados SSL..."
if [ ! -f "$SSL_CERT_PATH" ]; then
    log_warning "Certificado não encontrado em: $SSL_CERT_PATH"
    echo ""
    echo "Por favor, coloque seus certificados AWS nos seguintes locais:"
    echo "  📄 Certificado: $SSL_CERT_PATH"
    echo "  🔑 Chave privada: $SSL_KEY_PATH"
    echo "  🔗 Chain (opcional): $SSL_CHAIN_PATH"
    echo ""
    echo "Ou informe os caminhos corretos editando este script."
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Configuração cancelada"
        exit 1
    fi
else
    log_success "Certificado encontrado: $SSL_CERT_PATH"
fi

if [ ! -f "$SSL_KEY_PATH" ]; then
    log_warning "Chave privada não encontrada em: $SSL_KEY_PATH"
else
    log_success "Chave privada encontrada: $SSL_KEY_PATH"
fi

# Verificar conectividade
log "🌐 Verificando conectividade..."
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
    log_warning "Algumas aplicações não estão rodando. Comandos para verificar:"
    echo "  🔍 pm2 list"
    echo "  🔍 netstat -tlnp | grep -E '(3000|3001)'"
    echo "  🔍 pm2 logs PortalServerFrontend"
    echo "  🔍 pm2 logs PortalServerBackend"
    echo ""
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Configuração cancelada"
        exit 1
    fi
fi

# Backup de configurações
log "💾 Criando backup das configurações..."
BACKUP_DIR="/root/aws-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

if [ -f "/etc/nginx/sites-available/default" ]; then
    cp /etc/nginx/sites-available/default $BACKUP_DIR/nginx-default.bak
fi
if [ -f "/etc/nginx/nginx.conf" ]; then
    cp /etc/nginx/nginx.conf $BACKUP_DIR/nginx.conf.bak
fi
log_success "Backup criado em $BACKUP_DIR"

# Atualizar sistema
log "📦 Atualizando sistema e instalando dependências..."
apt update -qq
apt install -y nginx curl wget net-tools ufw software-properties-common htop

# Configurar firewall para produção
log "🔥 Configurando firewall UFW para produção..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Portas essenciais
ufw allow ssh
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Portas da aplicação (apenas localhost)
ufw allow from 127.0.0.1 to any port $FRONTEND_PORT
ufw allow from 127.0.0.1 to any port $BACKEND_PORT

# Regras específicas para AWS
ufw allow from 10.0.0.0/8 to any port $FRONTEND_PORT
ufw allow from 10.0.0.0/8 to any port $BACKEND_PORT
ufw allow from 172.16.0.0/12 to any port $FRONTEND_PORT
ufw allow from 172.16.0.0/12 to any port $BACKEND_PORT

ufw --force enable
log_success "Firewall configurado para produção"

# Parar serviços
log "⏹️  Parando serviços..."
systemctl stop nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true

# Criar diretórios SSL se não existirem
mkdir -p /etc/ssl/certs
mkdir -p /etc/ssl/private
chmod 700 /etc/ssl/private

# Configuração otimizada do Nginx para produção
log "⚙️ Configurando Nginx para produção com SSL existente..."

# Configuração principal otimizada para produção
cat > /etc/nginx/nginx.conf << 'EOL'
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
    accept_mutex off;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 1000;
    types_hash_max_size 2048;
    server_tokens off;
    client_max_body_size 100M;
    
    # MIME Types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';
    
    access_log /var/log/nginx/access.log main buffer=16k flush=2m;
    error_log /var/log/nginx/error.log warn;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        text/csv
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        application/x-javascript
        application/x-font-ttf
        font/opentype
        image/svg+xml
        image/x-icon;
    
    # Rate Limiting para produção
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Connection limiting
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
    limit_conn_zone $server_name zone=conn_limit_per_server:10m;
    
    # Cache settings
    proxy_cache_path /var/cache/nginx/portal levels=1:2 keys_zone=portal_cache:10m max_size=1g inactive=60m use_temp_path=off;
    
    # Upstream definitions
    upstream frontend_backend {
        server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }
    
    upstream api_backend {
        server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }
    
    # Include sites
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOL

# Configuração do site para produção com SSL existente
cat > /etc/nginx/sites-available/default << EOF
# Portal Sabercon - Configuração Produção AWS com SSL Existente
# Domínio: $DOMAIN
# Frontend: localhost:$FRONTEND_PORT | Backend: localhost:$BACKEND_PORT

# Redirecionamento HTTP para HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirecionar todo tráfego para HTTPS
    return 301 https://\$server_name\$request_uri;
}

# Configuração HTTPS principal
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # Configurações SSL com certificados existentes
    ssl_certificate $SSL_CERT_PATH;
    ssl_certificate_key $SSL_KEY_PATH;
EOF

# Adicionar chain se existir
if [ -f "$SSL_CHAIN_PATH" ]; then
    echo "    ssl_trusted_certificate $SSL_CHAIN_PATH;" >> /etc/nginx/sites-available/default
fi

cat >> /etc/nginx/sites-available/default << 'EOF'
    
    # Configurações SSL otimizadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com wss:; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';" always;
    
    # Rate limiting
    limit_conn conn_limit_per_ip 20;
    limit_conn conn_limit_per_server 1000;
    
    # Frontend (raiz do site) → localhost:3000
    location / {
        # Rate limiting suave para frontend
        limit_req zone=general burst=10 nodelay;
        
        proxy_pass http://frontend_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts otimizados
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        
        # Cache para assets estáticos do Next.js
        location ~* ^/_next/static/ {
            proxy_pass http://frontend_backend;
            proxy_cache portal_cache;
            proxy_cache_valid 200 1y;
            proxy_cache_valid 404 1m;
            add_header Cache-Control "public, immutable";
            add_header X-Cache-Status $upstream_cache_status;
            expires 1y;
        }
        
        # Cache para outros assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
            proxy_pass http://frontend_backend;
            proxy_cache portal_cache;
            proxy_cache_valid 200 7d;
            proxy_cache_valid 404 1m;
            add_header Cache-Control "public, max-age=604800";
            add_header X-Cache-Status $upstream_cache_status;
            expires 7d;
        }
    }
    
    # Backend API → localhost:3001/api/
    location /api/ {
        # Rate limiting mais rigoroso para API
        limit_req zone=api burst=50 nodelay;
        
        proxy_pass http://api_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Headers específicos para API
        proxy_set_header Content-Type $content_type;
        proxy_set_header Accept application/json;
        
        # CORS headers para produção
        add_header Access-Control-Allow-Origin "https://portal.sabercon.com.br" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-CSRF-Token" always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Max-Age 86400 always;
        
        # Preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://portal.sabercon.com.br" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-CSRF-Token" always;
            add_header Access-Control-Max-Age 86400 always;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
        
        # Timeouts para APIs (maiores)
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
        
        # Buffer settings para API
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_max_temp_file_size 0;
    }
    
    # Rate limiting especial para login
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        
        proxy_pass http://api_backend/api/auth/login;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts para login
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Backend direto → localhost:3001/
    location /backend/ {
        proxy_pass http://api_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout padrão
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /_health {
        access_log off;
        return 200 "OK - Portal Sabercon Production";
        add_header Content-Type text/plain;
    }
    
    # Nginx status (apenas localhost)
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
    
    # Bloquear acesso a arquivos sensíveis
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(env|log|conf)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Criar diretório de cache
mkdir -p /var/cache/nginx/portal
chown -R www-data:www-data /var/cache/nginx/portal

# Testar configuração
log "🧪 Testando configuração do Nginx..."
if nginx -t; then
    log_success "Configuração Nginx válida"
else
    log_error "Erro na configuração Nginx"
    cat /var/log/nginx/error.log | tail -10
    exit 1
fi

# Iniciar Nginx
log "🚀 Iniciando Nginx..."
systemctl start nginx
systemctl enable nginx

# Verificar se está rodando
if systemctl is-active --quiet nginx; then
    log_success "Nginx ativo"
else
    log_error "Nginx não está ativo"
    systemctl status nginx
    exit 1
fi

# Otimizações do sistema para produção
log "⚡ Aplicando otimizações do sistema..."

# Configurações de rede
cat >> /etc/sysctl.conf << 'EOL'

# Portal Sabercon - Otimizações de rede
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 10
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_tw_reuse = 1
EOL

sysctl -p

# Configurar logrotate para logs do Nginx
cat > /etc/logrotate.d/nginx-portal << 'EOL'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi \
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1
    endscript
}
EOL

# Verificações finais
log "🧪 Realizando verificações finais..."

# Aguardar um pouco para o SSL se estabilizar
sleep 5

# Testar HTTPS
if curl -s -I https://$DOMAIN | head -1 | grep -q "200\|301\|302"; then
    log_success "HTTPS respondendo corretamente"
else
    log_warning "HTTPS pode não estar respondendo - verificar logs"
fi

# Testar se frontend está acessível via HTTPS
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|301\|302"; then
    log_success "Frontend acessível via HTTPS"
else
    log_warning "Frontend pode não estar acessível via HTTPS"
fi

# Testar se backend API está acessível
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/health 2>/dev/null | grep -q "200\|404"; then
    log_success "Backend API acessível via HTTPS"
else
    log_warning "Backend API pode não estar acessível"
fi

# Criar script de monitoramento
cat > /root/monitor-portal.sh << 'EOL'
#!/bin/bash
# Script de monitoramento Portal Sabercon

echo "=== Portal Sabercon - Status $(date) ==="
echo ""

echo "🔍 Processos PM2:"
pm2 list

echo ""
echo "🌐 Portas em uso:"
netstat -tlnp | grep -E "(3000|3001|80|443)"

echo ""
echo "📊 Status Nginx:"
systemctl status nginx --no-pager -l

echo ""
echo "🔒 Certificados SSL:"
openssl x509 -in /etc/ssl/certs/portal.sabercon.com.br.crt -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"

echo ""
echo "💾 Uso de disco:"
df -h

echo ""
echo "🧠 Uso de memória:"
free -h

echo ""
echo "⚡ Load average:"
uptime
EOL

chmod +x /root/monitor-portal.sh

# Resultados finais
print_header "CONFIGURAÇÃO PRODUÇÃO CONCLUÍDA COM SUCESSO"
echo ""
log_success "🎉 Portal Sabercon configurado para produção na AWS com SSL existente!"
echo ""
echo -e "${GREEN}🌐 URLs HTTPS disponíveis:${NC}"
echo -e "${GREEN}📱 Frontend:    https://$DOMAIN/ → localhost:$FRONTEND_PORT${NC}"
echo -e "${GREEN}🔧 Backend API: https://$DOMAIN/api/ → localhost:$BACKEND_PORT/api/${NC}"
echo -e "${GREEN}🔧 Backend:     https://$DOMAIN/backend/ → localhost:$BACKEND_PORT/${NC}"
echo -e "${GREEN}🏥 Health:      https://$DOMAIN/_health${NC}"
echo ""
echo -e "${CYAN}📋 Comandos úteis:${NC}"
echo -e "${CYAN}📊 Status:      /root/monitor-portal.sh${NC}"
echo -e "${CYAN}📝 Logs Nginx:  tail -f /var/log/nginx/access.log${NC}"
echo -e "${CYAN}📝 Logs Error:  tail -f /var/log/nginx/error.log${NC}"
echo -e "${CYAN}🔄 Restart:     systemctl restart nginx${NC}"
echo -e "${CYAN}🔒 SSL Info:    openssl x509 -in $SSL_CERT_PATH -text -noout${NC}"
echo ""
echo -e "${YELLOW}⚠️  Lembre-se:${NC}"
echo -e "${YELLOW}   • Verificar se as aplicações estão rodando (pm2 list)${NC}"
echo -e "${YELLOW}   • Monitorar logs regularmente${NC}"
echo -e "${YELLOW}   • Fazer backup regular do banco de dados${NC}"
echo -e "${YELLOW}   • Renovar certificados SSL quando necessário${NC}"
echo ""
print_header "PORTAL SABERCON PRODUÇÃO ATIVO"