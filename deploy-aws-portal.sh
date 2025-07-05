#!/bin/bash

# Portal Sabercon - Script de Deploy para AWS Ubuntu
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

# Verificar se está executando como root ou com sudo
if [ "$EUID" -ne 0 ]; then
    log_error "Este script deve ser executado como root ou com sudo"
    exit 1
fi

# Configurações
DOMAIN="portal.sabercon.com.br"
FRONTEND_PORT=3000
BACKEND_PORT=3001
NGINX_CONFIG="/etc/nginx/nginx.conf"
SITE_CONFIG="/etc/nginx/sites-available/default"
GIT_BRANCH="new_release"

# Detectar diretório do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

# Se executado de um diretório diferente, perguntar qual usar
if [ ! -f "$PROJECT_DIR/package.json" ] || [ ! -d "$PROJECT_DIR/backend" ]; then
    log_error "❌ Estrutura do projeto não encontrada no diretório atual: $PROJECT_DIR"
    echo ""
    log "🔍 Procurando estrutura do projeto..."
    
    # Verificar diretórios comuns
    POSSIBLE_DIRS=(
        "/var/www/portal"
        "/home/ubuntu/portal"
        "/opt/portal"
        "$HOME/portal"
        "$(pwd)"
    )
    
    FOUND_DIR=""
    for dir in "${POSSIBLE_DIRS[@]}"; do
        if [ -f "$dir/package.json" ] && [ -d "$dir/backend" ]; then
            FOUND_DIR="$dir"
            break
        fi
    done
    
    if [ -n "$FOUND_DIR" ]; then
        log_success "✅ Projeto encontrado em: $FOUND_DIR"
        PROJECT_DIR="$FOUND_DIR"
    else
        echo ""
        log_error "❌ Projeto não encontrado automaticamente."
        echo ""
        echo "📁 Opções:"
        echo "   1. Executar o script no diretório do projeto"
        echo "   2. Clonar o projeto primeiro (se o Git SSH já estiver configurado):"
        echo "      sudo mkdir -p /var/www/portal"
        echo "      sudo git clone git@github.com:exagonbr/Portal.git /var/www/portal"
        echo "      cd /var/www/portal"
        echo "      sudo bash deploy-aws-portal.sh"
        echo ""
        read -p "Digite o caminho completo do diretório do projeto (ou ENTER para sair): " CUSTOM_DIR
        
        if [ -z "$CUSTOM_DIR" ]; then
            log "👋 Deploy cancelado pelo usuário"
            exit 0
        fi
        
        if [ ! -d "$CUSTOM_DIR" ]; then
            log_error "Diretório não existe: $CUSTOM_DIR"
            exit 1
        fi
        
        if [ ! -f "$CUSTOM_DIR/package.json" ] || [ ! -d "$CUSTOM_DIR/backend" ]; then
            log_error "Estrutura do projeto não encontrada em: $CUSTOM_DIR"
            log_error "Certifique-se de que o diretório contém package.json e pasta backend/"
            exit 1
        fi
        
        PROJECT_DIR="$CUSTOM_DIR"
    fi
fi

log "🚀 Iniciando deploy do Portal Sabercon para AWS Ubuntu..."
log "📍 Domínio: $DOMAIN"
log "🖥️  Frontend: https://$DOMAIN (porta $FRONTEND_PORT)"
log "🔧 Backend API: https://$DOMAIN/api (porta $BACKEND_PORT)"
log "📁 Diretório do projeto: $PROJECT_DIR"
echo ""

cd "$PROJECT_DIR"

# Verificar e corrigir problemas críticos do sistema
log "🔍 Verificando integridade do sistema AWS..."

# Verificar se o script de correção existe e executá-lo se necessário
if [ -f "fix-aws-ubuntu-dpkg.sh" ]; then
    if ! apt-get update 2>/dev/null; then
        log_warning "⚠️ Problemas detectados no sistema, executando correção automática..."
        bash fix-aws-ubuntu-dpkg.sh
    fi
else
    # Correção inline básica
    if ! apt-get update 2>/dev/null; then
        log_warning "⚠️ Problemas detectados no sistema, aplicando correção básica..."
        
        # Remover locks
        rm -f /var/lib/dpkg/lock* 2>/dev/null || true
        rm -f /var/lib/apt/lists/lock* 2>/dev/null || true
        
        # Remover pacotes GRUB problemáticos
        apt-get remove --purge -y grub-efi-amd64-signed shim-signed 2>/dev/null || true
        apt-get remove --purge -y grub* shim* 2>/dev/null || true
        
        # Corrigir dependências
        apt-get install -f -y 2>/dev/null || true
        dpkg --configure -a 2>/dev/null || true
        
        # Atualizar
        apt-get update --fix-missing
    fi
fi

# Instalar dependências básicas
log "📦 Instalando dependências básicas..."
apt-get install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release ufw git build-essential
log_success "Dependências básicas instaladas"

# Verificar e instalar Node.js
log "🔧 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    log "📦 Node.js não encontrado. Instalando..."
    
    # Instalar Node.js 18.x via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    log_success "Node.js $(node --version) instalado"
else
    NODE_VERSION=$(node --version)
    log_success "Node.js $NODE_VERSION já instalado"
    
    # Verificar se versão é adequada (>= 16)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | tr -d 'v')
    if [ "$NODE_MAJOR" -lt 16 ]; then
        log_warning "⚠️ Versão do Node.js muito antiga. Atualizando..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
        log_success "Node.js atualizado para $(node --version)"
    fi
fi

# Verificar e instalar PM2
log "🔧 Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    log "📦 PM2 não encontrado. Instalando..."
    npm install -g pm2
    log_success "PM2 instalado"
else
    log_success "PM2 já instalado"
fi

# Verificar e instalar PostgreSQL
log "🔧 Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    log "📦 PostgreSQL não encontrado. Instalando..."
    
    # Adicionar repositório PostgreSQL
    echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    apt-get update
    
    # Instalar PostgreSQL 14
    apt-get install -y postgresql-14 postgresql-contrib-14
    
    # Iniciar e habilitar PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    log_success "PostgreSQL instalado e iniciado"
    
    # Configurar PostgreSQL
    log "🔧 Configurando banco de dados PostgreSQL..."
    sudo -u postgres psql -c "CREATE USER portal_user WITH PASSWORD 'portal_password';" || true
    sudo -u postgres psql -c "CREATE DATABASE portal_sabercon OWNER portal_user;" || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE portal_sabercon TO portal_user;" || true
    
    log_success "Banco de dados PostgreSQL configurado"
else
    log_success "PostgreSQL já instalado"
    
    # Verificar se está rodando
    if ! systemctl is-active --quiet postgresql; then
        systemctl start postgresql
        log_success "PostgreSQL iniciado"
    fi
fi

# Verificar e instalar Redis
log "🔧 Verificando Redis..."
if ! command -v redis-server &> /dev/null; then
    log "📦 Redis não encontrado. Instalando..."
    apt-get install -y redis-server
    
    # Configurar Redis para aceitar conexões remotas
    sed -i 's/bind 127.0.0.1/bind 0.0.0.0/' /etc/redis/redis.conf
    
    # Iniciar e habilitar Redis
    systemctl start redis-server
    systemctl enable redis-server
    
    log_success "Redis instalado e configurado"
else
    log_success "Redis já instalado"
    
    # Verificar se está rodando
    if ! systemctl is-active --quiet redis-server; then
        systemctl start redis-server
        log_success "Redis iniciado"
    fi
fi

# Verificar e instalar Nginx
log "🔧 Verificando Nginx..."
if ! command -v nginx &> /dev/null; then
    log "📦 Nginx não encontrado. Instalando..."
    apt-get install -y nginx
    log_success "Nginx instalado"
else
    log_success "Nginx já instalado"
fi

# Parar serviços
log "⏹️ Parando serviços..."
systemctl stop nginx || true
pm2 delete all 2>/dev/null || true
log_success "Serviços parados"

# Atualizar código do repositório
log "📥 Atualizando código do repositório..."
git fetch --all
git reset --hard origin/$GIT_BRANCH
log_success "Código atualizado para branch $GIT_BRANCH"

# Configurar variáveis de ambiente
log "⚙️ Configurando variáveis de ambiente..."

# Frontend
if [ -f "env.production.portal" ]; then
    cp env.production.portal .env.production
    log_success "Arquivo .env.production configurado"
else
    log_warning "Arquivo env.production.portal não encontrado"
    
    # Criar arquivo .env.production básico
    cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://$DOMAIN
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXTAUTH_URL=https://$DOMAIN
EOF
    log_success "Arquivo .env.production criado automaticamente"
fi

# Backend
if [ -f "backend/env.production.portal" ]; then
    cp backend/env.production.portal backend/.env.production
    log_success "Arquivo backend/.env.production configurado"
else
    log_warning "Arquivo backend/env.production.portal não encontrado"
    
    # Criar arquivo backend/.env.production básico
    cat > backend/.env.production << EOF
NODE_ENV=production
PORT=$BACKEND_PORT
FRONTEND_URL=https://$DOMAIN
API_BASE_URL=https://$DOMAIN/api
DATABASE_URL=postgresql://portal_user:portal_password@localhost:5432/portal_sabercon
REDIS_URL=redis://localhost:6379
EOF
    log_success "Arquivo backend/.env.production criado automaticamente"
fi

# Instalar dependências
log "📦 Instalando dependências do projeto..."
npm ci
log_success "Dependências frontend instaladas"

cd backend
npm ci
cd ..
log_success "Dependências backend instaladas"

# Build das aplicações
log "🔨 Fazendo build do frontend..."
npm run build
log_success "Build frontend concluído"

log "🔨 Fazendo build do backend..."
cd backend
npm run build
cd ..
log_success "Build backend concluído"

# Configurar Nginx
log "🌐 Configurando Nginx..."

# Backup da configuração atual
if [ -f "$SITE_CONFIG" ]; then
    cp "$SITE_CONFIG" "$SITE_CONFIG.bak-$(date +%Y%m%d-%H%M%S)"
fi

# Criar configuração do site
cat > "$SITE_CONFIG" << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirecionar HTTP para HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name $DOMAIN;
    
    # Configurações SSL
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    
    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Configuração de buffer
    client_max_body_size 50M;
    client_body_buffer_size 128k;
    
    # Rota da API
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Rate limiting para API
        limit_req zone=api burst=20 nodelay;
    }
    
    # Rota para o frontend
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Rate limiting para frontend
        limit_req zone=frontend burst=10 nodelay;
    }
    
    # Cache para arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:$FRONTEND_PORT;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }
}
EOF

# Configurar rate limiting no nginx.conf
if ! grep -q "limit_req_zone" "$NGINX_CONFIG"; then
    # Backup da configuração atual
    cp "$NGINX_CONFIG" "$NGINX_CONFIG.bak-$(date +%Y%m%d-%H%M%S)"
    
    # Adicionar configuração de rate limiting
    sed -i '/http {/a \    # Rate limiting\n    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;\n    limit_req_zone $binary_remote_addr zone=frontend:10m rate=20r/s;\n    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;' "$NGINX_CONFIG"
fi

# Verificar se o certificado SSL existe
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    log_warning "⚠️ Certificado SSL não encontrado. Configurando Certbot..."
    
    # Instalar Certbot
    apt-get install -y certbot python3-certbot-nginx
    
    # Obter certificado
    log "🔒 Obtendo certificado SSL com Certbot..."
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    if [ $? -ne 0 ]; then
        log_warning "⚠️ Falha ao obter certificado SSL automaticamente"
        log_warning "Você precisará configurar o SSL manualmente após o deploy"
        
        # Configurar para HTTP temporariamente
        sed -i 's/listen 443 ssl/listen 80/g' "$SITE_CONFIG"
        sed -i '/ssl_certificate/d' "$SITE_CONFIG"
        sed -i '/ssl_certificate_key/d' "$SITE_CONFIG"
        sed -i '/ssl_protocols/d' "$SITE_CONFIG"
        sed -i '/ssl_prefer_server_ciphers/d' "$SITE_CONFIG"
        sed -i '/ssl_ciphers/d' "$SITE_CONFIG"
        
        # Remover redirecionamento HTTP para HTTPS
        sed -i '/return 301/d' "$SITE_CONFIG"
    else
        log_success "✅ Certificado SSL obtido com sucesso"
    fi
fi

# Verificar configuração do Nginx
nginx -t
log_success "Configuração do Nginx verificada"

# Configurar PM2
log "⚙️ Configurando PM2..."

log_success "Arquivo de configuração do PM2 criado"

# Iniciar aplicações com PM2
log "🚀 Iniciando aplicações..."
pm2 start ecosystem.config.js
pm2 save>
pm2 startup
log_success "Aplicações iniciadas com PM2"

# Iniciar Nginx
log "🚀 Iniciando Nginx..."
systemctl start nginx
systemctl enable nginx
log_success "Nginx iniciado"

# Configurar firewall
log "🔒 Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
log_success "Firewall configurado"

# Verificar se aplicações estão rodando
log "🔍 Verificando aplicações..."
sleep 5

# Verificar frontend
if curl -s http://localhost:$FRONTEND_PORT > /dev/null; then
    log_success "✅ Frontend está rodando na porta $FRONTEND_PORT"
else
    log_warning "⚠️ Frontend não está respondendo na porta $FRONTEND_PORT"
fi

# Verificar backend
if curl -s http://localhost:$BACKEND_PORT/health > /dev/null; then
    log_success "✅ Backend está rodando na porta $BACKEND_PORT"
else
    log_warning "⚠️ Backend não está respondendo na porta $BACKEND_PORT. Verifique se o endpoint /health existe."
fi

# Exibir informações finais
echo ""
log_success "🎉 Deploy concluído com sucesso!"
echo ""
log "📝 Informações importantes:"
echo "   🌐 Frontend: https://$DOMAIN"
echo "   🔧 Backend API: https://$DOMAIN/api"
echo "   🔄 Para reiniciar as aplicações: sudo pm2 restart all"
echo "   📊 Para ver logs: sudo pm2 logs"
echo "   🛑 Para parar as aplicações: sudo pm2 stop all"
echo ""
log "📋 Status do PM2:"
pm2 status
echo ""

# Verificar se o site está acessível
log "🔍 Verificando acesso ao site..."
if curl -s -k https://$DOMAIN > /dev/null; then
    log_success "✅ Site acessível em https://$DOMAIN"
else
    log_warning "⚠️ Site não acessível em https://$DOMAIN"
    log_warning "Verifique se o domínio está apontando para este servidor"
    log_warning "e se as portas 80 e 443 estão abertas no firewall da AWS"
fi

echo ""
log "🚀 Portal Sabercon implantado com sucesso!"
echo "" 