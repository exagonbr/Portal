#!/bin/bash

# Portal Sabercon - Remoção Completa do Nginx em Produção
# Remove Nginx e configura ambiente direto com PM2

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
PROJECT_DIR="/opt/portal-sabercon"  # Ajuste conforme necessário
USER="ubuntu"  # Ajuste conforme necessário

log "🗑️  Iniciando remoção completa do Nginx em produção..."
log "   Domain: $DOMAIN"
log "   Frontend: localhost:$FRONTEND_PORT"
log "   Backend: localhost:$BACKEND_PORT"
log "   Nginx: SERÁ REMOVIDO COMPLETAMENTE"

# Confirmar ação
read -p "⚠️  ATENÇÃO: Isso removerá completamente o Nginx. Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Operação cancelada pelo usuário"
    exit 1
fi

# Backup completo antes da remoção
BACKUP_DIR="/var/backups/nginx-removal-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

log "📁 Criando backup completo..."
if [ -d "/etc/nginx" ]; then
    cp -r /etc/nginx "$BACKUP_DIR/" 2>/dev/null || true
fi
if [ -d "/var/log/nginx" ]; then
    cp -r /var/log/nginx "$BACKUP_DIR/" 2>/dev/null || true
fi
log_success "Backup criado em: $BACKUP_DIR"

# Parar e desabilitar Nginx
log "🛑 Parando e desabilitando Nginx..."
systemctl stop nginx 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true
log_success "Nginx parado e desabilitado"

# Parar aplicações PM2 se estiverem rodando
log "🛑 Parando aplicações PM2..."
sudo -u $USER pm2 stop all 2>/dev/null || true
log_success "Aplicações PM2 paradas"

# Remover Nginx completamente
log "🗑️  Removendo Nginx..."
apt-get remove --purge nginx nginx-common nginx-core -y 2>/dev/null || true
apt-get autoremove -y 2>/dev/null || true
rm -rf /etc/nginx /var/log/nginx /var/cache/nginx 2>/dev/null || true
log_success "Nginx removido completamente"

# Limpar configurações de firewall do Nginx
log "🔥 Limpando regras de firewall..."
ufw delete allow 'Nginx Full' 2>/dev/null || true
ufw delete allow 'Nginx HTTP' 2>/dev/null || true
ufw delete allow 'Nginx HTTPS' 2>/dev/null || true
log_success "Regras de firewall limpas"

# Configurar firewall para acesso direto
log "🔥 Configurando firewall para acesso direto..."
ufw allow $FRONTEND_PORT/tcp comment "Frontend Next.js"
ufw allow $BACKEND_PORT/tcp comment "Backend API"
ufw allow 22/tcp comment "SSH"
ufw --force enable
log_success "Firewall configurado para acesso direto"

# Criar configuração PM2 otimizada
log "⚙️ Criando configuração PM2 otimizada..."

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
        NEXT_PUBLIC_APP_URL: 'http://$DOMAIN:$FRONTEND_PORT',
        NEXT_PUBLIC_API_URL: 'http://$DOMAIN:$BACKEND_PORT/api',
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
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'backend',
      cwd: '$PROJECT_DIR/backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT,
        CORS_ORIGIN: 'http://$DOMAIN:$FRONTEND_PORT',
        ALLOWED_ORIGINS: 'http://$DOMAIN:$FRONTEND_PORT,http://localhost:$FRONTEND_PORT'
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOF

chown $USER:$USER "$PROJECT_DIR/ecosystem.config.js"
log_success "Configuração PM2 criada"

# Criar diretório de logs
mkdir -p "$PROJECT_DIR/logs"
chown -R $USER:$USER "$PROJECT_DIR/logs"

# Criar script de inicialização
log "📝 Criando script de inicialização..."

cat > "/usr/local/bin/portal-start" << EOF
#!/bin/bash
# Portal Sabercon - Script de Inicialização (Sem Nginx)

echo "🚀 Iniciando Portal Sabercon (Produção Direta)..."

cd $PROJECT_DIR

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 não encontrado. Instalando..."
    npm install -g pm2
fi

# Parar aplicações existentes
sudo -u $USER pm2 stop all 2>/dev/null || true
sudo -u $USER pm2 delete all 2>/dev/null || true

# Iniciar aplicações
echo "🔄 Iniciando aplicações..."
sudo -u $USER pm2 start ecosystem.config.js

# Salvar configuração PM2
sudo -u $USER pm2 save

# Mostrar status
sudo -u $USER pm2 status

echo "✅ Portal Sabercon iniciado!"
echo "   Frontend: http://$DOMAIN:$FRONTEND_PORT"
echo "   Backend:  http://$DOMAIN:$BACKEND_PORT/api"
echo "   Logs:     pm2 logs"
EOF

chmod +x "/usr/local/bin/portal-start"
log_success "Script de inicialização criado"

# Criar script de parada
cat > "/usr/local/bin/portal-stop" << EOF
#!/bin/bash
# Portal Sabercon - Script de Parada

echo "🛑 Parando Portal Sabercon..."
sudo -u $USER pm2 stop all
sudo -u $USER pm2 delete all
echo "✅ Portal Sabercon parado!"
EOF

chmod +x "/usr/local/bin/portal-stop"

# Criar script de status
cat > "/usr/local/bin/portal-status" << EOF
#!/bin/bash
# Portal Sabercon - Status

echo "📊 Status do Portal Sabercon:"
sudo -u $USER pm2 status
echo
echo "🌐 URLs:"
echo "   Frontend: http://$DOMAIN:$FRONTEND_PORT"
echo "   Backend:  http://$DOMAIN:$BACKEND_PORT/api"
echo
echo "📋 Logs:"
echo "   pm2 logs frontend"
echo "   pm2 logs backend"
EOF

chmod +x "/usr/local/bin/portal-status"

# Criar serviço systemd para PM2
log "⚙️ Configurando serviço systemd..."

cat > "/etc/systemd/system/portal-sabercon.service" << EOF
[Unit]
Description=Portal Sabercon (Direct Mode)
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/local/bin/portal-start
ExecStop=/usr/local/bin/portal-stop
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable portal-sabercon.service
log_success "Serviço systemd configurado"

# Atualizar configuração de ambiente
log "⚙️ Atualizando configuração de ambiente..."

cat > "$PROJECT_DIR/.env.production" << EOF
# Portal Sabercon - Produção Direta (Sem Nginx)
NODE_ENV=production

# URLs diretas
NEXT_PUBLIC_APP_URL=http://$DOMAIN:$FRONTEND_PORT
NEXT_PUBLIC_API_URL=http://$DOMAIN:$BACKEND_PORT/api
INTERNAL_API_URL=http://localhost:$BACKEND_PORT/api

# Configurações de produção
NEXT_PUBLIC_SECURE_COOKIES=false
NEXT_PUBLIC_SAME_SITE=lax

# CORS
CORS_ORIGIN=http://$DOMAIN:$FRONTEND_PORT
ALLOWED_ORIGINS=http://$DOMAIN:$FRONTEND_PORT

# Cache
NEXT_PUBLIC_CACHE_ENABLED=true
NEXT_PUBLIC_CACHE_TTL=3600

# Sem proxy
DISABLE_NEXTJS_PROXY=true
DIRECT_BACKEND_COMMUNICATION=true
NGINX_REQUIRED=false

# Timeouts
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000
EOF

chown $USER:$USER "$PROJECT_DIR/.env.production"
log_success "Configuração de ambiente atualizada"

# Iniciar aplicações
log "🚀 Iniciando aplicações..."
sudo -u $USER bash -c "cd $PROJECT_DIR && pm2 start ecosystem.config.js"
sudo -u $USER pm2 save
log_success "Aplicações iniciadas"

# Verificar status
sleep 5
log "🔍 Verificando status..."

if sudo -u $USER pm2 list | grep -q "online"; then
    log_success "Aplicações rodando"
else
    log_warning "Algumas aplicações podem ter problemas"
fi

# Testar conectividade
log "🌐 Testando conectividade..."

if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$FRONTEND_PORT" | grep -q "200\|301\|302"; then
    log_success "Frontend respondendo na porta $FRONTEND_PORT"
else
    log_warning "Frontend pode ter problemas"
fi

if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$BACKEND_PORT/api/_health" | grep -q "200"; then
    log_success "Backend API respondendo na porta $BACKEND_PORT"
else
    log_warning "Backend API pode ter problemas"
fi

log_success "🎉 Nginx removido com sucesso!"
echo
log "📋 Resumo da configuração:"
log "   ✅ Nginx: REMOVIDO COMPLETAMENTE"
log "   ✅ Frontend: http://$DOMAIN:$FRONTEND_PORT"
log "   ✅ Backend: http://$DOMAIN:$BACKEND_PORT/api"
log "   ✅ PM2: Configurado e rodando"
log "   ✅ Firewall: Configurado para acesso direto"
log "   ✅ Serviço systemd: Habilitado"
echo
log "🔧 Comandos úteis:"
log "   portal-start    # Iniciar aplicações"
log "   portal-stop     # Parar aplicações"
log "   portal-status   # Ver status"
log "   pm2 logs        # Ver logs"
log "   pm2 monit       # Monitor em tempo real"
echo
log "🌐 Acesso:"
log "   Frontend: http://$DOMAIN:$FRONTEND_PORT"
log "   Backend API: http://$DOMAIN:$BACKEND_PORT/api"
echo
log_warning "IMPORTANTE: Configure seu DNS/Load Balancer para apontar para as portas corretas!"
log_warning "Frontend: $DOMAIN:$FRONTEND_PORT"
log_warning "Backend: $DOMAIN:$BACKEND_PORT"
echo
log_success "Portal Sabercon agora roda sem Nginx! 🚀" 