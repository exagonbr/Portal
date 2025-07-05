#!/bin/bash

# Script para criar usuários padrão no sistema Portal Sabercon
# 
# Usuários criados:
# - admin@sabercon.edu.br / password (Administrador)
# - gestor@sabercon.edu.br / password (Gestor)
# - coordenador@sabercon.edu.br / password (Coordenador)
# - professor@sabercon.edu.br / password (Professor)
# - julia.c@ifsp.com / password (Aluna)
# - renato@gmail.com / password (Responsável)

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Script de Criação de Usuários Padrão${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "backend/scripts/create-default-users.js" ] && [ ! -f "backend/scripts/create-default-users.ts" ]; then
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

echo -e "${YELLOW}🚀 Executando script de criação de usuários...${NC}"
echo ""

# Tentar executar o script TypeScript primeiro, depois JavaScript
if [ -f "scripts/create-default-users.ts" ]; then
    echo -e "${BLUE}📝 Executando versão TypeScript...${NC}"
    npx ts-node scripts/create-default-users.ts
    RESULT=$?
elif [ -f "scripts/create-default-users.js" ]; then
    echo -e "${BLUE}📝 Executando versão JavaScript...${NC}"
    node scripts/create-default-users.js
    RESULT=$?
else
    echo -e "${RED}❌ Erro: Nenhum script encontrado!${NC}"
    exit 1
fi

echo ""

if [ $RESULT -eq 0 ]; then
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}✅ Usuários padrão criados com sucesso!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "${BLUE}🔑 Credenciais de acesso:${NC}"
    echo -e "   • admin@sabercon.edu.br / password (Administrador)"
    echo -e "   • gestor@sabercon.edu.br / password (Gestor)"
    echo -e "   • coordenador@sabercon.edu.br / password (Coordenador)"
    echo -e "   • professor@sabercon.edu.br / password (Professor)"
    echo -e "   • julia.c@ifsp.com / password (Aluna)"
    echo -e "   • renato@gmail.com / password (Responsável)"
    echo ""
    echo -e "${YELLOW}⚠️  Recomenda-se alterar as senhas após o primeiro login!${NC}"
else
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}❌ Erro durante a criação dos usuários${NC}"
    echo -e "${RED}================================================${NC}"
    echo ""
    echo -e "${YELLOW}💡 Dicas para resolução:${NC}"
    echo -e "   • Verifique se o banco de dados está rodando"
    echo -e "   • Verifique as configurações de conexão no .env"
    echo -e "   • Verifique se as tabelas necessárias existem"
    exit 1
fi 