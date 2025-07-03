#!/bin/bash

echo "🚀 Configurando tabelas de settings..."

# Navegar para o diretório backend
cd "$(dirname "$0")/.."

# Executar migrations
echo "📦 Executando migrations..."
npx knex migrate:latest

# Executar seeds
echo "🌱 Executando seeds..."
npx knex seed:run

echo "✅ Configuração concluída com sucesso!"
echo ""
echo "📊 Tabelas criadas:"
echo "   • aws_settings"
echo "   • background_settings"
echo "   • general_settings"
echo "   • security_settings"
echo "   • email_settings"
echo ""
echo "🔐 As configurações já estão disponíveis no sistema!" 