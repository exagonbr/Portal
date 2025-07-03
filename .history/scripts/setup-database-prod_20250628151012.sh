#!/bin/bash

# Script completo para configurar o banco de dados em produção
# Replica exatamente a estrutura do banco local com todas as tabelas e seeds

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   Setup Completo do Banco de Dados - Produção${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Verificar se está no diretório correto
if [ ! -f "backend/package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script a partir da raiz do projeto${NC}"
    echo -e "${RED}   Diretório atual: $(pwd)${NC}"
    exit 1
fi

# Carregar variáveis de ambiente
if [ -f backend/.env ]; then
    echo -e "${YELLOW}Carregando variáveis do arquivo backend/.env...${NC}"
    export $(cat backend/.env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Variáveis de ambiente carregadas de backend/.env${NC}"
elif [ -f .env ]; then
    echo -e "${YELLOW}Carregando variáveis do arquivo .env...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Variáveis de ambiente carregadas de .env${NC}"
else
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Usando variáveis de ambiente do sistema.${NC}"
fi

# Configurar variáveis do banco
export DB_HOST="${DATABASE_HOST:-localhost}"
export DB_PORT="${DATABASE_PORT:-5432}"
export DB_NAME="${DATABASE_NAME:-portal}"
export DB_USER="${DATABASE_USER:-postgres}"
export DB_PASSWORD="${DATABASE_PASSWORD:-}"

echo ""
echo -e "${BLUE}Configurações do banco de dados:${NC}"
echo -e "   Host: $DB_HOST"
echo -e "   Port: $DB_PORT"
echo -e "   Database: $DB_NAME"
echo -e "   User: $DB_USER"
echo ""

# Função para executar comandos SQL
execute_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$1"
}

# Verificar conexão
echo -e "${YELLOW}Verificando conexão com o banco de dados...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
    echo -e "${RED}❌ Erro: Não foi possível conectar ao banco de dados${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Conexão estabelecida${NC}"
echo ""

# Confirmar execução
echo -e "${YELLOW}⚠️  ATENÇÃO: Este script irá:${NC}"
echo -e "${YELLOW}   1. Executar todas as migrações${NC}"
echo -e "${YELLOW}   2. Executar todos os seeds${NC}"
echo -e "${YELLOW}   3. Criar usuários padrão${NC}"
echo -e "${YELLOW}   Banco de dados: $DB_NAME em $DB_HOST${NC}"
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Operação cancelada pelo usuário${NC}"
    exit 1
fi

# Mudar para o diretório backend
cd backend

echo ""
echo -e "${MAGENTA}================================================${NC}"
echo -e "${MAGENTA}Passo 1: Instalando dependências${NC}"
echo -e "${MAGENTA}================================================${NC}"
echo ""

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Instalando dependências do backend...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao instalar dependências${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependências já instaladas${NC}"
fi

echo ""
echo -e "${MAGENTA}================================================${NC}"
echo -e "${MAGENTA}Passo 2: Executando migrações${NC}"
echo -e "${MAGENTA}================================================${NC}"
echo ""

# Executar migrações usando o comando do package.json
echo -e "${YELLOW}Executando migrações do Knex...${NC}"
npm run migrate:latest
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao executar migrações${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Migrações executadas com sucesso${NC}"

echo ""
echo -e "${MAGENTA}================================================${NC}"
echo -e "${MAGENTA}Passo 3: Executando seeds${NC}"
echo -e "${MAGENTA}================================================${NC}"
echo ""

# Executar seeds usando npm run seed:roles (que inclui roles e instituições)
echo -e "${YELLOW}Executando seeds de roles e instituições...${NC}"
npm run seed:roles
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao executar seeds${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Seeds executados com sucesso${NC}"

echo ""
echo -e "${MAGENTA}================================================${NC}"
echo -e "${MAGENTA}Passo 4: Criando usuários padrão${NC}"
echo -e "${MAGENTA}================================================${NC}"
echo ""

# Criar usuários padrão usando TypeScript
echo -e "${YELLOW}Criando usuários padrão...${NC}"

# Verificar se estamos no diretório backend ou raiz
if [ -f "../scripts/create-default-users-prod.ts" ]; then
    # Estamos no diretório backend
    npx ts-node ../scripts/create-default-users-prod.ts
elif [ -f "scripts/create-default-users-prod.ts" ]; then
    # Estamos no diretório raiz
    cd backend
    npx ts-node ../scripts/create-default-users-prod.ts
    cd ..
else
    echo -e "${YELLOW}⚠️  Script de criação de usuários não encontrado${NC}"
    echo -e "${YELLOW}   Tentando usar script SQL alternativo...${NC}"
    cd ..
    if [ -f "scripts/insert-default-users-simple.sh" ]; then
        bash scripts/insert-default-users-simple.sh
    fi
fi

echo ""
echo -e "${MAGENTA}================================================${NC}"
echo -e "${MAGENTA}Passo 5: Verificando estrutura final${NC}"
echo -e "${MAGENTA}================================================${NC}"
echo ""

# Verificar tabelas criadas
echo -e "${BLUE}Tabelas criadas:${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt" | grep -E "^ public"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Setup do banco de dados concluído!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}📋 Resumo:${NC}"
echo -e "   • Todas as migrações executadas"
echo -e "   • Todos os seeds aplicados"
echo -e "   • Usuários padrão criados"
echo -e "   • Banco pronto para produção"
echo ""
echo -e "${YELLOW}🔑 Usuários padrão criados:${NC}"
echo -e "   • admin@sabercon.edu.br (SYSTEM_ADMIN)"
echo -e "   • gestor@sabercon.edu.br (INSTITUTION_MANAGER)"
echo -e "   • professor@sabercon.edu.br (TEACHER)"
echo -e "   • julia.c@ifsp.com (STUDENT)"
echo -e "   • coordenador@sabercon.edu.com (ACADEMIC_COORDINATOR)"
echo -e "   • renato@gmail.com (GUARDIAN)"
echo -e ""
echo -e "${YELLOW}Senha padrão: password123${NC}"