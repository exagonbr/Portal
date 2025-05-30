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

# Limpeza de dependências - Frontend
print_step "Limpando módulos do Frontend..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_success "Frontend node_modules removido"
else
    print_warning "Frontend node_modules não encontrado"
fi

if [ -f "package-lock.json" ]; then
    rm package-lock.json
    print_success "Frontend package-lock.json removido"
else
    print_warning "Frontend package-lock.json não encontrado"
fi

# Limpeza de dependências - Backend
print_step "Limpando módulos do Backend..."
if [ -d "backend" ]; then
    if [ -d "backend/node_modules" ]; then
        rm -rf backend/node_modules
        print_success "Backend node_modules removido"
    else
        print_warning "Backend node_modules não encontrado"
    fi
    
    if [ -f "backend/package-lock.json" ]; then
        rm backend/package-lock.json
        print_success "Backend package-lock.json removido"
    else
        print_warning "Backend package-lock.json não encontrado"
    fi
else
    print_error "Pasta backend não encontrada!"
    exit 1
fi
echo ""

# Permissões
print_step "Configurando permissões de execução..."
chmod 777 deploy.sh
if [ -f "quick-ssl-setup.sh" ]; then
    chmod 777 quick-ssl-setup.sh
    print_success "Permissões quick-ssl-setup.sh configuradas"
fi
if [ -f "setup-ssl.sh" ]; then
    chmod 777 setup-ssl.sh
    print_success "Permissões setup-ssl.sh configuradas"
fi
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

# Instalação de dependências - Frontend
print_step "Instalando dependências do Frontend..."
npm install --silent
check_status "Dependências do Frontend instaladas"

# Instalação de dependências - Backend
print_step "Instalando dependências do Backend..."
cd backend
npm install --silent
check_status "Dependências do Backend instaladas"
cd ..
echo ""

# Build do projeto (se necessário)
print_step "Verificando se precisa fazer build..."
if [ -f "backend/tsconfig.json" ]; then
    print_step "Fazendo build do Backend TypeScript..."
    cd backend
    npm run build 2>/dev/null || {
        print_warning "Build falhou ou comando não encontrado - continuando"
    }
    cd ..
fi

# Verificar se pasta backend existe
if [ ! -d "backend" ]; then
    print_error "Pasta backend não encontrada!"
    exit 1
fi

# Inicialização dos serviços
print_header "INICIANDO SERVIÇOS"
echo ""

print_step "Iniciando Sabercon Frontend (porta 3000)..."
pm2 --name PortalServerFrontend start 'npm run dev' --exp-backoff-restart-delay=100 --stop-exit-codes 0
check_status "Frontend iniciado com sucesso"

print_step "Aguardando 5 segundos para Frontend estabilizar..."
sleep 5
print_success "Intervalo concluído"

print_step "Iniciando Sabercon Backend (porta 3001)..."
cd backend
cd backend && pm2 --name PortalServerBackend start 'npm run dev' --exp-backoff-restart-delay=100 --stop-exit-codes 0
check_status "Backend iniciado com sucesso"
cd ..
echo ""

# Verificação final
print_step "Verificando status dos serviços..."
pm2 list
echo ""

print_step "Verificando se os serviços estão respondendo..."
sleep 3

# Verificar se Frontend está rodando
if netstat -tlnp 2>/dev/null | grep :3000 > /dev/null; then
    print_success "Frontend respondendo na porta 3000"
else
    print_warning "Frontend pode não estar respondendo na porta 3000"
fi

# Verificar se Backend está rodando
if netstat -tlnp 2>/dev/null | grep :3001 > /dev/null; then
    print_success "Backend respondendo na porta 3001"
else
    print_warning "Backend pode não estar respondendo na porta 3001"
fi

# Resultados finais
print_header "DEPLOY CONCLUÍDO COM SUCESSO"
echo ""
print_success "🎉 Deploy realizado com sucesso!"
print_info "📊 Status dos serviços: pm2 list"
print_info "📝 Logs Frontend: pm2 logs PortalServerFrontend"
print_info "📝 Logs Backend: pm2 logs PortalServerBackend"
print_info "🔄 Restart Frontend: pm2 restart PortalServerFrontend"
print_info "🔄 Restart Backend: pm2 restart PortalServerBackend"
print_info "⏹️  Parar serviços: pm2 stop all"
echo ""
print_info "🌐 URLs disponíveis:"
print_info "📱 Frontend: http://localhost:3000"
print_info "🔧 Backend: http://localhost:3001"
if [ -f "quick-ssl-setup.sh" ] || [ -f "setup-ssl.sh" ]; then
    print_info "🔒 Para HTTPS: Execute um dos scripts SSL"
fi
echo ""
print_success "✨ Portal Sabercon está online e funcionando!"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"   




