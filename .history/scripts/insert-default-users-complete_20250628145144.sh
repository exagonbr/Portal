#!/bin/bash

# Script completo para inserir usuários padrão com todas as verificações e correções
# Este script executa todos os passos necessários em sequência

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   Instalação Completa de Usuários Padrão${NC}"
echo -e "${CYAN}================================================${NC}"
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

# Verificar se os scripts existem
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "$SCRIPT_DIR/check-db-structure.sh" ] || [ ! -f "$SCRIPT_DIR/fix-user-table.sh" ] || [ ! -f "$SCRIPT_DIR/insert-default-users.sh" ]; then
    echo -e "${RED}❌ Erro: Scripts necessários não encontrados${NC}"
    echo -e "${RED}   Certifique-se de que todos os scripts estão no diretório: $SCRIPT_DIR${NC}"
    exit 1
fi

# Tornar scripts executáveis
chmod +x "$SCRIPT_DIR"/*.sh 2>/dev/null

# Confirmar execução
echo -e "${YELLOW}⚠️  ATENÇÃO: Este script irá:${NC}"
echo -e "${YELLOW}   1. Verificar a estrutura do banco de dados${NC}"
echo -e "${YELLOW}   2. Corrigir problemas na tabela 'user' (se necessário)${NC}"
echo -e "${YELLOW}   3. Criar/atualizar usuários padrão${NC}"
echo -e "${YELLOW}   Banco de dados: $DB_NAME em $DB_HOST${NC}"
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Operação cancelada pelo usuário${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Passo 1: Verificando estrutura do banco${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Executar verificação de estrutura
"$SCRIPT_DIR/check-db-structure.sh"

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Passo 2: Corrigindo tabela 'user' (se necessário)${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Perguntar se deseja executar correções
read -p "Deseja executar correções na tabela 'user'? (s/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    "$SCRIPT_DIR/fix-user-table.sh"
else
    echo -e "${YELLOW}Pulando correções da tabela 'user'${NC}"
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Passo 3: Inserindo usuários padrão${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Executar inserção de usuários
"$SCRIPT_DIR/insert-default-users.sh"

# Verificar status de saída
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}✅ Instalação completa concluída com sucesso!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "${BLUE}📋 Resumo dos usuários criados:${NC}"
    echo -e "   ${CYAN}admin@sabercon.edu.br${NC} - SYSTEM_ADMIN"
    echo -e "   ${CYAN}gestor@sabercon.edu.br${NC} - INSTITUTION_MANAGER"
    echo -e "   ${CYAN}professor@sabercon.edu.br${NC} - TEACHER"
    echo -e "   ${CYAN}julia.c@ifsp.com${NC} - STUDENT"
    echo -e "   ${CYAN}coordenador@sabercon.edu.com${NC} - ACADEMIC_COORDINATOR"
    echo -e "   ${CYAN}renato@gmail.com${NC} - GUARDIAN"
    echo ""
    echo -e "${YELLOW}🔑 Senha padrão: password123${NC}"
    echo -e "${YELLOW}⚠️  Lembre-se de alterar as senhas após o primeiro login!${NC}"
else
    echo ""
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}❌ Erro durante a execução${NC}"
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}Verifique os logs acima para mais detalhes${NC}"
    exit 1
fi