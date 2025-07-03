#!/bin/bash

# Portal Sabercon - Otimização Nginx para Comunicação Direta (HTTP)
# Versão para teste sem SSL - Remove sobrecarga de proxy do Next.js

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    log_error "Este script deve ser executado como root"
    exit 1
fi

# Configurações
DOMAIN="portal.sabercon.com.br"
FRONTEND_PORT=3000
BACKEND_PORT=3001

log "🚀 Iniciando otimização do Nginx para comunicação direta (HTTP)..."
log "   Frontend: localhost:$FRONTEND_PORT"
log "   Backend: localhost:$BACKEND_PORT"
log "   Proxy Next.js: DESABILITADO"
log "   SSL: DESABILITADO (apenas para teste)"

# Backup da configuração atual
BACKUP_DIR="/var/backups/nginx-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp /etc/nginx/sites-available/default "$BACKUP_DIR/" 2>/dev/null || true
cp /etc/nginx/nginx.conf "$BACKUP_DIR/" 2>/dev/null || true
log "📁 Backup criado em: $BACKUP_DIR"

# Primeiro, configurar o nginx.conf principal com rate limiting
log "⚙️ Configurando nginx.conf principal..."

cat > /etc/nginx/nginx.conf << 'EOF'
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
    
    # Rate Limiting (configurações globais)
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/s;
    
    # Connection limiting
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
    limit_conn_zone $server_name zone=conn_limit_per_server:10m;
    
    # Cache settings
    proxy_cache_path /var/cache/nginx/portal levels=1:2 keys_zone=portal_cache:10m max_size=1g inactive=60m use_temp_path=off;
    
    # Include sites
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Agora configurar o site específico (apenas HTTP para teste)
log "⚙️ Criando configuração otimizada do site (HTTP)..."

cat > /etc/nginx/sites-available/default << EOF
# Portal Sabercon - Configuração Otimizada (HTTP para teste)
# Comunicação direta frontend-backend (sem proxy Next.js)
# Frontend: localhost:$FRONTEND_PORT | Backend: localhost:$BACKEND_PORT

# Configuração HTTP principal
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN localhost;
    
    # Headers de segurança básicos
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Connection limiting
    limit_conn conn_limit_per_ip 20;
    limit_conn conn_limit_per_server 1000;
    
    # Frontend (Next.js) → localhost:$FRONTEND_PORT
    location / {
        # Rate limiting suave
        limit_req zone=general burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts otimizados
        proxy_connect_timeout 20s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings otimizados
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        
        # Cache para assets estáticos do Next.js
        location ~* ^/_next/static/ {
            proxy_pass http://127.0.0.1:$FRONTEND_PORT;
            proxy_cache portal_cache;
            proxy_cache_valid 200 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Cache-Status \$upstream_cache_status;
            expires 1y;
        }
        
        # Cache para outros assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
            proxy_pass http://127.0.0.1:$FRONTEND_PORT;
            proxy_cache portal_cache;
            proxy_cache_valid 200 7d;
            add_header Cache-Control "public, max-age=604800";
            add_header X-Cache-Status \$upstream_cache_status;
            expires 7d;
        }
    }
    
    # Backend API → localhost:$BACKEND_PORT/api/
    # COMUNICAÇÃO DIRETA - sem proxy Next.js
    location /api/ {
        # Rate limiting para API
        limit_req zone=api burst=50 nodelay;
        
        proxy_pass http://127.0.0.1:$BACKEND_PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Headers específicos para API
        proxy_set_header Content-Type \$content_type;
        proxy_set_header Accept application/json;
        
        # CORS headers (permissivo para teste)
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials false always;
        
        # Preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
            add_header Access-Control-Max-Age 86400 always;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
        
        # Timeouts otimizados para API
        proxy_connect_timeout 25s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings para API
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # Rate limiting especial para login
    location /api/auth/login {
        limit_req zone=login burst=10 nodelay;
        
        proxy_pass http://127.0.0.1:$BACKEND_PORT/api/auth/login;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS específico para login
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Allow-Credentials false always;
        
        # Timeouts para login
        proxy_connect_timeout 20s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Health check endpoint
    location /_health {
        access_log off;
        return 200 "OK - Portal Sabercon Otimizado (HTTP)";
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

# Verificar se o Nginx está rodando
if ! systemctl is-active --quiet nginx; then
    log "🔄 Iniciando Nginx..."
    systemctl start nginx
fi

# Testar configuração
log "🧪 Testando configuração otimizada do Nginx..."
if nginx -t; then
    log_success "Configuração Nginx válida"
    
    # Recarregar Nginx
    log "🔄 Recarregando Nginx..."
    systemctl reload nginx
    log_success "Nginx recarregado com sucesso"
    
    # Verificar status
    if systemctl is-active --quiet nginx; then
        log_success "Nginx está rodando"
    else
        log_error "Nginx não está rodando"
        exit 1
    fi
    
else
    log_error "Configuração Nginx inválida"
    log "🔄 Restaurando backup..."
    cp "$BACKUP_DIR/default" /etc/nginx/sites-available/default
    cp "$BACKUP_DIR/nginx.conf" /etc/nginx/nginx.conf
    systemctl reload nginx
    exit 1
fi

# Verificar portas
log "🔍 Verificando portas..."
if netstat -tlnp | grep -q ":$FRONTEND_PORT"; then
    log_success "Frontend rodando na porta $FRONTEND_PORT"
else
    log_warning "Frontend não está rodando na porta $FRONTEND_PORT"
fi

if netstat -tlnp | grep -q ":$BACKEND_PORT"; then
    log_success "Backend rodando na porta $BACKEND_PORT"
else
    log_warning "Backend não está rodando na porta $BACKEND_PORT"
fi

# Testar conectividade
log "🌐 Testando conectividade..."
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$FRONTEND_PORT" | grep -q "200\|301\|302"; then
    log_success "Frontend respondendo"
else
    log_warning "Frontend não está respondendo"
fi

if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$BACKEND_PORT/api/_health" | grep -q "200"; then
    log_success "Backend API respondendo"
else
    log_warning "Backend API não está respondendo"
fi

# Testar a configuração completa
log "🌐 Testando configuração completa..."
if curl -s -o /dev/null -w "%{http_code}" "http://localhost/_health" | grep -q "200"; then
    log_success "Nginx proxy funcionando corretamente"
else
    log_warning "Nginx proxy pode ter problemas"
fi

log_success "🚀 Otimização concluída!"
echo
log "📋 Resumo das otimizações:"
log "   ✅ Proxy Next.js: REMOVIDO"
log "   ✅ Comunicação: DIRETA via Nginx"
log "   ✅ Timeouts: OTIMIZADOS (20-30s)"
log "   ✅ Cache: CONFIGURADO"
log "   ✅ Rate limiting: OTIMIZADO"
log "   ✅ CORS: CONFIGURADO (permissivo para teste)"
log "   ⚠️  SSL: DESABILITADO (apenas HTTP para teste)"
echo
log "🔧 Próximos passos:"
log "   1. Reinicie o frontend: pm2 restart frontend"
log "   2. Reinicie o backend: pm2 restart backend"
log "   3. Teste a aplicação: http://$DOMAIN ou http://localhost"
log "   4. Monitore logs: tail -f /var/log/nginx/access.log"
log "   5. Configure SSL depois: certbot --nginx"
echo
log_success "Portal Sabercon otimizado para comunicação direta!"
log_warning "IMPORTANTE: Esta configuração usa HTTP. Configure SSL em produção!" 