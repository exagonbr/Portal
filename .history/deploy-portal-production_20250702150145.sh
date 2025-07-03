#!/bin/bash

# Portal Sabercon - Script de Deploy para Produção
# Frontend: https://portal.sabercon.com.br
# Backend API: https://portal.sabercon.com.br/api

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Função para verificar se comando foi executado com sucesso
check_status() {
    if [ $? -eq 0 ]; then
        log_success "$1"
    else
        log_error "Falha: $1"
        exit 1
    fi
}

# Verificar se está executando como root ou com sudo
if [ "$EUID" -ne 0 ]; then
    log_error "Este script deve ser executado como root ou com sudo"
    exit 1
fi

# Configurações
DOMAIN="portal.sabercon.com.br"
FRONTEND_PORT=3000
BACKEND_PORT=3001
PROJECT_DIR="/var/www/portal"
NGINX_CONFIG="/etc/nginx/nginx.conf"
SITE_CONFIG="/etc/nginx/sites-available/default"

log "🚀 Iniciando deploy do Portal Sabercon para produção..."
log "📍 Domínio: $DOMAIN"
log "🖥️  Frontend: https://$DOMAIN (porta $FRONTEND_PORT)"
log "🔧 Backend API: https://$DOMAIN/api (porta $BACKEND_PORT)"
echo ""

# Verificar se o diretório do projeto existe
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Diretório do projeto não encontrado: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Parar serviços
log "⏹️  Parando serviços..."
systemctl stop nginx 2>/dev/null || true
pm2 delete all 2>/dev/null || true
check_status "Serviços parados"

# Atualizar código
log "📥 Atualizando código do repositório..."
git fetch --all
git reset --hard origin/new_release
check_status "Código atualizado"

# Configurar variáveis de ambiente
log "⚙️  Configurando variáveis de ambiente..."

# Copiar arquivo de produção para frontend
if [ -f "env.production.portal" ]; then
    cp env.production.portal .env.production
    log_success "Arquivo .env.production configurado"
else
    log_warning "Arquivo env.production.portal não encontrado"
fi

# Copiar arquivo de produção para backend
if [ -f "backend/env.production.portal" ]; then
    cp backend/env.production.portal backend/.env.production
    log_success "Arquivo backend/.env.production configurado"
else
    log_warning "Arquivo backend/env.production.portal não encontrado"
fi

# Verificar e instalar Node.js e PM2
log "🔧 Verificando dependências do sistema..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    log "📦 Node.js não encontrado. Instalando..."
    
    # Instalar Node.js via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    check_status "Node.js instalado"
    
    log_success "Node.js $(node --version) instalado com sucesso"
else
    log_success "Node.js $(node --version) já está instalado"
fi

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log "📦 PM2 não encontrado. Instalando..."
    
    npm install -g pm2
    check_status "PM2 instalado"
    
    log_success "PM2 instalado com sucesso"
else
    log_success "PM2 já está instalado"
fi

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    log "📦 PostgreSQL não encontrado. Instalando..."
    
    apt install -y postgresql postgresql-contrib
    check_status "PostgreSQL instalado"
    
    # Iniciar e habilitar PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    log_success "PostgreSQL instalado e iniciado"
    log_warning "⚠️  Configure o banco de dados PostgreSQL manualmente:"
    log_warning "   sudo -u postgres createuser --interactive portal_user"
    log_warning "   sudo -u postgres createdb portal_sabercon"
    log_warning "   sudo -u postgres psql -c \"ALTER USER portal_user PASSWORD 'sua_senha_aqui';\""
else
    log_success "PostgreSQL já está instalado"
fi

# Verificar se Redis está instalado
if ! command -v redis-server &> /dev/null; then
    log "📦 Redis não encontrado. Instalando..."
    
    apt install -y redis-server
    check_status "Redis instalado"
    
    # Iniciar e habilitar Redis
    systemctl start redis-server
    systemctl enable redis-server
    
    log_success "Redis instalado e iniciado"
else
    log_success "Redis já está instalado"
    
    # Verificar se está rodando
    if ! systemctl is-active --quiet redis-server; then
        systemctl start redis-server
        log_success "Redis iniciado"
    fi
fi

# Instalar dependências
log "📦 Instalando dependências do projeto..."
npm ci --only=production
check_status "Dependências frontend instaladas"

cd backend
npm ci --only=production
cd ..
check_status "Dependências backend instaladas"

# Build das aplicações
log "🔨 Fazendo build do frontend..."
npm run build
check_status "Build frontend concluído"

log "🔨 Fazendo build do backend..."
cd backend
npm run build
cd ..
check_status "Build backend concluído"

# Instalar e configurar Nginx
log "🌐 Verificando e instalando Nginx..."

# Verificar se o Nginx está instalado
if ! command -v nginx &> /dev/null; then
    log "📦 Nginx não encontrado. Instalando..."
    
    # Atualizar repositórios
    apt update
    check_status "Repositórios atualizados"
    
    # Instalar Nginx
    apt install -y nginx
    check_status "Nginx instalado"
    
    # Parar Nginx para configuração
    systemctl stop nginx
    
    log_success "Nginx instalado com sucesso"
else
    log_success "Nginx já está instalado"
fi

# Verificar se certbot está instalado (para SSL)
if ! command -v certbot &> /dev/null; then
    log "🔒 Certbot não encontrado. Instalando..."
    
    # Instalar snapd se não estiver instalado
    if ! command -v snap &> /dev/null; then
        apt install -y snapd
        check_status "Snapd instalado"
    fi
    
    # Instalar certbot via snap
    snap install --classic certbot
    
    # Criar link simbólico
    ln -sf /snap/bin/certbot /usr/bin/certbot
    check_status "Certbot instalado"
    
    log_success "Certbot instalado com sucesso"
else
    log_success "Certbot já está instalado"
fi

log "⚙️  Configurando Nginx..."

# Backup da configuração atual
if [ -f "$NGINX_CONFIG" ]; then
    cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    log_success "Backup do Nginx criado"
fi

# Copiar nova configuração
if [ -f "nginx-production-config.conf" ]; then
    cp nginx-production-config.conf "$NGINX_CONFIG"
    log_success "Configuração do Nginx atualizada"
else
    log_error "Arquivo nginx-production-config.conf não encontrado"
    exit 1
fi

# Criar diretório de cache
mkdir -p /var/cache/nginx/portal
chown -R www-data:www-data /var/cache/nginx/portal
check_status "Diretório de cache criado"

# Testar configuração do Nginx
log "🧪 Testando configuração do Nginx..."
nginx -t
check_status "Configuração do Nginx válida"

# Executar migrações do banco de dados
log "🗄️  Executando migrações do banco de dados..."
cd backend
npm run migrate 2>/dev/null || true
check_status "Migrações executadas"
cd ..

# Configurar PM2
log "🔄 Configurando PM2..."

# Criar diretório de logs
mkdir -p logs
chmod 755 logs

# Iniciar aplicações com PM2
pm2 start ecosystem.config.js --env production
check_status "Aplicações iniciadas com PM2"

# Configurar PM2 para iniciar automaticamente
pm2 startup
pm2 save
check_status "PM2 configurado para inicialização automática"

# Iniciar Nginx
log "🌐 Iniciando Nginx..."
systemctl start nginx
systemctl enable nginx
check_status "Nginx iniciado"

# Configurar firewall
log "🔥 Configurando firewall..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable
check_status "Firewall configurado"

# Verificar status dos serviços
log "🔍 Verificando status dos serviços..."

# Verificar PM2
log "📊 Status PM2:"
pm2 status

# Verificar Nginx
if systemctl is-active --quiet nginx; then
    log_success "Nginx está rodando"
else
    log_error "Nginx não está rodando"
fi

# Verificar se as portas estão abertas
if netstat -tuln | grep -q ":$FRONTEND_PORT "; then
    log_success "Frontend rodando na porta $FRONTEND_PORT"
else
    log_warning "Frontend pode não estar rodando na porta $FRONTEND_PORT"
fi

if netstat -tuln | grep -q ":$BACKEND_PORT "; then
    log_success "Backend rodando na porta $BACKEND_PORT"
else
    log_warning "Backend pode não estar rodando na porta $BACKEND_PORT"
fi

# Teste de conectividade
log "🌐 Testando conectividade..."

# Testar frontend
if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200\|301\|302"; then
    log_success "Frontend acessível em https://$DOMAIN"
else
    log_warning "Frontend pode não estar acessível"
fi

# Testar backend API
if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/health" | grep -q "200"; then
    log_success "Backend API acessível em https://$DOMAIN/api"
else
    log_warning "Backend API pode não estar acessível"
fi

# Limpeza
log "🧹 Limpando arquivos temporários..."
npm cache clean --force 2>/dev/null || true
find . -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
check_status "Limpeza concluída"

echo ""
log_success "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Resumo do Deploy:"
echo "   • Frontend: https://$DOMAIN"
echo "   • Backend API: https://$DOMAIN/api"
echo "   • Health Check: https://$DOMAIN/_health"
echo "   • API Health: https://$DOMAIN/api/health"
echo ""
echo "🔧 Comandos úteis:"
echo "   • Ver logs: pm2 logs"
echo "   • Reiniciar: pm2 restart all"
echo "   • Status: pm2 status"
echo "   • Nginx logs: tail -f /var/log/nginx/error.log"
echo ""
echo "🧪 Teste agora:"
echo "   • Frontend: https://$DOMAIN"
echo "   • API: https://$DOMAIN/api/health"
echo ""

log_success "Deploy finalizado! ✨" 