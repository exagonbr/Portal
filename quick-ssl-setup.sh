#!/bin/bash

# Script rápido para SSL Let's Encrypt - 54.232.72.62
# Execute como root: sudo bash quick-ssl-setup.sh

set -e

# Configurações
IP="54.232.72.62"
PORT="3000"
EMAIL="admin@sabercon.com.br"  # ALTERE ESTE EMAIL

echo "🚀 Configuração rápida SSL para $IP:$PORT"
echo "📧 Email: $EMAIL"

# Verificar root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Execute como root: sudo bash quick-ssl-setup.sh"
    exit 1
fi

# Atualizar e instalar
echo "📦 Instalando dependências..."
apt update
apt install -y nginx certbot python3-certbot-nginx

# Configurar firewall básico
echo "🔥 Configurando firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow $PORT
ufw --force enable

# Parar nginx
systemctl stop nginx 2>/dev/null || true

# Configuração nginx básica
echo "⚙️ Configurando Nginx..."
cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80;
    server_name $IP;
    
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Iniciar nginx
systemctl start nginx
systemctl enable nginx

echo "🔒 Obtendo certificado SSL..."

# Obter certificado
certbot --nginx --non-interactive --agree-tos --email $EMAIL -d $IP

if [ $? -eq 0 ]; then
    echo "✅ SSL configurado com sucesso!"
    echo "🌐 Acesse: https://$IP"
    echo "📱 PWA agora funcionará!"
else
    echo "❌ Erro no SSL. Verifique se:"
    echo "  - O servidor está acessível na porta 80"
    echo "  - Não há firewall bloqueando"
    echo "  - O IP está correto"
fi

# Configurar renovação
systemctl enable certbot.timer
systemctl start certbot.timer

echo "🔄 Renovação automática configurada"
echo "✅ Configuração concluída!" 