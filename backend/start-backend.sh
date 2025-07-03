#!/bin/bash

echo "🚀 Iniciando Portal Sabercon Backend..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório backend/"
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Erro: Node.js não está instalado"
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Erro: npm não está instalado"
    exit 1
fi

echo "📦 Instalando dependências..."
npm install

echo "🔨 Compilando TypeScript..."
npx tsc

if [ $? -ne 0 ]; then
    echo "❌ Erro na compilação TypeScript"
    exit 1
fi

echo "🔧 Verificando variáveis de ambiente..."
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado, criando um básico..."
    cat > .env << EOF
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key-here
CORS_CREDENTIALS=true
DATABASE_URL=postgresql://user:password@localhost:5432/portal_sabercon
REDIS_URL=redis://localhost:6379
EOF
    echo "✅ Arquivo .env criado. Configure as variáveis conforme necessário."
fi

echo "🌟 Iniciando servidor..."
echo "📍 Servidor será iniciado em: https://portal.sabercon.com.br/api"
echo "📋 Health check: https://portal.sabercon.com.br/api/health"
echo "📚 API Docs: https://portal.sabercon.com.br/api/backend/docs"
echo ""
echo "Para parar o servidor, pressione Ctrl+C"
echo ""

# Verificar se existe a versão corrigida
if [ -f "dist/index-fixed.js" ]; then
    echo "🔧 Usando versão corrigida do servidor..."
    node dist/index-fixed.js
elif [ -f "src/index-fixed.ts" ]; then
    echo "🔧 Compilando e usando versão corrigida..."
    npx tsc src/index-fixed.ts --outDir dist --esModuleInterop --skipLibCheck
    node dist/index-fixed.js
else
    echo "🔧 Usando servidor padrão..."
    node dist/index.js
fi 