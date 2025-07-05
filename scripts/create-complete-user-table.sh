#!/bin/bash

# Script para criar usuários padrão na tabela users
# Autor: Portal Sabercon
# Data: $(date)

echo "🚀 CRIANDO USUÁRIOS PADRÃO NA TABELA USERS"
echo "============================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
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

# Verificar se estamos no diretório correto
if [ ! -f "backend/scripts/create-complete-user-table.ts" ]; then
    log_error "Script não encontrado. Execute este comando a partir do diretório raiz do projeto."
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    log_error "Node.js não está instalado. Instale o Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    log_error "npm não está instalado. Instale o npm primeiro."
    exit 1
fi

log_info "Verificando dependências..."

# Entrar no diretório backend
cd backend

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    log_warning "Dependências não encontradas. Instalando..."
    npm install
    if [ $? -ne 0 ]; then
        log_error "Falha ao instalar dependências."
        exit 1
    fi
    log_success "Dependências instaladas com sucesso!"
fi

# Verificar se o arquivo de configuração existe
if [ ! -f "knexfile.js" ] && [ ! -f "knexfile.ts" ]; then
    log_error "Arquivo knexfile.js ou knexfile.ts não encontrado. Configure o banco de dados primeiro."
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f "../.env" ] && [ ! -f ".env" ]; then
    log_warning "Arquivo .env não encontrado. Certifique-se de que as variáveis de ambiente estão configuradas."
fi

log_info "Executando script de criação de usuários..."
echo ""

# Executar o script TypeScript
npx ts-node scripts/create-complete-user-table.ts

# Verificar se o script foi executado com sucesso
if [ $? -eq 0 ]; then
    echo ""
    log_success "Script executado com sucesso!"
    echo ""
    echo "🎉 USUÁRIOS CRIADOS COM SUCESSO!"
    echo "================================"
    echo ""
    echo "📋 O que foi criado:"
    echo "   • Usuários padrão na tabela 'users'"
    echo "   • Roles e permissions já configuradas"
    echo "   • Campos OAuth Google disponíveis"
    echo "   • Relacionamentos com instituições"
    echo ""
    echo "👥 Usuários criados (senha: password):"
    echo "   • admin@sabercon.edu.br (SYSTEM_ADMIN)"
    echo "   • gestor@sabercon.edu.br (INSTITUTION_MANAGER)"
    echo "   • coordenador@sabercon.edu.br (COORDINATOR)"
    echo "   • professor@sabercon.edu.br (TEACHER)"
    echo "   • julia.c@ifsp.com (STUDENT)"
    echo "   • renato@gmail.com (GUARDIAN)"
    echo ""
    echo "🏢 Instituições associadas:"
    echo "   • Portal Sabercon - Sede (ID: 1)"
    echo "   • Instituto Federal de São Paulo - IFSP (ID: 2)"
    echo ""
    echo "🔐 Campos OAuth Google incluídos:"
    echo "   • google_id, google_email, google_name"
    echo "   • google_picture, google_access_token"
    echo "   • google_refresh_token, google_token_expires_at"
    echo "   • is_google_verified, google_linked_at"
    echo ""
    echo "💡 Próximos passos:"
    echo "   • Reinicie sua aplicação"
    echo "   • Teste o login com os usuários criados"
    echo "   • Configure OAuth Google se necessário"
    echo "   • Acesse o sistema com admin@sabercon.edu.br"
    echo ""
else
    echo ""
    log_error "Erro ao executar o script!"
    echo ""
    echo "🔧 Possíveis soluções:"
    echo "   • Verifique se o PostgreSQL está rodando"
    echo "   • Verifique as credenciais do banco de dados"
    echo "   • Verifique se o arquivo .env está configurado"
    echo "   • Execute primeiro: npm run db:fresh"
    echo "   • Verifique os logs acima para mais detalhes"
    echo ""
    exit 1
fi

# Voltar ao diretório raiz
cd ..

echo "🏁 Processo finalizado!"
echo "" 