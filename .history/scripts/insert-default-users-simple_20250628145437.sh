#!/bin/bash

# Script simplificado para inserir usuários padrão apenas na tabela 'users'
# Use este script se a tabela 'user' tiver estrutura incompatível

# Configurações do banco de dados
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-portal}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para executar comandos SQL
execute_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$1"
}

# Função para executar comandos SQL e retornar resultado
query_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "$1"
}

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Script Simplificado - Apenas tabela 'users'${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar conexão com o banco
echo -e "${YELLOW}Verificando conexão com o banco de dados...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
    echo -e "${RED}❌ Erro: Não foi possível conectar ao banco de dados${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Conexão estabelecida com sucesso${NC}"
echo ""

# Verificar se a tabela 'users' existe
USERS_TABLE_EXISTS=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');" | tr -d ' ')

if [ "$USERS_TABLE_EXISTS" != "t" ]; then
    echo -e "${RED}❌ Erro: Tabela 'users' não encontrada${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Tabela 'users' encontrada${NC}"
echo ""

# Hash da senha padrão (password123)
PASSWORD_HASH='$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGSzLmNrJee'

# Criar instituições
echo -e "${YELLOW}Criando instituições...${NC}"

# Sabercon
SABERCON_ID=$(query_sql "
    SELECT id FROM institution WHERE name = 'Sabercon Educação' LIMIT 1;
" | tr -d ' ')

if [ -z "$SABERCON_ID" ]; then
    SABERCON_ID=$(query_sql "
        INSERT INTO institution (
            name, company_name, accountable_name, accountable_contact,
            document, street, district, state, postal_code,
            contract_disabled, contract_term_start, contract_term_end,
            deleted, has_library_platform, has_principal_platform, has_student_platform
        ) VALUES (
            'Sabercon Educação', 'Sabercon Educação LTDA', 'Administrador Sistema', 'admin@sabercon.edu.br',
            '00.000.000/0001-00', 'Rua Principal, 123', 'Centro', 'SP', '00000-000',
            false, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year',
            false, true, true, true
        )
        RETURNING id;
    " | tr -d ' ')
fi

echo -e "${GREEN}✅ Instituição Sabercon (ID: $SABERCON_ID)${NC}"

# IFSP
IFSP_ID=$(query_sql "
    SELECT id FROM institution WHERE name = 'Instituto Federal de São Paulo' LIMIT 1;
" | tr -d ' ')

if [ -z "$IFSP_ID" ]; then
