#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===========================================
   SCRIPT DE RESET DO BANCO DE DADOS
==========================================${NC}"

# Configurações do banco
DB_NAME="portal_sabercon"
DB_USER="postgres"
DB_PASS="root"
BACKUP_DIR="database/dumps"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo -e "\n${YELLOW}1. Criando diretório de backup se não existir...${NC}"
mkdir -p $BACKUP_DIR

echo -e "\n${YELLOW}2. Fazendo backup do banco atual (se existir)...${NC}"
if pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE 2>/dev/null; then
    echo -e "${GREEN}✓ Backup criado em $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}! Banco não existe ou erro no backup${NC}"
fi

echo -e "\n${YELLOW}3. Dropando conexões existentes...${NC}"
PGPASSWORD=$DB_PASS psql -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" >/dev/null 2>&1

echo -e "\n${YELLOW}4. Dropando banco de dados se existir...${NC}"
PGPASSWORD=$DB_PASS psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" >/dev/null 2>&1

echo -e "\n${YELLOW}5. Criando banco de dados...${NC}"
if PGPASSWORD=$DB_PASS psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Banco criado com sucesso${NC}"
else
    echo -e "${RED}✗ Erro ao criar banco${NC}"
    exit 1
fi

echo -e "\n${YELLOW}6. Executando migrações...${NC}"
if npx knex migrate:latest; then
    echo -e "${GREEN}✓ Migrações executadas com sucesso${NC}"
else
    echo -e "${RED}✗ Erro ao executar migrações${NC}"
    exit 1
fi

echo -e "\n${YELLOW}7. Executando seeds...${NC}"
if npx knex seed:run --specific=001_test_seed.js; then
    echo -e "${GREEN}✓ Seeds executados com sucesso${NC}"
else
    echo -e "${RED}✗ Erro ao executar seeds${NC}"
    exit 1
fi

echo -e "\n${GREEN}===========================================
   BANCO DE DADOS RESETADO COM SUCESSO!
==========================================${NC}"

echo -e "\n${BLUE}Backup do banco anterior:${NC} $BACKUP_FILE"
echo -e "${BLUE}Banco de dados:${NC} $DB_NAME"
echo -e "${BLUE}Usuário admin:${NC} admin@sabercon.edu.br"
echo -e "${BLUE}Senha:${NC} password123\n"