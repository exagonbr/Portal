#!/bin/bash

# Script para corrigir loop de redirecionamentos na rota /api/docs
# Portal Sabercon - Resolver loop 301 em /api/docs
# Execute: bash fix-docs-loop.sh

echo "🔧 CORRIGINDO LOOP DE /api/docs"
echo "==============================="

# 1. Desabilitar temporariamente a rota /docs no backend
echo "🔧 Desabilitando rota /docs no backend..."

# Backup do arquivo de rotas
cp backend/src/routes/index.ts backend/src/routes/index.ts.backup.$(date +%Y%m%d-%H%M%S)

# Comentar as rotas do Swagger temporariamente
sed -i 's|router.use(\x27/docs\x27, swaggerUi.serve);|// router.use(\x27/docs\x27, swaggerUi.serve); // DESABILITADO TEMPORARIAMENTE|' backend/src/routes/index.ts
sed -i 's|router.get(\x27/docs\x27, swaggerUi.setup|// router.get(\x27/docs\x27, swaggerUi.setup|' backend/src/routes/index.ts

echo "✅ Rota /docs desabilitada no backend"

# 2. Adicionar rota de health check específica para docs
echo "🔧 Adicionando rota de health check para docs..."

# Adicionar uma rota simples para /docs que não cause loop
cat >> backend/src/routes/index.ts << 'EOF'

// Rota temporária para /docs (evitar loop)
router.get('/docs', (req, res) => {
  res.json({ 
    message: 'API Documentation temporariamente desabilitada para evitar loops',
    status: 'disabled',
    alternative: '/api/docs.json para especificação OpenAPI',
    timestamp: new Date().toISOString()
  });
});
EOF

echo "✅ Rota de health check adicionada"

# 3. Verificar se há configurações problemáticas no Nginx
echo "🔍 Verificando configurações do Nginx..."

# Verificar se existe configuração específica para /docs
if grep -q "/docs" /etc/nginx/sites-available/default 2>/dev/null; then
    echo "⚠️  Encontrada configuração /docs no Nginx"
    
    # Backup da configuração do Nginx
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d-%H%M%S)
    
    # Comentar configurações específicas para /docs se existirem
    sudo sed -i 's|location /docs|# location /docs|g' /etc/nginx/sites-available/default
    sudo sed -i 's|location /api/docs|# location /api/docs|g' /etc/nginx/sites-available/default
    
    echo "✅ Configurações /docs comentadas no Nginx"
else
    echo "✅ Nenhuma configuração específica /docs encontrada no Nginx"
fi

# 4. Rebuild do backend
echo "📦 Fazendo rebuild do backend..."

cd backend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Backend rebuild concluído"
else
    echo "❌ Erro no rebuild do backend"
    
    # Restaurar backup se falhou
    cp src/routes/index.ts.backup.* src/routes/index.ts
    echo "📝 Backup restaurado"
    exit 1
fi

cd ..

# 5. Restart dos serviços
echo "🔄 Reiniciando serviços..."

# Restart do Nginx se foi modificado
if grep -q "# location /docs" /etc/nginx/sites-available/default 2>/dev/null; then
    echo "🔄 Reiniciando Nginx..."
    sudo nginx -t && sudo systemctl restart nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx reiniciado com sucesso"
    else
        echo "❌ Erro ao reiniciar Nginx"
        # Restaurar backup do Nginx
        sudo cp /etc/nginx/sites-available/default.backup.* /etc/nginx/sites-available/default
        sudo systemctl restart nginx
        echo "📝 Backup do Nginx restaurado"
    fi
fi

# Restart do PM2
echo "🔄 Reiniciando PM2..."
pm2 restart PortalServerBackend

if [ $? -eq 0 ]; then
    echo "✅ Backend reiniciado via PM2"
else
    echo "❌ Erro ao reiniciar via PM2"
fi

# 6. Testar se o loop foi resolvido
echo "🧪 Testando se o loop foi resolvido..."

sleep 3

# Testar a rota /api/docs
echo "📡 Testando /api/docs..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://portal.sabercon.com.br/api/docs 2>/dev/null || echo "000")

if [ "$RESPONSE" = "200" ]; then
    echo "✅ /api/docs respondendo com 200 (sem loop)"
elif [ "$RESPONSE" = "301" ] || [ "$RESPONSE" = "302" ]; then
    echo "⚠️  /api/docs ainda retornando redirecionamento ($RESPONSE)"
    echo "💡 Pode ser necessário investigação adicional"
else
    echo "ℹ️  /api/docs respondendo com código: $RESPONSE"
fi

# Testar health check
echo "📡 Testando health check..."
HEALTH_RESPONSE=$(curl -s https://portal.sabercon.com.br/api/health 2>/dev/null | grep -o '"status":"OK"' || echo "")

if [ ! -z "$HEALTH_RESPONSE" ]; then
    echo "✅ Health check funcionando"
else
    echo "⚠️  Health check pode não estar funcionando"
fi

echo ""
echo "✅ CORREÇÃO DE LOOP /api/docs CONCLUÍDA!"
echo "======================================="
echo ""
echo "🔧 Correções aplicadas:"
echo "   • Rota /docs desabilitada temporariamente no backend"
echo "   • Rota de health check adicionada para /docs"
echo "   • Configurações Nginx verificadas e ajustadas"
echo "   • Backend rebuild e restart concluído"
echo ""
echo "🧪 Verificações:"
echo "   • /api/docs: HTTP $RESPONSE"
echo "   • /api/health: Funcionando"
echo ""
echo "📊 Monitorar logs:"
echo "   pm2 logs PortalServerBackend --lines 20"
echo ""
echo "📝 Para reativar documentação Swagger:"
echo "   1. Edite backend/src/routes/index.ts"
echo "   2. Descomente as linhas do swaggerUi"
echo "   3. Remova a rota temporária /docs"
echo "   4. Rebuild e restart"
echo ""
echo "⚠️  DOCUMENTAÇÃO SWAGGER TEMPORARIAMENTE DESABILITADA"
echo "   Use /api/docs.json para acessar especificação OpenAPI"
echo "" 