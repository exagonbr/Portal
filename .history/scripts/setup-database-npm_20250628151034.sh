#!/bin/bash

# Script simplificado para setup do banco usando comandos npm
# Evita problemas com importação direta do Knex

set -e

echo "=== Setup do Banco de Dados via NPM ==="
echo ""

# Verificar diretório
if [ ! -f "backend/package.json" ]; then
    echo "❌ Erro: Execute este script da raiz do projeto"
    exit 1
fi

# Carregar variáveis de ambiente
if [ -f backend/.env ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
    echo "✓ Variáveis carregadas de backend/.env"
elif [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ Variáveis carregadas de .env"
fi

cd backend

# 1. Instalar dependências
echo ""
echo "1. Instalando dependências..."
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "✓ Dependências OK"

# 2. Executar migrações
echo ""
echo "2. Executando migrações..."
npm run migrate:latest
echo "✓ Migrações executadas"

# 3. Executar seeds
echo ""
echo "3. Executando seeds..."
npm run seed:roles
echo "✓ Seeds executados"

# 4. Criar usuários padrão
echo ""
echo "4. Criando usuários padrão..."
if [ -f "../scripts/create-default-users-prod.ts" ]; then
    npx ts-node ../scripts/create-default-users-prod.ts
else
    echo "⚠️  Script TypeScript não encontrado"
fi

# 5. Verificar resultado
echo ""
echo "5. Verificando banco..."
cd ..

# Configurar variáveis para psql
export PGPASSWORD="${DB_PASSWORD:-${DATABASE_PASSWORD}}"
DB_HOST="${DB_HOST:-${DATABASE_HOST:-localhost}}"
DB_PORT="${DB_PORT:-${DATABASE_PORT:-5432}}"
DB_NAME="${DB_NAME:-${DATABASE_NAME:-portal_sabercon}}"
DB_USER="${DB_USER:-${DATABASE_USER:-postgres}}"

# Verificar tabelas
echo ""
echo "Tabelas criadas:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt" 2>/dev/null | grep "public" || echo "Não foi possível listar tabelas"

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Comandos úteis:"
echo "  cd backend"
echo "  npm run migrate:latest    # Rodar migrações"
echo "  npm run seed:roles        # Rodar seeds"
echo "  npm run db:setup          # Rodar tudo"