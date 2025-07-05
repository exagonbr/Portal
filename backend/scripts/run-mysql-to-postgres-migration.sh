#!/bin/bash

# Script para executar a migração completa MySQL para PostgreSQL
# Autor: Claude AI
# Data: 2024
# Versão: Sem dependência do cliente MySQL

# Definir cores para melhor visualização
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 INICIANDO PROCESSO DE MIGRAÇÃO MYSQL → POSTGRESQL${NC}"
echo -e "${YELLOW}Este script irá migrar completamente dados do MySQL para PostgreSQL usando apenas Node.js${NC}"
echo "-------------------------------------------------------------------"

# Verificar dependências
echo -e "${BLUE}📋 Verificando dependências...${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js não encontrado. Por favor, instale o Node.js.${NC}"
  exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm não encontrado. Por favor, instale o npm.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Todas dependências encontradas!${NC}"

# Verificar se o arquivo de migração existe
if [ ! -f "$(dirname "$0")/migrate-mysql-to-postgres-full.ts" ]; then
  echo -e "${RED}❌ Arquivo de migração não encontrado em $(dirname "$0")/migrate-mysql-to-postgres-full.ts${NC}"
  exit 1
fi

# Verificar variáveis de ambiente
echo -e "${BLUE}🔍 Verificando variáveis de ambiente...${NC}"

# Criar arquivo .env temporário se não existir
ENV_FILE="../.env"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}⚠️ Arquivo .env não encontrado. Criando arquivo temporário...${NC}"
  
  # Pedir informações ao usuário
  read -p "Host MySQL (padrão: localhost): " mysql_host
  mysql_host=${mysql_host:-localhost}
  
  read -p "Porta MySQL (padrão: 3306): " mysql_port
  mysql_port=${mysql_port:-3306}
  
  read -p "Usuário MySQL (padrão: root): " mysql_user
  mysql_user=${mysql_user:-root}
  
  read -p "Senha MySQL: " mysql_password
  
  read -p "Banco de dados MySQL (padrão: sabercon): " mysql_db
  mysql_db=${mysql_db:-sabercon}
  
  read -p "Host PostgreSQL (padrão: localhost): " pg_host
  pg_host=${pg_host:-localhost}
  
  read -p "Porta PostgreSQL (padrão: 5432): " pg_port
  pg_port=${pg_port:-5432}
  
  read -p "Usuário PostgreSQL (padrão: postgres): " pg_user
  pg_user=${pg_user:-postgres}
  
  read -p "Senha PostgreSQL: " pg_password
  
  read -p "Banco de dados PostgreSQL (padrão: portal_sabercon): " pg_db
  pg_db=${pg_db:-portal_sabercon}
  
  # Criar arquivo .env
  cat > "$ENV_FILE" << EOF
# Arquivo .env temporário criado para migração
# MySQL
MYSQL_HOST=$mysql_host
MYSQL_PORT=$mysql_port
MYSQL_USER=$mysql_user
MYSQL_PASSWORD=$mysql_password
MYSQL_DATABASE=$mysql_db

# PostgreSQL
DB_HOST=$pg_host
DB_PORT=$pg_port
DB_USER=$pg_user
DB_PASSWORD=$pg_password
DB_NAME=$pg_db
DB_SSL=false
EOF

  echo -e "${GREEN}✅ Arquivo .env criado com sucesso!${NC}"
else
  echo -e "${GREEN}✅ Arquivo .env encontrado!${NC}"
fi

# Criar diretório para dumps se não existir
DUMP_DIR="../database/dumps"
mkdir -p "$DUMP_DIR"

# Verificar se o mysql2 está instalado
echo -e "${BLUE}📦 Verificando pacotes Node.js necessários...${NC}"
if ! npm list mysql2 | grep -q mysql2; then
  echo -e "${YELLOW}⚠️ Pacote mysql2 não encontrado. Instalando...${NC}"
  cd .. && npm install --save mysql2
fi

if ! npm list knex | grep -q knex; then
  echo -e "${YELLOW}⚠️ Pacote knex não encontrado. Instalando...${NC}"
  cd .. && npm install --save knex
fi

if ! npm list pg | grep -q pg; then
  echo -e "${YELLOW}⚠️ Pacote pg não encontrado. Instalando...${NC}"
  cd .. && npm install --save pg
fi

# Executar migração
echo -e "${BLUE}🔄 Executando migração...${NC}"
echo -e "${YELLOW}Este processo pode levar alguns minutos, dependendo do tamanho do banco de dados.${NC}"

# Compilar e executar o script TypeScript
cd "$(dirname "$0")/.." && npx ts-node scripts/migrate-mysql-to-postgres-full.ts

# Verificar se a migração foi bem-sucedida
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
  echo -e "${BLUE}📊 Um backup JSON do banco MySQL foi criado em $DUMP_DIR${NC}"
  echo -e "${GREEN}🎉 Seu banco de dados PostgreSQL está pronto para uso!${NC}"
else
  echo -e "${RED}❌ ERRO NA MIGRAÇÃO!${NC}"
  echo -e "${YELLOW}Por favor, verifique os logs acima para detalhes do erro.${NC}"
  exit 1
fi 