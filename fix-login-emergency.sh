#!/bin/bash

# Script de emergência para corrigir o problema de login
# Execute como root: sudo bash fix-login-emergency.sh

echo "🚨 CORREÇÃO DE EMERGÊNCIA - PROBLEMA DE LOGIN"
echo "============================================="

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Execute como root: sudo bash fix-login-emergency.sh"
    exit 1
fi

echo "⏹️  Parando Nginx..."
systemctl stop nginx

echo "🧹 Limpando configurações anteriores..."
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/conf.d/rate_limiting.conf 2>/dev/null || true
rm -rf /var/cache/nginx/* 2>/dev/null || true

echo "⚙️  Criando configuração básica..."

# Configuração básica do Nginx
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    client_max_body_size 100M;
    
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
    
    # Timeouts aumentados
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;
    
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Configuração do site
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts aumentados
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
        
        # CORS
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-CSRF-Token" always;
        add_header Access-Control-Allow-Credentials true always;
        
        # Preflight
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-CSRF-Token" always;
            add_header Access-Control-Max-Age 86400 always;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

echo "🔗 Habilitando site..."
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

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
echo "📝 Logs:"
echo "   tail -f /var/log/nginx/access.log"
echo "   tail -f /var/log/nginx/error.log"
echo ""
echo "⚠️  ESTA É UMA CORREÇÃO DE EMERGÊNCIA"
echo "   Todas as configurações avançadas foram removidas"
echo "" 