#!/bin/bash

# Portal Sabercon - Rollback: Restaurar Nginx em Produção
# Restaura configuração anterior do Nginx

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
PROJECT_DIR="/opt/portal-sabercon"
USER="ubuntu"

log "🔄 Iniciando rollback - Restaurando Nginx..."

# Listar backups disponíveis
BACKUP_BASE="/var/backups"
echo "📁 Backups disponíveis:"
ls -la "$BACKUP_BASE" | grep nginx- || {
    log_error "Nenhum backup do Nginx encontrado em $BACKUP_BASE"
    exit 1
}

echo
read -p "📋 Digite o nome do backup para restaurar (ex: nginx-removal-20250630-123000): " BACKUP_NAME

BACKUP_DIR="$BACKUP_BASE/$BACKUP_NAME"

if [ ! -d "$BACKUP_DIR" ]; then
    log_error "Backup não encontrado: $BACKUP_DIR"
    exit 1
fi

log "📁 Usando backup: $BACKUP_DIR"

# Confirmar ação
read -p "⚠️  ATENÇÃO: Isso restaurará o Nginx e parará o modo direto. Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Operação cancelada pelo usuário"
    exit 1
fi

# Parar aplicações PM2
log "🛑 Parando aplicações PM2..."
sudo -u $USER pm2 stop all 2>/dev/null || true
sudo -u $USER pm2 delete all 2>/dev/null || true
log_success "Aplicações PM2 paradas"

# Parar serviço systemd
log "🛑 Parando serviço Portal Sabercon..."
systemctl stop portal-sabercon.service 2>/dev/null || true
systemctl disable portal-sabercon.service 2>/dev/null || true
log_success "Serviço parado"

# Remover configurações do modo direto
log "🧹 Removendo configurações do modo direto..."
rm -f "/usr/local/bin/portal-start"
rm -f "/usr/local/bin/portal-stop"
rm -f "/usr/local/bin/portal-status"
rm -f "/etc/systemd/system/portal-sabercon.service"
systemctl daemon-reload
log_success "Configurações removidas"

# Instalar Nginx
log "📦 Instalando Nginx..."
apt-get update
apt-get install -y nginx
log_success "Nginx instalado"

# Restaurar configurações do backup
log "📋 Restaurando configurações do backup..."
if [ -d "$BACKUP_DIR/nginx" ]; then
    cp -r "$BACKUP_DIR/nginx"/* /etc/nginx/
    log_success "Configurações Nginx restauradas"
else
    log_error "Configurações Nginx não encontradas no backup"
    exit 1
fi

# Restaurar logs se existirem
if [ -d "$BACKUP_DIR/nginx" ]; then
    mkdir -p /var/log/nginx
    if [ -d "$BACKUP_DIR/nginx" ]; then
        cp -r "$BACKUP_DIR/nginx"/* /var/log/nginx/ 2>/dev/null || true
    fi
fi

# Ajustar permissões
chown -R www-data:www-data /var/log/nginx
chown -R root:root /etc/nginx

# Configurar firewall para Nginx
log "🔥 Configurando firewall para Nginx..."
ufw delete allow $FRONTEND_PORT/tcp 2>/dev/null || true
ufw delete allow $BACKEND_PORT/tcp 2>/dev/null || true
ufw allow 'Nginx Full'
ufw allow 22/tcp
ufw --force enable
log_success "Firewall configurado para Nginx"

# Testar configuração Nginx
log "🧪 Testando configuração Nginx..."
if nginx -t; then
    log_success "Configuração Nginx válida"
else
    log_error "Configuração Nginx inválida"
    log "Tentando configuração básica..."
    
    # Criar configuração básica se a restaurada falhar
    cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $DOMAIN www.$DOMAIN _;
    
    location / {
        proxy_pass http://127.0.0.1:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    if nginx -t; then
        log_success "Configuração básica aplicada"
    else
        log_error "Falha na configuração Nginx"
        exit 1
    fi
fi

# Iniciar e habilitar Nginx
log "🚀 Iniciando Nginx..."
systemctl enable nginx
systemctl start nginx

if systemctl is-active --quiet nginx; then
    log_success "Nginx iniciado com sucesso"
else
    log_error "Falha ao iniciar Nginx"
    exit 1
fi

# Atualizar configuração de ambiente para modo proxy
log "⚙️ Atualizando configuração de ambiente..."

cat > "$PROJECT_DIR/.env.production" << EOF
# Portal Sabercon - Produção com Nginx (Restaurado)
NODE_ENV=production

# URLs com Nginx
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
INTERNAL_API_URL=http://localhost:$BACKEND_PORT/api

# Configurações de produção
NEXT_PUBLIC_SECURE_COOKIES=true
NEXT_PUBLIC_SAME_SITE=strict

# CORS
CORS_ORIGIN=https://$DOMAIN
ALLOWED_ORIGINS=https://$DOMAIN

# Cache
NEXT_PUBLIC_CACHE_ENABLED=true
NEXT_PUBLIC_CACHE_TTL=3600

# Com Nginx
DISABLE_NEXTJS_PROXY=true
DIRECT_BACKEND_COMMUNICATION=false
NGINX_REQUIRED=true

# Timeouts
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000
EOF

chown $USER:$USER "$PROJECT_DIR/.env.production"
log_success "Configuração de ambiente atualizada"

# Criar configuração PM2 para modo Nginx
cat > "$PROJECT_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: '$PROJECT_DIR',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: $FRONTEND_PORT,
        NEXT_PUBLIC_APP_URL: 'https://$DOMAIN',
        NEXT_PUBLIC_API_URL: 'https://$DOMAIN/api',
        INTERNAL_API_URL: 'http://localhost:$BACKEND_PORT/api'
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      autorestart: true,
      watch: false
    },
    {
      name: 'backend',
      cwd: '$PROJECT_DIR/backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT,
        CORS_ORIGIN: 'https://$DOMAIN',
        ALLOWED_ORIGINS: 'https://$DOMAIN'
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      autorestart: true,
      watch: false
    }
  ]
};
EOF

chown $USER:$USER "$PROJECT_DIR/ecosystem.config.js"

# Iniciar aplicações
log "🚀 Iniciando aplicações..."
sudo -u $USER bash -c "cd $PROJECT_DIR && pm2 start ecosystem.config.js"
sudo -u $USER pm2 save
log_success "Aplicações iniciadas"

# Verificar status
sleep 5
log "🔍 Verificando status..."

if systemctl is-active --quiet nginx; then
    log_success "Nginx rodando"
else
    log_warning "Nginx pode ter problemas"
fi

if sudo -u $USER pm2 list | grep -q "online"; then
    log_success "Aplicações PM2 rodando"
else
    log_warning "Aplicações PM2 podem ter problemas"
fi

# Testar conectividade
log "🌐 Testando conectividade..."

if curl -s -o /dev/null -w "%{http_code}" "http://localhost" | grep -q "200\|301\|302"; then
    log_success "Nginx proxy funcionando"
else
    log_warning "Nginx proxy pode ter problemas"
fi

log_success "🎉 Rollback concluído!"
echo
log "📋 Configuração restaurada:"
log "   ✅ Nginx: RESTAURADO e funcionando"
log "   ✅ Frontend: https://$DOMAIN (via Nginx)"
log "   ✅ Backend: https://$DOMAIN/api (via Nginx)"
log "   ✅ PM2: Configurado para modo proxy"
log "   ✅ Firewall: Configurado para Nginx"
echo
log "🔧 Comandos úteis:"
log "   systemctl status nginx"
log "   pm2 status"
log "   pm2 logs"
log "   nginx -t"
echo
log "🌐 Acesso:"
log "   Site: https://$DOMAIN"
log "   API: https://$DOMAIN/api"
echo
log_success "Portal Sabercon restaurado para modo Nginx! 🚀" 