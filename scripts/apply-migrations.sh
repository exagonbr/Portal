#!/bin/bash

# Script para aplicar as migrações do Prisma

# Verificar se o .env existe
if [ ! -f .env ]; then
  echo "Arquivo .env não encontrado. Criando um arquivo de exemplo..."
  echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/sabercon?schema=public\"" > .env
  echo "Você precisa configurar o arquivo .env com as credenciais corretas do banco de dados."
  exit 1
fi

# Executar a migração
echo "Aplicando migrações do Prisma..."
npx prisma migrate deploy

# Gerar cliente Prisma
echo "Gerando cliente Prisma..."
npx prisma generate

echo "Migrações aplicadas com sucesso!" 