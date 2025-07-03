#!/bin/bash

# Script para corrigir problemas específicos com a tabela 'user'
# Este script adiciona colunas faltantes se necessário

# Configurações do banco de dados
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-portal_sabercon}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-root}"

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
echo -e "${BLUE}   Correção da Tabela 'user'${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar se a tabela 'user' existe
USER_TABLE_EXISTS=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user');" | tr -d ' ')

if [ "$USER_TABLE_EXISTS" != "t" ]; then
    echo -e "${YELLOW}Tabela 'user' não existe. Nada a fazer.${NC}"
    exit 0
fi

echo -e "${YELLOW}Verificando estrutura da tabela 'user'...${NC}"

# Verificar se a coluna 'email' existe
HAS_EMAIL=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'email');" | tr -d ' ')

if [ "$HAS_EMAIL" != "t" ]; then
    echo -e "${YELLOW}Adicionando coluna 'email' à tabela 'user'...${NC}"
    
    # Verificar se existe coluna username
    HAS_USERNAME=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'username');" | tr -d ' ')
    
    if [ "$HAS_USERNAME" = "t" ]; then
        # Se tem username, criar email baseado no username
        execute_sql "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS email VARCHAR(255);"
        execute_sql "UPDATE \"user\" SET email = username WHERE email IS NULL;"
        execute_sql "ALTER TABLE \"user\" ALTER COLUMN email SET NOT NULL;"
        execute_sql "CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON \"user\"(email);"
        echo -e "${GREEN}✅ Coluna 'email' adicionada com sucesso${NC}"
    else
        echo -e "${RED}❌ Não foi possível adicionar coluna 'email' - estrutura da tabela não reconhecida${NC}"
    fi
else
    echo -e "${GREEN}✅ Coluna 'email' já existe${NC}"
fi

# Verificar outras colunas importantes
echo ""
echo -e "${YELLOW}Verificando outras colunas importantes...${NC}"

# Verificar role_id
HAS_ROLE_ID=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'role_id');" | tr -d ' ')
if [ "$HAS_ROLE_ID" != "t" ]; then
    echo -e "${YELLOW}Adicionando coluna 'role_id'...${NC}"
    execute_sql "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS role_id UUID;"
    echo -e "${GREEN}✅ Coluna 'role_id' adicionada${NC}"
fi

# Verificar institution_id
HAS_INSTITUTION_ID=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'institution_id');" | tr -d ' ')
if [ "$HAS_INSTITUTION_ID" != "t" ]; then
    echo -e "${YELLOW}Adicionando coluna 'institution_id'...${NC}"
    execute_sql "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS institution_id VARCHAR(255);"
    echo -e "${GREEN}✅ Coluna 'institution_id' adicionada${NC}"
fi

# Verificar password
HAS_PASSWORD=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'password');" | tr -d ' ')
if [ "$HAS_PASSWORD" != "t" ]; then
    echo -e "${YELLOW}Adicionando coluna 'password'...${NC}"
    execute_sql "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS password VARCHAR(255);"
    echo -e "${GREEN}✅ Coluna 'password' adicionada${NC}"
fi

# Verificar name/full_name
HAS_NAME=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'name');" | tr -d ' ')
HAS_FULL_NAME=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'full_name');" | tr -d ' ')

if [ "$HAS_NAME" != "t" ] && [ "$HAS_FULL_NAME" != "t" ]; then
    echo -e "${YELLOW}Adicionando coluna 'name'...${NC}"
    execute_sql "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS name VARCHAR(255);"
    echo -e "${GREEN}✅ Coluna 'name' adicionada${NC}"
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Verificação concluída!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Mostrar estrutura atual da tabela
echo -e "${BLUE}Estrutura atual da tabela 'user':${NC}"
execute_sql "\d \"user\""