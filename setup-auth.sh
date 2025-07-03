#!/bin/bash

echo "🚀 Configurando autenticação do Portal Sabercon..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Entrando no diretório do backend...${NC}"
cd backend

echo -e "${BLUE}🔄 Executando migração para adicionar coluna active...${NC}"
npx knex migrate:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migração executada com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro na migração${NC}"
    exit 1
fi

echo -e "${BLUE}🌱 Executando seed para criar usuários de teste...${NC}"
npx knex seed:run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Seed executado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro no seed${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Iniciando backend em segundo plano...${NC}"
npm start &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend iniciado com PID: $BACKEND_PID${NC}"

# Aguardar o backend inicializar
echo -e "${YELLOW}⏳ Aguardando backend inicializar...${NC}"
sleep 5

echo -e "${GREEN}🎉 CONFIGURAÇÃO CONCLUÍDA!${NC}"
echo ""
echo -e "${BLUE}👤 USUÁRIOS DE TESTE CRIADOS:${NC}"
echo ""
echo -e "${GREEN}🔑 SYSTEM_ADMIN:${NC}"
echo "   Email: admin@portal.com"
echo "   Senha: password123"
echo ""
echo -e "${BLUE}🏢 INSTITUTION_MANAGER:${NC}"
echo "   Email: gestor@sabercon.edu.br"
echo "   Senha: password123"
echo ""
echo -e "${YELLOW}📚 ACADEMIC_COORDINATOR:${NC}"
echo "   Email: coordenador@sabercon.edu.br"
echo "   Senha: password123"
echo ""
echo -e "${GREEN}👨‍🏫 TEACHER:${NC}"
echo "   Email: professor@sabercon.edu.br"
echo "   Senha: password123"
echo ""
echo -e "${BLUE}🎓 STUDENT:${NC}"
echo "   Email: julia.costa@sabercon.edu.br"
echo "   Senha: password123"
echo ""
echo -e "${YELLOW}👨‍👩‍👧‍👦 GUARDIAN:${NC}"
echo "   Email: responsavel@sabercon.edu.br"
echo "   Senha: password123"
echo ""
echo -e "${GREEN}🧪 TESTE AS CREDENCIAIS EM:${NC}"
echo "   Frontend: https://portal.sabercon.com.br/login"
echo "   Teste: https://portal.sabercon.com.br/test-login"
echo "   Backend API: https://portal.sabercon.com.br/api-docs"
echo ""
echo -e "${YELLOW}💡 Para parar o backend: kill $BACKEND_PID${NC}" 