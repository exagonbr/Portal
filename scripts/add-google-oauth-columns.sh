#!/bin/bash

# Script para adicionar colunas OAuth do Google às tabelas de usuários existentes
# 
# Este script resolve o erro:
# "column User.google_id does not exist"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Adicionar Colunas OAuth Google${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

echo -e "${YELLOW}🔧 Este script adiciona colunas OAuth do Google às tabelas:${NC}"
echo -e "   • User (com U maiúsculo)"
echo -e "   • user (com u minúsculo)"
echo -e "   • users (plural)"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "backend/scripts/add-google-oauth-columns.js" ] && [ ! -f "backend/scripts/add-google-oauth-columns.ts" ]; then
    echo -e "${RED}❌ Erro: Scripts não encontrados!${NC}"
    echo -e "${RED}   Execute este script a partir do diretório raiz do projeto${NC}"
    exit 1
fi

# Navegar para o diretório backend
cd backend

echo -e "${YELLOW}📂 Entrando no diretório backend...${NC}"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Erro: Node.js não está instalado${NC}"
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao instalar dependências${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}🚀 Executando script para adicionar colunas OAuth...${NC}"
echo ""

# Tentar executar o script TypeScript primeiro, depois JavaScript
if [ -f "scripts/add-google-oauth-columns.ts" ]; then
    echo -e "${BLUE}📝 Executando versão TypeScript...${NC}"
    npx ts-node scripts/add-google-oauth-columns.ts
    RESULT=$?
elif [ -f "scripts/add-google-oauth-columns.js" ]; then
    echo -e "${BLUE}📝 Executando versão JavaScript...${NC}"
    node scripts/add-google-oauth-columns.js
    RESULT=$?
else
    echo -e "${RED}❌ Erro: Nenhum script encontrado!${NC}"
    exit 1
fi

echo ""

if [ $RESULT -eq 0 ]; then
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}✅ Colunas OAuth Google adicionadas com sucesso!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "${BLUE}🔐 Colunas adicionadas:${NC}"
    echo -e "   • google_id (VARCHAR 255, UNIQUE)"
    echo -e "   • google_email (VARCHAR 255)"
    echo -e "   • google_name (VARCHAR 255)"
    echo -e "   • google_picture (VARCHAR 500)"
    echo -e "   • google_access_token (TEXT)"
    echo -e "   • google_refresh_token (TEXT)"
    echo -e "   • google_token_expires_at (TIMESTAMP)"
    echo -e "   • is_google_verified (BOOLEAN, default false)"
    echo -e "   • google_linked_at (TIMESTAMP)"
    echo ""
    echo -e "${YELLOW}💡 Próximos passos:${NC}"
    echo -e "   1. Reinicie sua aplicação"
    echo -e "   2. O erro 'column User.google_id does not exist' deve ser resolvido"
    echo -e "   3. Teste a funcionalidade OAuth do Google"
    echo ""
    echo -e "${BLUE}🔗 Scripts disponíveis para OAuth:${NC}"
    echo -e "   • backend/scripts/link-google-oauth-example.ts - Exemplo de vinculação"
    echo -e "   • backend/scripts/create-default-users.ts - Criar usuários com suporte OAuth"
else
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}❌ Erro durante a adição das colunas${NC}"
    echo -e "${RED}================================================${NC}"
    echo ""
    echo -e "${YELLOW}💡 Dicas para resolução:${NC}"
    echo -e "   • Verifique se o banco de dados está rodando"
    echo -e "   • Verifique as configurações de conexão no .env"
    echo -e "   • Verifique se você tem permissões para alterar a estrutura do banco"
    echo -e "   • Verifique se as tabelas de usuários existem"
    exit 1
fi 