#!/bin/bash

# Script para verificar a estrutura das tabelas no banco de dados

# Configurações do banco de dados
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-portal_sabercon}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-root}"

# Cores para output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Verificando Estrutura do Banco de Dados${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Função para executar query
query_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$1"
}

# Verificar tabela institution
echo -e "${YELLOW}Estrutura da tabela 'institution':${NC}"
query_sql "\d institution"
echo ""

# Verificar tabela users
echo -e "${YELLOW}Estrutura da tabela 'users':${NC}"
query_sql "\d users"
echo ""

# Verificar tabela user
echo -e "${YELLOW}Estrutura da tabela 'user':${NC}"
query_sql "\d user"
echo ""

# Verificar tabela roles
echo -e "${YELLOW}Estrutura da tabela 'roles':${NC}"
query_sql "\d roles"
echo ""

# Verificar tabela permissions
echo -e "${YELLOW}Estrutura da tabela 'permissions':${NC}"
query_sql "\d permissions"
echo ""

# Verificar tabela role_permissions
echo -e "${YELLOW}Estrutura da tabela 'role_permissions':${NC}"
query_sql "\d role_permissions"
echo ""

# Listar todas as tabelas
echo -e "${GREEN}Todas as tabelas no banco:${NC}"
query_sql "\dt"