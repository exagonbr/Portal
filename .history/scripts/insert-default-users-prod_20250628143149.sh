#!/bin/bash

# Script wrapper para executar insert-default-users.sh em produção
# Este script carrega as variáveis de ambiente e executa o script principal

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Execução em Produção - Usuários Padrão${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar se o arquivo .env existe
if [ -f .env ]; then
    echo -e "${YELLOW}Carregando variáveis do arquivo .env...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Variáveis de ambiente carregadas${NC}"
else
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo -e "${YELLOW}   Usando variáveis de ambiente do sistema${NC}"
fi

# Configurar variáveis do banco de dados
export DB_HOST="${DATABASE_HOST:-localhost}"
export DB_PORT="${DATABASE_PORT:-5432}"
export DB_NAME="${DATABASE_NAME:-portal_sabercon}"
export DB_USER="${DATABASE_USER:-postgres}"
export DB_PASSWORD="${DATABASE_PASSWORD:-root}"

echo ""
echo -e "${BLUE}Configurações do banco de dados:${NC}"
echo -e "   Host: $DB_HOST"
echo -e "   Port: $DB_PORT"
echo -e "   Database: $DB_NAME"
echo -e "   User: $DB_USER"
echo ""

# Verificar se o script principal existe
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAIN_SCRIPT="$SCRIPT_DIR/insert-default-users.sh"

if [ ! -f "$MAIN_SCRIPT" ]; then
    echo -e "${RED}❌ Erro: Script principal não encontrado em $MAIN_SCRIPT${NC}"
    exit 1
fi

# Tornar o script principal executável
chmod +x "$MAIN_SCRIPT"

# Confirmar execução
echo -e "${YELLOW}⚠️  ATENÇÃO: Este script irá criar/atualizar usuários no banco de produção!${NC}"
echo -e "${YELLOW}   Banco de dados: $DB_NAME em $DB_HOST${NC}"
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Operação cancelada pelo usuário${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Executando script de inserção...${NC}"
echo ""

# Executar o script principal
"$MAIN_SCRIPT"

# Verificar status de saída
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Script executado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro durante a execução do script${NC}"
