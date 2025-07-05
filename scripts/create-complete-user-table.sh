#!/bin/bash

# Script para criar tabela user completa com estrutura MySQL + campos Google OAuth
# Autor: Portal Sabercon
# Data: $(date)

echo "🚀 CRIANDO ESTRUTURA COMPLETA DA TABELA USER"
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
if [ ! -f "backend/scripts/create-complete-user-table.js" ]; then
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
if [ ! -f "knexfile.js" ]; then
    log_error "Arquivo knexfile.js não encontrado. Configure o banco de dados primeiro."
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f "../.env" ] && [ ! -f ".env" ]; then
    log_warning "Arquivo .env não encontrado. Certifique-se de que as variáveis de ambiente estão configuradas."
fi

log_info "Executando script de criação da tabela user..."
echo ""

# Executar o script JavaScript
node scripts/create-complete-user-table.js

# Verificar se o script foi executado com sucesso
if [ $? -eq 0 ]; then
    echo ""
    log_success "Script executado com sucesso!"
    echo ""
    echo "🎉 TABELA USER CRIADA COM SUCESSO!"
    echo "=================================="
    echo ""
    echo "📋 O que foi criado:"
    echo "   • Tabela 'user' com estrutura completa do MySQL"
    echo "   • Campos OAuth Google adicionados"
    echo "   • Índices otimizados para performance"
    echo "   • Usuários padrão do sistema"
    echo ""
    echo "👥 Usuários criados (senha: password):"
    echo "   • admin@sabercon.edu.br (Administrador)"
    echo "   • gestor@sabercon.edu.br (Gestor)"
    echo "   • coordenador@sabercon.edu.br (Coordenador)"
    echo "   • professor@sabercon.edu.br (Professor)"
    echo "   • julia.c@ifsp.com (Aluna)"
    echo "   • renato@gmail.com (Responsável)"
    echo ""
    echo "💡 Próximos passos:"
    echo "   • Reinicie sua aplicação"
    echo "   • Teste o login com os usuários criados"
    echo "   • Configure OAuth Google se necessário"
    echo ""
else
    echo ""
    log_error "Erro ao executar o script!"
    echo ""
    echo "🔧 Possíveis soluções:"
    echo "   • Verifique se o PostgreSQL está rodando"
    echo "   • Verifique as credenciais do banco de dados"
    echo "   • Verifique se o arquivo .env está configurado"
    echo "   • Verifique os logs acima para mais detalhes"
    echo ""
    exit 1
fi

# Voltar ao diretório raiz
cd ..

echo "🏁 Processo finalizado!"
echo "" 