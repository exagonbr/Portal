#!/bin/bash

# Script de Deploy - Portal Sabercon
# Versão: 2.0
# Data: $(date)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Função para imprimir com cores e ícones
print_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}🔥  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}🚀 $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Função para verificar se comando foi bem sucedido
check_status() {
    if [ $? -eq 0 ]; then
        print_success "$1"
    else
        print_error "Falha em: $1"
        exit 1
    fi
}

# Header principal
clear
print_header "PORTAL SABERCON - DEPLOY AUTOMATIZADO"
echo ""
print_info "Iniciando processo de deploy..."
print_info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Parar serviços PM2
print_step "Parando serviços PM2..."
pm2 delete all 2>/dev/null || true
check_status "Serviços PM2 parados"
echo ""

# Atualizar código fonte
print_step "Atualizando código fonte do repositório..."
git fetch --all
check_status "Fetch realizado"

print_step "Resetando para último commit..."
git reset --hard origin/master
check_status "Reset para origin/master concluído"
echo ""

# Limpeza de dependências
print_step "Iniciando limpeza de módulos..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_success "node_modules removido"
else
    print_warning "node_modules não encontrado"
fi

if [ -f "package-lock.json" ]; then
    rm package-lock.json
    print_success "package-lock.json removido"
else
    print_warning "package-lock.json não encontrado"
fi
echo ""

# Permissões
print_step "Configurando permissões de execução..."
chmod 777 deploy.sh
check_status "Permissões configuradas"
echo ""

# Limpeza de cache de memória
print_step "Limpando cache de memória do sistema..."
print_warning "Esta operação requer privilégios de root..."

if [ "$EUID" -eq 0 ]; then
    echo 3 > /proc/sys/vm/drop_caches
    swapoff -a && swapon -a
    check_status "Cache de memória e swap limpos"
else
    su -c "echo 3 >'/proc/sys/vm/drop_caches' && swapoff -a && swapon -a" root 2>/dev/null || {
        print_warning "Falha ao limpar cache - continuando sem privilégios root"
    }
fi
echo ""

# Instalação de dependências
print_step "Instalando dependências..."
npm install --silent
check_status "Dependências instaladas"
echo ""

# Inicialização dos serviços
print_header "INICIANDO SERVIÇOS"
echo ""

print_step "Iniciando Sabercon Frontend..."
pm2 start npm --name "PortalServerFrontend" -- run dev --exp-backoff-restart-delay=100 --stop-exit-codes 0
check_status "Frontend iniciado com sucesso"

print_step "Aguardando 3 segundos..."
sleep 3
print_success "Intervalo concluído"

print_step "Iniciando Sabercon Backend..."
cd backend
pm2 start npm --name "PortalServerBackend" -- run dev --exp-backoff-restart-delay=100 --stop-exit-codes 0
check_status "Backend iniciado com sucesso"
echo ""
cd ..

# Verificação final
print_step "Verificando status dos serviços..."
pm2 list
echo ""

# Resultados finais
print_header "DEPLOY CONCLUÍDO COM SUCESSO"
echo ""
print_success "🎉 Deploy realizado com sucesso!"
print_info "📊 Status dos serviços: pm2 list"
print_info "📝 Logs Frontend: pm2 logs PortalServerFrontend"
print_info "📝 Logs Backend: pm2 logs PortalServerBackend"
print_info "🔄 Restart serviço: pm2 restart [nome-do-serviço]"
print_info "⏹️  Parar serviços: pm2 stop all"
echo ""
print_success "✨ Portal Sabercon está online e funcionando!"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"   




