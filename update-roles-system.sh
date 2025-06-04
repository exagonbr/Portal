#!/bin/bash

# 🎯 Script para atualizar o Sistema de Roles do Portal Sabercon
# Executa a atualização completa com SYSTEM_ADMIN tendo acesso total

echo "🚀 Atualizando Sistema de Roles do Portal Sabercon..."
echo "=========================================="

# Verificar se estamos no diretório correto
if [ ! -d "backend" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto Portal"
    exit 1
fi

# Navegar para o backend
cd backend

echo "📋 Verificando dependências do backend..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install
fi

echo "🗄️  Executando migrations..."
npm run migrate

echo "🌱 Executando seeds atualizados..."
npm run seed

echo ""
echo "✅ SISTEMA DE ROLES ATUALIZADO COM SUCESSO!"
echo "=========================================="
echo "🎯 Roles implementadas:"
echo "   👑 SYSTEM_ADMIN - Acesso completo de administrador"
echo "   🏢 INSTITUTION_MANAGER - Gestor"
echo "   📚 ACADEMIC_COORDINATOR - Coordenador Pedagógico"
echo "   👨‍🏫 TEACHER - Professor"
echo "   🎓 STUDENT - Aluno"
echo "   👨‍👩‍👧‍👦 GUARDIAN - Responsável"
echo ""
echo "🔑 Login de teste - SYSTEM_ADMIN:"
echo "   Email: admin@portal.com"
echo "   Senha: admin123"
echo "   Dashboard: /dashboard/system-admin"
echo ""
echo "📚 Para mais detalhes, consulte:"
echo "   backend/README_ROLES_SYSTEM.md"
echo ""
echo "🚀 Sistema pronto para uso!"

cd .. 