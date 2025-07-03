#!/bin/bash

# Script rápido para resolver problema de login
# Execute no servidor: sudo bash quick-fix-login.sh

echo "🔧 CORREÇÃO RÁPIDA - Problema de Login"
echo "====================================="

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Execute como root: sudo bash quick-fix-login.sh"
    exit 1
fi

echo "⏹️  Parando Nginx..."
systemctl stop nginx

echo "🧹 Limpando cache de rate limiting..."
rm -rf /var/cache/nginx/* 2>/dev/null || true
rm -rf /tmp/nginx-* 2>/dev/null || true

echo "⚙️ Aplicando configuração SEM rate limiting..."

# Configuração temporária SEM rate limiting
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name portal.sabercon.com.br www.portal.sabercon.com.br _;
    
    # Headers para ALB
    set $forwarded_scheme $scheme;
    if ($http_x_forwarded_proto = 'https') {
        set $forwarded_scheme https;
    }
    
    # Frontend → portal.sabercon.com.br
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $forwarded_scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API → portal.sabercon.com.br/api/ (SEM RATE LIMITING)
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $forwarded_scheme;
        
        # CORS
        add_header Access-Control-Allow-Origin "https://portal.sabercon.com.br" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-CSRF-Token" always;
        add_header Access-Control-Allow-Credentials true always;
        
        # Preflight
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://portal.sabercon.com.br" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-CSRF-Token" always;
            add_header Access-Control-Max-Age 86400 always;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Health checks
    location /health {
        access_log off;
        return 200 "healthy";
        add_header Content-Type text/plain;
    }
    
    location /_health {
        access_log off;
        return 200 "OK - Portal Sabercon (SEM Rate Limiting)";
        add_header Content-Type text/plain;
    }
}
EOF

# Configuração nginx.conf SEM rate limiting
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
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    client_max_body_size 100M;
    
    # Real IP para ALB
    set_real_ip_from 10.0.0.0/8;
    set_real_ip_from 172.16.0.0/12;
    set_real_ip_from 192.168.0.0/16;
    real_ip_header X-Forwarded-For;
    real_ip_recursive on;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # SEM RATE LIMITING - REMOVIDO COMPLETAMENTE
    
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

echo "🧪 Testando configuração..."
if nginx -t; then
    echo "✅ Configuração válida"
else
    echo "❌ Erro na configuração"
    exit 1
fi

echo "🚀 Iniciando Nginx..."
systemctl start nginx

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx ativo"
else
    echo "❌ Nginx não está ativo"
    exit 1
fi

echo ""
echo "✅ CORREÇÃO APLICADA COM SUCESSO!"
echo "================================="
echo ""
echo "🧪 Teste agora:"
echo "   https://portal.sabercon.com.br/"
echo ""
echo "📊 Verificar:"
echo "   curl http://localhost/health"
echo "   curl http://localhost/api/health"
echo ""
echo "📝 Logs:"
echo "   tail -f /var/log/nginx/access.log"
echo "   tail -f /var/log/nginx/error.log"
echo ""
echo "⚠️  RATE LIMITING COMPLETAMENTE DESABILITADO"
echo "   Para reativar depois: sudo bash setup-production-aws-alb.sh"
echo "" 