#!/bin/bash

# Portal Sabercon - Setup Inicial do Servidor
# Este script prepara o servidor para receber o projeto

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
PROJECT_DIR="/var/www/portal"
GIT_REPO=""

log "🚀 Setup inicial do servidor para Portal Sabercon"
log "📍 Domínio: $DOMAIN"
log "📁 Diretório do projeto: $PROJECT_DIR"
echo ""

echo ""
log "🔍 Verificando sistema..."

# Verificar distribuição
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
    log_success "Sistema detectado: $OS $VER"
else
    log_error "Não foi possível detectar a distribuição do sistema"
    exit 1
fi

# Verificar se é Ubuntu/Debian
if [[ "$OS" != *"Ubuntu"* ]] && [[ "$OS" != *"Debian"* ]]; then
    log_warning "⚠️  Este script foi testado apenas em Ubuntu/Debian"
    read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "👋 Setup cancelado pelo usuário"
        exit 0
    fi
fi

# Atualizar sistema
log "📦 Atualizando sistema..."
apt update && apt upgrade -y
check_status "Sistema atualizado"

# Instalar dependências básicas
log "📦 Instalando dependências básicas..."
apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release ufw git build-essential
check_status "Dependências básicas instaladas"

# Clonar repositório
log "📥 Clonando repositório..."
if [ -d "$PROJECT_DIR/.git" ]; then
    log_warning "Repositório já existe. Atualizando..."
    cd "$PROJECT_DIR"
    git fetch --all
    git reset --hard origin/main 2>/dev/null || git reset --hard origin/master 2>/dev/null || git reset --hard origin/new_release
    check_status "Repositório atualizado"
else
    git clone "$GIT_REPO" "$PROJECT_DIR"
    check_status "Repositório clonado"
fi

cd "$PROJECT_DIR"

# Verificar estrutura do projeto
log "🔍 Verificando estrutura do projeto..."
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado no repositório"
    exit 1
fi

if [ ! -d "backend" ]; then
    log_error "Diretório backend/ não encontrado no repositório"
    exit 1
fi

if [ ! -f "backend/package.json" ]; then
    log_error "backend/package.json não encontrado no repositório"
    exit 1
fi

log_success "Estrutura do projeto validada"

# Configurar permissões
log "🔐 Configurando permissões..."
chown -R $SUDO_USER:$SUDO_USER "$PROJECT_DIR" 2>/dev/null || chown -R ubuntu:ubuntu "$PROJECT_DIR" 2>/dev/null || true
chmod -R 755 "$PROJECT_DIR"
check_status "Permissões configuradas"

# Verificar se os arquivos de configuração existem
log "📋 Verificando arquivos de configuração..."

CONFIG_FILES=(
    "nginx-production-config.conf"
    "env.production.portal"
    "backend/env.production.portal"
    "deploy-portal-production.sh"
    "ecosystem.config.js"
)

MISSING_FILES=()
for file in "${CONFIG_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    log_warning "⚠️  Alguns arquivos de configuração não foram encontrados:"
    for file in "${MISSING_FILES[@]}"; do
        log_warning "   - $file"
    done
    echo ""
    log_warning "Certifique-se de que todos os arquivos de configuração estão no repositório"
    log_warning "ou copie-os manualmente para o diretório do projeto"
else
    log_success "Todos os arquivos de configuração encontrados"
fi

# Tornar script de deploy executável
if [ -f "deploy-portal-production.sh" ]; then
    chmod +x deploy-portal-production.sh
    log_success "Script de deploy tornado executável"
fi

echo ""
log_success "🎉 Setup inicial concluído com sucesso!"
echo ""
echo "📋 Resumo:"
echo "   • Sistema atualizado"
echo "   • Dependências básicas instaladas"
echo "   • Projeto clonado em: $PROJECT_DIR"
echo "   • Estrutura do projeto validada"
echo "   • Permissões configuradas"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Edite os arquivos de configuração se necessário:"
echo "      - env.production.portal"
echo "      - backend/env.production.portal"
echo ""
echo "   2. Execute o deploy:"
echo "      cd $PROJECT_DIR"
echo "      sudo bash deploy-portal-production.sh"
echo ""
echo "📝 Configurações importantes:"
echo "   • Domínio: $DOMAIN"
echo "   • Frontend: https://$DOMAIN"
echo "   • Backend API: https://$DOMAIN/api"
echo ""

log_success "Setup finalizado! ✨" 