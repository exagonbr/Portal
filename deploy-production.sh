#!/bin/bash

# Script de Deploy Produção - Portal Sabercon
# Domínio: https://portal.sabercon.com.br
# Frontend: porta 3000 | Backend: porta 3001
# Versão: 3.0 - Produção AWS

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Configurações de Produção
DOMAIN="portal.sabercon.com.br"
FRONTEND_PORT="3000"
BACKEND_PORT="3001"
NODE_ENV="production"

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
print_header "PORTAL SABERCON - DEPLOY PRODUÇÃO AWS"
echo ""
print_info "🌐 Domínio: https://$DOMAIN"
print_info "📱 Frontend: localhost:$FRONTEND_PORT"
print_info "🔧 Backend: localhost:$BACKEND_PORT"
print_info "🏗️  Ambiente: $NODE_ENV"
print_info "⏰ Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Verificar se está rodando como usuário correto
if [ "$EUID" -eq 0 ]; then
    print_warning "Executando como root - recomendado usar usuário específico para aplicação"
fi

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
git reset --hard origin/new_release
check_status "Reset para origin/new_release concluído"
echo ""

# Configurar variáveis de ambiente para produção
print_step "Configurando variáveis de ambiente para produção..."

# Criar/atualizar .env principal
cat > .env << EOF
# Portal Sabercon - Configuração Produção
NODE_ENV=production
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# URLs
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
BACKEND_URL=https://$DOMAIN/api

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=portal_user
DB_PASSWORD=\${DB_PASSWORD:-secure_password_here}
DB_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=\${REDIS_PASSWORD:-}

# JWT
JWT_SECRET=\${JWT_SECRET:-$(openssl rand -base64 64)}
JWT_REFRESH_SECRET=\${JWT_REFRESH_SECRET:-$(openssl rand -base64 64)}

# Email
SMTP_HOST=\${SMTP_HOST:-}
SMTP_PORT=\${SMTP_PORT:-587}
SMTP_USER=\${SMTP_USER:-}
SMTP_PASS=\${SMTP_PASS:-}

# AWS S3 (se usado)
AWS_ACCESS_KEY_ID=\${AWS_ACCESS_KEY_ID:-}
AWS_SECRET_ACCESS_KEY=\${AWS_SECRET_ACCESS_KEY:-}
AWS_REGION=\${AWS_REGION:-us-east-1}
AWS_S3_BUCKET=\${AWS_S3_BUCKET:-}

# Outros
CORS_ORIGIN=https://$DOMAIN
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Criar/atualizar .env do backend
cat > backend/.env << EOF
# Portal Sabercon Backend - Configuração Produção
NODE_ENV=production
PORT=$BACKEND_PORT

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=portal_user
DB_PASSWORD=\${DB_PASSWORD:-secure_password_here}
DB_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=\${REDIS_PASSWORD:-}

# JWT
JWT_SECRET=\${JWT_SECRET:-$(openssl rand -base64 64)}
JWT_REFRESH_SECRET=\${JWT_REFRESH_SECRET:-$(openssl rand -base64 64)}

# CORS
CORS_ORIGIN=https://$DOMAIN

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/backend.log

# Email
SMTP_HOST=\${SMTP_HOST:-}
SMTP_PORT=\${SMTP_PORT:-587}
SMTP_USER=\${SMTP_USER:-}
SMTP_PASS=\${SMTP_PASS:-}

# AWS S3
AWS_ACCESS_KEY_ID=\${AWS_ACCESS_KEY_ID:-}
AWS_SECRET_ACCESS_KEY=\${AWS_SECRET_ACCESS_KEY:-}
AWS_REGION=\${AWS_REGION:-us-east-1}
AWS_S3_BUCKET=\${AWS_S3_BUCKET:-}
EOF

check_status "Variáveis de ambiente configuradas"
echo ""

# Instalar dependências
print_step "Instalando dependências do Frontend..."
npm ci --only=production
check_status "Dependências Frontend instaladas"

print_step "Instalando dependências do Backend..."
cd backend
npm ci --only=production
cd ..
check_status "Dependências Backend instaladas"
echo ""

# Build das aplicações
print_step "Fazendo build do Frontend para produção..."
npm run build
check_status "Build Frontend concluído"

print_step "Fazendo build do Backend para produção..."
cd backend
npm run build
cd ..
check_status "Build Backend concluído"
echo ""

# Executar migrações do banco de dados
print_step "Executando migrações do banco de dados..."
cd backend
npm run migrate 2>/dev/null || true
check_status "Migrações executadas"
cd ..
echo ""

# Configurar permissões
print_step "Configurando permissões de execução..."
chmod +x deploy-production.sh
chmod +x setup-production-aws.sh
if [ -f "quick-ssl-setup.sh" ]; then
    chmod +x quick-ssl-setup.sh
fi
if [ -f "setup-ssl.sh" ]; then
    chmod +x setup-ssl.sh
fi
check_status "Permissões configuradas"
echo ""

# Limpeza de cache e otimizações
print_step "Limpando cache e otimizando sistema..."

# Limpar cache npm
npm cache clean --force 2>/dev/null || true

# Limpar logs antigos
find . -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true

# Limpar cache de memória (se root)
if [ "$EUID" -eq 0 ]; then
    echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
    print_success "Cache de memória limpo"
else
    print_info "Cache de memória não limpo (requer root)"
fi

check_status "Limpeza e otimização concluídas"
echo ""

# Inicialização dos serviços em produção
print_header "INICIANDO SERVIÇOS EM PRODUÇÃO"
echo ""

print_step "Iniciando Frontend em modo produção..."
print_info "Comando: pm2 start npm --name 'PortalServerFrontend' -- start"
pm2 start npm --name "PortalServerFrontend" -- start \
    --exp-backoff-restart-delay=100 \
    --max-restarts=10 \
    --min-uptime=10s
check_status "Frontend iniciado"
echo ""

print_step "Iniciando Backend em modo produção..."
print_info "Comando: cd backend && pm2 start npm --name 'PortalServerBackend' -- start"
cd backend
pm2 start npm --name "PortalServerBackend" -- start \
    --exp-backoff-restart-delay=100 \
    --max-restarts=10 \
    --min-uptime=10s
cd ..
check_status "Backend iniciado"
echo ""

# Configurar PM2 para inicialização automática
print_step "Configurando PM2 para inicialização automática..."
pm2 save
pm2 startup 2>/dev/null || print_info "PM2 startup já configurado ou requer configuração manual"
check_status "PM2 configurado"
echo ""

# Aguardar serviços iniciarem
print_step "Aguardando serviços iniciarem..."
sleep 10

# Verificação dos serviços
print_step "Verificando status dos serviços..."
pm2 list
echo ""

print_step "Verificando se os serviços estão respondendo..."

# Verificar se Frontend está rodando
if netstat -tlnp 2>/dev/null | grep :$FRONTEND_PORT > /dev/null; then
    print_success "Frontend respondendo na porta $FRONTEND_PORT"
    
    # Testar resposta HTTP
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$FRONTEND_PORT | grep -q "200\|301\|302"; then
        print_success "Frontend respondendo HTTP corretamente"
    else
        print_warning "Frontend pode não estar respondendo HTTP corretamente"
    fi
else
    print_warning "Frontend pode não estar respondendo na porta $FRONTEND_PORT"
fi

# Verificar se Backend está rodando
if netstat -tlnp 2>/dev/null | grep :$BACKEND_PORT > /dev/null; then
    print_success "Backend respondendo na porta $BACKEND_PORT"
    
    # Testar resposta HTTP
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/health 2>/dev/null | grep -q "200\|404"; then
        print_success "Backend respondendo HTTP corretamente"
    else
        print_warning "Backend pode não estar respondendo HTTP corretamente"
    fi
else
    print_warning "Backend pode não estar respondendo na porta $BACKEND_PORT"
fi

echo ""

# Verificar se Nginx está configurado
if systemctl is-active --quiet nginx 2>/dev/null; then
    print_success "Nginx está ativo"
    
    # Testar se o domínio está respondendo
    if curl -s -I https://$DOMAIN 2>/dev/null | head -1 | grep -q "200\|301\|302"; then
        print_success "Domínio $DOMAIN respondendo via HTTPS"
    else
        print_warning "Domínio $DOMAIN pode não estar respondendo via HTTPS"
        print_info "Execute: sudo bash setup-production-aws.sh para configurar SSL"
    fi
else
    print_warning "Nginx não está ativo"
    print_info "Execute: sudo bash setup-production-aws.sh para configurar Nginx e SSL"
fi

# Resultados finais
print_header "DEPLOY PRODUÇÃO CONCLUÍDO"
echo ""
print_success "🎉 Deploy em produção realizado com sucesso!"
echo ""
print_info "🌐 URLs disponíveis:"
print_info "📱 Frontend Local:  http://localhost:$FRONTEND_PORT"
print_info "🔧 Backend Local:   http://localhost:$BACKEND_PORT"
print_info "📱 Frontend HTTPS:  https://$DOMAIN/ (se SSL configurado)"
print_info "🔧 Backend HTTPS:   https://$DOMAIN/api/ (se SSL configurado)"
print_info "🏥 Health Check:    https://$DOMAIN/_health (se SSL configurado)"
echo ""
print_info "📋 Comandos úteis:"
print_info "📊 Status PM2:     pm2 list"
print_info "📝 Logs Frontend:  pm2 logs PortalServerFrontend"
print_info "📝 Logs Backend:   pm2 logs PortalServerBackend"
print_info "🔄 Restart Front:  pm2 restart PortalServerFrontend"
print_info "🔄 Restart Back:   pm2 restart PortalServerBackend"
print_info "⏹️  Parar tudo:     pm2 stop all"
print_info "🗑️  Deletar tudo:   pm2 delete all"
print_info "💾 Salvar PM2:     pm2 save"
echo ""
print_info "🔧 Configuração SSL:"
print_info "🔒 Configurar SSL: sudo bash setup-production-aws.sh"
print_info "📊 Monitor:        /root/monitor-portal.sh (após SSL)"
echo ""
print_warning "⚠️  Próximos passos:"
print_warning "   1. Configure o DNS para apontar $DOMAIN para este servidor"
print_warning "   2. Execute: sudo bash setup-production-aws.sh (para SSL)"
print_warning "   3. Verifique se o banco de dados está configurado"
print_warning "   4. Configure as variáveis de ambiente sensíveis"
print_warning "   5. Teste todas as funcionalidades"
echo ""
print_success "✨ Portal Sabercon está rodando em modo produção!"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" 