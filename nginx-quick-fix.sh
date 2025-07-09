#!/bin/bash

echo "🔧 Correção Rápida do Nginx"
echo "=========================="

# 1. Parar Nginx se estiver rodando
echo "1. Parando Nginx..."
sudo systemctl stop nginx 2>/dev/null

# 2. Verificar o que está usando as portas
echo -e "\n2. Verificando portas..."
sudo fuser -k 80/tcp 2>/dev/null
sudo fuser -k 443/tcp 2>/dev/null

# 3. Fazer backup e criar configuração simples
echo -e "\n3. Criando configuração de emergência..."
sudo mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.broken.$(date +%Y%m%d-%H%M%S) 2>/dev/null

# 4. Criar configuração mínima que funciona
cat << 'EOF' | sudo tee /etc/nginx/sites-enabled/default > /dev/null
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
EOF

# 5. Testar e iniciar
echo -e "\n4. Testando configuração..."
sudo nginx -t

echo -e "\n5. Iniciando Nginx..."
sudo systemctl start nginx

# 6. Verificar status
echo -e "\n6. Status:"
sudo systemctl status nginx --no-pager | head -10

echo -e "\n✅ Nginx deve estar funcionando agora!"
echo "⚠️  Esta é uma configuração de emergência (apenas HTTP)"
echo "📋 Para adicionar HTTPS, execute os scripts de SSL depois" 