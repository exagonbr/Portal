#!/bin/bash

# Script para executar migração dos dados legados SaberCon → PostgreSQL
# Autor: Portal Sabercon Team
# Data: Janeiro 2025

echo "🚀 MIGRAÇÃO DE DADOS LEGADOS SABERCON → POSTGRESQL"
echo "=================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}📋 $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -d "backend" ]; then
    log_error "Este script deve ser executado na raiz do projeto Portal"
    exit 1
fi

log_info "Verificando estrutura do projeto..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    log_error "Node.js não está instalado. Por favor, instale Node.js primeiro."
    exit 1
fi

log_success "Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    log_error "npm não está instalado. Por favor, instale npm primeiro."
    exit 1
fi

log_success "npm encontrado: $(npm --version)"

# Verificar se PostgreSQL está rodando (Windows)
if command -v pg_isready &> /dev/null; then
    if pg_isready &> /dev/null; then
        log_success "PostgreSQL está rodando"
    else
        log_warning "PostgreSQL pode não estar rodando. Verifique a conexão."
    fi
else
    log_warning "pg_isready não encontrado. Assumindo que PostgreSQL está rodando."
fi

# Entrar no diretório backend
cd backend

log_info "Verificando dependências do backend..."

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        log_error "Falha na instalação das dependências"
        exit 1
    fi
    log_success "Dependências instaladas com sucesso"
else
    log_success "Dependências já instaladas"
fi

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    log_warning "Arquivo .env não encontrado. Criando exemplo..."
    cat > .env << EOL
# Configuração do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=postgres
DB_PASSWORD=root
DB_SSL=false

# Outras configurações
NODE_ENV=development
JWT_SECRET=seu_jwt_secret_aqui
EOL
    log_warning "Arquivo .env criado. Por favor, configure suas credenciais do banco."
    read -p "Pressione Enter para continuar após configurar o .env..."
fi

log_info "Iniciando migração dos dados legados..."
echo ""

# Executar o script de migração
npm run migrate:legados

# Verificar resultado
if [ $? -eq 0 ]; then
    echo ""
    log_success "🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!"
    echo ""
    log_info "Próximos passos:"
    echo "1. Verifique o relatório de migração gerado"
    echo "2. Teste a aplicação com os dados migrados"
    echo "3. Configure backup do banco de dados"
    echo ""
    log_info "Para verificar os dados migrados, execute:"
    echo "psql -d portal_sabercon -c \"SELECT 'users', COUNT(*) FROM users UNION ALL SELECT 'videos', COUNT(*) FROM videos;\""
else
    echo ""
    log_error "❌ FALHA NA MIGRAÇÃO"
    echo ""
    log_info "Para diagnosticar o problema:"
    echo "1. Verifique o relatório de migração gerado"
    echo "2. Confira as configurações do banco no .env"
    echo "3. Certifique-se que a pasta de dumps existe:"
    echo "   C:\\Users\\estev\\OneDrive\\Documentos\\dumps\\Dump20250601"
    echo ""
    exit 1
fi

echo ""
log_info "Para mais informações, consulte o arquivo GUIA_MIGRACAO_POSTGRESQL.md"
echo "" 