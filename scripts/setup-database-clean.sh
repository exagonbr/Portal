#!/bin/bash

# Script para setup limpo do banco de dados
# Remove todas as tabelas e recria do zero

set -e

echo "=== Setup Limpo do Banco de Dados ==="
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

# Configurar variáveis
DB_HOST="${DB_HOST:-${DATABASE_HOST:-localhost}}"
DB_PORT="${DB_PORT:-${DATABASE_PORT:-5432}}"
DB_NAME="${DB_NAME:-${DATABASE_NAME:-portal_sabercon}}"
DB_USER="${DB_USER:-${DATABASE_USER:-postgres}}"
DB_PASSWORD="${DB_PASSWORD:-${DATABASE_PASSWORD}}"

echo ""
echo "Banco de dados: $DB_NAME em $DB_HOST:$DB_PORT"
echo ""

# Confirmar ação
read -p "⚠️  ATENÇÃO: Isso irá APAGAR TODAS AS TABELAS. Continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada"
    exit 1
fi

cd backend

# 1. Rollback de todas as migrações (limpar banco)
echo ""
echo "1. Limpando banco de dados..."
npm run migrate:rollback -- --all || echo "Nenhuma migração para reverter"

# 2. Executar migrações
echo ""
echo "2. Executando migrações..."
npm run migrate:latest

# 3. Executar seeds
echo ""
echo "3. Executando seeds..."
npm run seed:roles

# 4. Criar usuários padrão
echo ""
echo "4. Criando usuários padrão..."
if [ -f "../scripts/create-default-users-prod.ts" ]; then
    npx ts-node ../scripts/create-default-users-prod.ts
fi

# 5. Verificar resultado
echo ""
echo "5. Verificando banco..."
cd ..

export PGPASSWORD="$DB_PASSWORD"

# Contar tabelas
TABLES_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")

echo ""
echo "✅ Setup limpo concluído!"
echo "   Total de tabelas criadas: $TABLES_COUNT"
echo ""
echo "Para verificar as tabelas:"
echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\dt'"