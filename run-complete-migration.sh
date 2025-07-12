#!/bin/bash

# 🚀 Script de Migração Completa MySQL → PostgreSQL
# Este script executa a migração completa do banco de dados

echo "🚀 Iniciando migração completa MySQL → PostgreSQL..."
echo "⚠️  ATENÇÃO: Este script irá APAGAR todos os dados existentes no PostgreSQL!"
echo ""

# Função para verificar se o comando foi executado com sucesso
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 executado com sucesso!"
    else
        echo "❌ Erro ao executar $1"
        exit 1
    fi
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se o backend existe
if [ ! -d "backend" ]; then
    echo "❌ Erro: Diretório backend não encontrado"
    exit 1
fi

# Entrar no diretório backend
cd backend

echo "📁 Entrando no diretório backend..."

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    check_success "Instalação de dependências"
fi

# Verificar conexão com PostgreSQL
echo "🔍 Verificando conexão com PostgreSQL..."
npm run db:check 2>/dev/null || echo "⚠️  Não foi possível verificar conexão automaticamente"

# Aguardar confirmação do usuário
echo ""
echo "🔄 Esta operação irá:"
echo "   1. ❌ APAGAR todas as tabelas existentes (DROP CASCADE)"
echo "   2. 🏗️  Criar nova estrutura PostgreSQL completa"
echo "   3. 🌱 Inserir dados básicos (roles, instituições, etc.)"
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada pelo usuário"
    exit 1
fi

echo ""
echo "🧹 PASSO 1: Executando migração (DROP CASCADE + CREATE)..."

# Executar a migração
npm run migrate:latest
check_success "Migração"

echo ""
echo "🌱 PASSO 2: Executando seed (dados básicos)..."

# Executar o seed
npm run seed:run
check_success "Seed"

echo ""
echo "🎉 MIGRAÇÃO COMPLETA CONCLUÍDA COM SUCESSO!"
echo ""
echo "📊 RESUMO:"
echo "  ✅ Estrutura PostgreSQL criada"
echo "  ✅ Dados básicos inseridos"
echo "  ✅ Sistema pronto para uso"
echo ""
echo "🔗 Próximos passos:"
echo "  1. 🌐 Acesse a interface web de migração"
echo "  2. 📥 Configure conexão MySQL"
echo "  3. 🔄 Execute migração de dados"
echo "  4. ✅ Valide os dados migrados"
echo ""
echo "📱 Interface de migração disponível em:"
echo "  → http://localhost:3000/admin/migration/mysql-postgres"
echo ""
echo "👤 Para acessar como administrador:"
echo "  → Role: SYSTEM_ADMIN"
echo "  → ID: 35f57500-9a89-4318-bc9f-9acad28c2fb6"
echo ""

# Voltar ao diretório raiz
cd ..

echo "🎯 Migração preparada com sucesso!"
echo "   Use a interface web para importar dados do MySQL."
