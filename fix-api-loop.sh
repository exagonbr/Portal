#!/bin/bash

# Script para diagnosticar e corrigir loop na API
# Portal Sabercon - AWS ALB
# Execute: bash fix-api-loop.sh

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌ $1${NC}"
}

echo "🔍 DIAGNÓSTICO DO PROBLEMA DE LOOP NA API"
echo "=========================================="
echo ""

# 1. Verificar configuração atual do frontend
log "1. Verificando configuração do frontend..."

# Procurar por configurações de API no frontend
if [ -f "next.config.js" ]; then
    echo "📄 next.config.js encontrado:"
    grep -n -A5 -B5 "api\|API\|baseURL\|NEXT_PUBLIC" next.config.js || echo "Nenhuma configuração de API encontrada"
    echo ""
fi

if [ -f ".env" ]; then
    echo "📄 .env encontrado:"
    grep -n "API\|api\|BASE_URL\|NEXT_PUBLIC" .env || echo "Nenhuma variável de API encontrada"
    echo ""
fi

if [ -f ".env.local" ]; then
    echo "📄 .env.local encontrado:"
    grep -n "API\|api\|BASE_URL\|NEXT_PUBLIC" .env.local || echo "Nenhuma variável de API encontrada"
    echo ""
fi

if [ -f ".env.production" ]; then
    echo "📄 .env.production encontrado:"
    grep -n "API\|api\|BASE_URL\|NEXT_PUBLIC" .env.production || echo "Nenhuma variável de API encontrada"
    echo ""
fi

# 2. Verificar arquivos de configuração de API no frontend
log "2. Procurando configurações de API no código..."

# Procurar por axios.defaults, fetch, ou configurações de API
find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | grep -v node_modules | head -20 | while read file; do
    if grep -l "baseURL\|axios.defaults\|API_URL\|api.*portal.sabercon" "$file" 2>/dev/null; then
        echo "📄 $file:"
        grep -n -A2 -B2 "baseURL\|axios.defaults\|API_URL\|api.*portal.sabercon" "$file" || true
        echo ""
    fi
done

# 3. Verificar configuração do backend
log "3. Verificando configuração do backend..."

if [ -d "backend" ]; then
    cd backend
    
    if [ -f ".env" ]; then
        echo "📄 backend/.env encontrado:"
        grep -n "PORT\|CORS\|FRONTEND_URL\|CLIENT_URL" .env || echo "Nenhuma configuração relevante encontrada"
        echo ""
    fi
    
    if [ -f "server.js" ] || [ -f "index.js" ] || [ -f "app.js" ]; then
        echo "📄 Procurando configurações CORS no backend:"
        find . -name "*.js" | head -10 | while read file; do
            if grep -l "cors\|CORS\|origin" "$file" 2>/dev/null; then
                echo "Em $file:"
                grep -n -A3 -B3 "cors\|CORS\|origin" "$file" || true
                echo ""
            fi
        done
    fi
    
    cd ..
fi

# 4. Testar conectividade
log "4. Testando conectividade..."

echo "🧪 Testando localhost:3000 (frontend):"
curl -s -I http://localhost:3000 | head -5 || echo "❌ Frontend não responde"
echo ""

echo "🧪 Testando localhost:3001 (backend):"
curl -s -I http://localhost:3001 | head -5 || echo "❌ Backend não responde"
echo ""

echo "🧪 Testando localhost:3001/api/ (backend API):"
curl -s -I http://localhost:3001/api/ | head -5 || echo "❌ Backend API não responde"
echo ""

# 5. Verificar logs recentes
log "5. Verificando logs recentes..."

if command -v pm2 &> /dev/null; then
    echo "📝 Logs PM2 Frontend (últimas 20 linhas):"
    pm2 logs PortalServerFrontend --lines 20 --nostream 2>/dev/null || echo "Sem logs do frontend"
    echo ""
    
    echo "📝 Logs PM2 Backend (últimas 20 linhas):"
    pm2 logs PortalServerBackend --lines 20 --nostream 2>/dev/null || echo "Sem logs do backend"
    echo ""
fi

# 6. Sugestões de correção
echo ""
echo "🔧 SUGESTÕES DE CORREÇÃO:"
echo "========================"
echo ""

log_warning "PROBLEMA COMUM: Loop infinito quando frontend chama https://portal.sabercon.com.br/api"
echo ""

echo "✅ SOLUÇÕES RECOMENDADAS:"
echo ""
echo "1️⃣  CONFIGURAR VARIÁVEIS DE AMBIENTE DO FRONTEND:"
echo "   Criar/editar .env.production:"
echo "   NEXT_PUBLIC_API_URL=http://localhost:3001/api"
echo "   # OU para desenvolvimento:"
echo "   NEXT_PUBLIC_API_URL=/api"
echo ""

echo "2️⃣  CONFIGURAR AXIOS/FETCH NO FRONTEND:"
echo "   // Em vez de:"
echo "   // axios.defaults.baseURL = 'https://portal.sabercon.com.br/api'"
echo "   // Use:"
echo "   axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'"
echo ""

echo "3️⃣  CONFIGURAR CORS NO BACKEND:"
echo "   app.use(cors({"
echo "     origin: ['https://portal.sabercon.com.br', 'http://localhost:3000'],"
echo "     credentials: true"
echo "   }))"
echo ""

echo "4️⃣  VERIFICAR PROXY NO NEXT.JS:"
echo "   // next.config.js"
echo "   module.exports = {"
echo "     async rewrites() {"
echo "       return ["
echo "         {"
echo "           source: '/api/:path*',"
echo "           destination: 'http://localhost:3001/api/:path*'"
echo "         }"
echo "       ]"
echo "     }"
echo "   }"
echo ""

echo "5️⃣  COMANDOS PARA APLICAR CORREÇÕES:"
echo "   # Parar aplicações"
echo "   pm2 stop all"
echo "   "
echo "   # Configurar variáveis"
echo "   echo 'NEXT_PUBLIC_API_URL=/api' >> .env.production"
echo "   "
echo "   # Rebuild e restart"
echo "   npm run build"
echo "   pm2 start ecosystem.config.js --env production"
echo ""

# 7. Criar arquivo de correção automática
cat > fix-env-production.sh << 'EOL'
#!/bin/bash
# Correção automática das variáveis de ambiente

echo "🔧 Aplicando correções automáticas..."

# Backup do .env atual
if [ -f ".env.production" ]; then
    cp .env.production .env.production.backup.$(date +%Y%m%d-%H%M%S)
fi

# Criar/atualizar .env.production
cat > .env.production << 'EOF'
# Portal Sabercon - Produção AWS ALB
NODE_ENV=production
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_APP_URL=https://portal.sabercon.com.br
EOF

echo "✅ .env.production atualizado"

# Verificar se existe next.config.js
if [ ! -f "next.config.js" ]; then
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig
EOF
    echo "✅ next.config.js criado com proxy para API"
else
    echo "⚠️  next.config.js já existe - verifique manualmente"
fi

echo "🔄 Para aplicar as mudanças:"
echo "pm2 stop all"
echo "npm run build"
echo "pm2 start ecosystem.config.js --env production"
EOL

chmod +x fix-env-production.sh

echo ""
log_success "Script de correção criado: fix-env-production.sh"
echo ""
echo "🚀 PRÓXIMOS PASSOS:"
echo "1. Execute: bash fix-env-production.sh"
echo "2. Ou configure manualmente conforme as sugestões acima"
echo "3. Depois execute: sudo bash setup-production-aws-alb.sh"
echo "" 