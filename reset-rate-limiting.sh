#!/bin/bash

# Script para resetar rate limiting do Nginx
# Portal Sabercon - Resolver problema de "Muitas tentativas de login"
# Execute como root: sudo bash reset-rate-limiting.sh

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🔄 RESETANDO RATE LIMITING - Portal Sabercon"
echo "============================================="
echo ""

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    log_error "Execute como root: sudo bash reset-rate-limiting.sh"
    exit 1
fi

# 1. Parar Nginx
log "⏹️  Parando Nginx..."
systemctl stop nginx

# 2. Limpar cache de rate limiting
log "🧹 Limpando cache de rate limiting..."
rm -rf /var/cache/nginx/portal/* 2>/dev/null || true
rm -rf /tmp/nginx-* 2>/dev/null || true

# Criar diretórios de cache novamente
mkdir -p /var/cache/nginx/portal
chown -R www-data:www-data /var/cache/nginx/portal

# 3. Aplicar configuração mais permissiva temporariamente
log "⚙️ Aplicando configuração temporária mais permissiva..."

# Backup da configuração atual
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d-%H%M%S)

# Configuração temporária com rate limiting muito permissivo
cat > /etc/nginx/sites-available/default << 'EOF'
# Portal Sabercon - Configuração Temporária (Rate Limiting Permissivo)
# SSL terminado no ALB/CloudFront
# Frontend: portal.sabercon.com.br | Backend: portal.sabercon.com.br

server {
    listen 80;
    server_name portal.sabercon.com.br www.portal.sabercon.com.br _;
    
    # Headers para detectar HTTPS do ALB
    set $forwarded_scheme $scheme;
    if ($http_x_forwarded_proto = 'https') {
        set $forwarded_scheme https;
    }
    
    # Security Headers (adaptados para ALB)
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Rate limiting MUITO permissivo para testes
    limit_conn conn_limit_per_ip 100;
    limit_conn conn_limit_per_server 5000;
    
    # Frontend (raiz do site) → portal.sabercon.com.br
    location / {
        # Rate limiting muito suave para frontend
        limit_req zone=general burst=50 nodelay;
        
        proxy_pass http://frontend_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $forwarded_scheme;
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
    
    # Backend API → portal.sabercon.com.br/api/ (SEM rate limiting rigoroso)
    location /api/ {
        # Rate limiting muito permissivo para API
        limit_req zone=api burst=100 nodelay;
        
        proxy_pass http://api_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $forwarded_scheme;
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
    
    # Login SEM rate limiting durante testes
    location /api/auth/login {
        # SEM rate limiting para login durante desenvolvimento
        # limit_req zone=login burst=50 nodelay;
        
        proxy_pass http://api_backend/api/auth/login;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $forwarded_scheme;
        
        # CORS específico para login
        add_header Access-Control-Allow-Origin "https://portal.sabercon.com.br" always;
        add_header Access-Control-Allow-Methods "POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials true always;
        
        # Timeouts para login
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Backend direto → portal.sabercon.com.br/
    location /backend/ {
        proxy_pass http://api_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $forwarded_scheme;
        
        # Timeout padrão
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint (importante para ALB)
    location /_health {
        access_log off;
        return 200 "OK - Portal Sabercon Production (ALB) - Rate Limiting Permissivo";
        add_header Content-Type text/plain;
    }
    
    # ALB Health Check
    location /health {
        access_log off;
        return 200 "healthy";
        add_header Content-Type text/plain;
    }
    
    # Nginx status (apenas localhost)
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        allow 172.16.0.0/12;
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

# 4. Atualizar nginx.conf com rate limiting mais permissivo
log "⚙️ Atualizando nginx.conf com configurações permissivas..."

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
    
    # Real IP (importante para ALB)
    set_real_ip_from 10.0.0.0/8;
    set_real_ip_from 172.16.0.0/12;
    set_real_ip_from 192.168.0.0/16;
    real_ip_header X-Forwarded-For;
    real_ip_recursive on;
    
    # MIME Types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging com IP real
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time" '
                    'scheme=$scheme host=$host';
    
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
    
    # Rate Limiting MUITO permissivo para desenvolvimento/testes
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=50r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=30r/m;
    
    # Connection limiting permissivo
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

# 5. Testar configuração
log "🧪 Testando nova configuração..."
if nginx -t; then
    log_success "Configuração válida"
else
    log_error "Erro na configuração"
    exit 1
fi

# 6. Iniciar Nginx
log "🚀 Iniciando Nginx com configurações permissivas..."
systemctl start nginx

# Verificar se está rodando
if systemctl is-active --quiet nginx; then
    log_success "Nginx ativo com rate limiting permissivo"
else
    log_error "Nginx não está ativo"
    exit 1
fi

# 7. Verificações
log "🧪 Testando endpoints..."

sleep 2

# Testar health
if curl -s http://localhost/health | grep -q "healthy"; then
    log_success "Health check OK"
else
    log_warning "Health check pode não estar funcionando"
fi

# Testar API health
if curl -s http://localhost/api/health 2>/dev/null | grep -q "OK\|healthy\|success"; then
    log_success "API health check OK"
else
    log_warning "API health check pode não estar funcionando"
fi

# 8. Mostrar status
echo ""
echo "✅ RATE LIMITING RESETADO COM SUCESSO!"
echo "======================================"
echo ""
echo "🔧 Configurações aplicadas:"
echo "   • Rate limiting muito permissivo"
echo "   • Login sem bloqueio de tentativas"
echo "   • API com burst de 100 requests"
echo "   • Cache limpo"
echo ""
echo "🧪 Teste o login agora:"
echo "   https://portal.sabercon.com.br/"
echo ""
echo "📊 Monitoramento:"
echo "   • Logs: tail -f /var/log/nginx/access.log"
echo "   • Status: systemctl status nginx"
echo "   • Health: curl http://localhost/health"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   Esta é uma configuração temporária para testes."
echo "   Para produção, execute novamente:"
echo "   sudo bash setup-production-aws-alb.sh"
echo ""