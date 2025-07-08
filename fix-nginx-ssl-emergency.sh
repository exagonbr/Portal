#!/bin/bash

echo "🔧 Script de emergência para corrigir problemas de SSL do nginx"
echo "=================================================="

# Verificar se rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script precisa ser executado como root (sudo)"
    exit 1
fi

# Parar nginx se estiver rodando
echo "🛑 Parando nginx..."
systemctl stop nginx

# Verificar configuração atual
echo "🔍 Verificando configuração do nginx..."
nginx -t 2>&1 | tee /tmp/nginx_error.log

# Se há erro de SSL, tentar corrigir
if grep -q "cannot load certificate" /tmp/nginx_error.log; then
    echo "⚠️  Erro de certificado SSL detectado"
    
    # Verificar se o diretório de certificados existe
    if [ ! -d "/etc/letsencrypt/live/portal.sabercon.com.br" ]; then
        echo "📁 Criando configuração nginx temporária sem SSL..."
        
        # Backup da configuração atual
        cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
        
        # Criar configuração temporária sem SSL
        cat > /etc/nginx/sites-available/portal-temp << 'EOF'
server {
    listen 80;
    server_name portal.sabercon.com.br;
    
    # Redirect para HTTPS (temporariamente desabilitado)
    # return 301 https://$server_name$request_uri;
    
    # Configuração temporária para funcionar sem SSL
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
        proxy_send_timeout 10s;
    }
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 10s;
        proxy_send_timeout 10s;
    }
}
EOF
        
        # Remover configuração atual e aplicar temporária
        rm -f /etc/nginx/sites-enabled/default
        rm -f /etc/nginx/sites-enabled/portal
        ln -sf /etc/nginx/sites-available/portal-temp /etc/nginx/sites-enabled/portal-temp
        
        echo "✅ Configuração temporária criada"
    fi
fi

# Testar configuração novamente
echo "🧪 Testando nova configuração..."
if nginx -t; then
    echo "✅ Configuração do nginx OK"
    
    # Iniciar nginx
    echo "🚀 Iniciando nginx..."
    systemctl start nginx
    
    # Verificar status
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx iniciado com sucesso!"
        echo "🌐 Portal temporariamente disponível em: http://portal.sabercon.com.br"
        echo "⚠️  IMPORTANTE: Esta é uma configuração temporária sem SSL"
    else
        echo "❌ Falha ao iniciar nginx"
        systemctl status nginx
    fi
else
    echo "❌ Configuração do nginx ainda tem problemas"
    nginx -t
fi

# Verificar se o backend está rodando
echo ""
echo "🔍 Verificando backend..."
if netstat -tlnp | grep -q ":3001"; then
    echo "✅ Backend está rodando na porta 3001"
else
    echo "⚠️  Backend não está rodando na porta 3001"
    echo "🔍 Processos node em execução:"
    ps aux | grep node | grep -v grep
fi

# Verificar se o frontend está rodando  
echo ""
echo "🔍 Verificando frontend..."
if netstat -tlnp | grep -q ":3002"; then
    echo "✅ Frontend está rodando na porta 3002"
else
    echo "⚠️  Frontend não está rodando na porta 3002"
fi

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Teste o acesso via: http://portal.sabercon.com.br"
echo "2. Para configurar SSL definitivamente, execute: sudo certbot --nginx"
echo "3. Após SSL configurado, remova o arquivo temporário: sudo rm /etc/nginx/sites-enabled/portal-temp"

rm -f /tmp/nginx_error.log 