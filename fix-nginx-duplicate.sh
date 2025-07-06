#!/bin/bash

# Script para corrigir configuração duplicada no Nginx

echo "🔧 Corrigindo configuração duplicada do Nginx..."

# Fazer backup
echo "📦 Fazendo backup..."
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d-%H%M%S)

# Mostrar as linhas com problema
echo -e "\n🔍 Configurações encontradas:"
sudo grep -n "server_name.*portal.sabercon.com.br" /etc/nginx/sites-enabled/default

# Contar quantos blocos server existem
SERVER_BLOCKS=$(sudo grep -c "^server {" /etc/nginx/sites-enabled/default)
echo -e "\n📊 Número de blocos 'server' encontrados: $SERVER_BLOCKS"

if [ $SERVER_BLOCKS -gt 1 ]; then
    echo -e "\n⚠️  Múltiplos blocos server detectados!"
    echo "Isso geralmente indica configurações duplicadas."
    
    # Criar novo arquivo com apenas um bloco server
    echo -e "\n🔨 Criando nova configuração..."
    
    # Criar arquivo temporário com a configuração correta
    cat > /tmp/nginx-portal.conf << 'EOF'
# Configuração do Portal Sabercon
server {
    listen 80;
    server_name portal.sabercon.com.br;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name portal.sabercon.com.br;
    
    # Certificados SSL (ajuste os caminhos conforme necessário)
    ssl_certificate /etc/letsencrypt/live/portal.sabercon.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.sabercon.com.br/privkey.pem;
    
    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Logs
    access_log /var/log/nginx/portal.access.log;
    error_log /var/log/nginx/portal.error.log;
    
    # Proxy para Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Proxy para Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /_health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Perguntar ao usuário
    echo -e "\n❓ Deseja substituir a configuração atual pela configuração limpa? (s/n)"
    read -r resposta
    
    if [[ "$resposta" =~ ^[Ss]$ ]]; then
        # Substituir configuração
        sudo mv /tmp/nginx-portal.conf /etc/nginx/sites-enabled/default
        echo "✅ Configuração substituída"
        
        # Testar nova configuração
        echo -e "\n🧪 Testando nova configuração..."
        sudo nginx -t
        
        if [ $? -eq 0 ]; then
            echo "✅ Configuração válida"
            
            # Recarregar Nginx
            echo -e "\n🔄 Recarregando Nginx..."
            sudo systemctl reload nginx
            echo "✅ Nginx recarregado"
        else
            echo "❌ Erro na configuração!"
            echo "Restaurando backup..."
            sudo cp /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d-%H%M%S) /etc/nginx/sites-enabled/default
        fi
    else
        echo "❌ Operação cancelada"
        rm /tmp/nginx-portal.conf
    fi
else
    echo -e "\n✅ Apenas um bloco server encontrado"
    echo "O problema pode estar em outro arquivo de configuração."
    
    # Verificar outros arquivos
    echo -e "\n🔍 Verificando outros arquivos..."
    sudo grep -r "server_name.*portal.sabercon.com.br" /etc/nginx/conf.d/ 2>/dev/null || echo "Nenhuma configuração em conf.d/"
fi

echo -e "\n📋 Status final:"
sudo nginx -t

echo -e "\n💡 Dicas:"
echo "• Backups salvos com extensão .backup.TIMESTAMP"
echo "• Use 'sudo nginx -t' para testar configurações"
echo "• Use 'sudo systemctl reload nginx' para aplicar mudanças" 