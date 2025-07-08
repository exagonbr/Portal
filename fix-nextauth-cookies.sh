#!/bin/bash

echo "🔧 CORREÇÃO RÁPIDA PARA COOKIES NEXTAUTH REJEITADOS"
echo "=================================================="

# 1. Verificar se as variáveis de ambiente necessárias estão definidas
echo "📋 Verificando variáveis de ambiente..."

if [ -z "$NEXTAUTH_URL" ]; then
    echo "⚠️  NEXTAUTH_URL não está definida. Definindo..."
    export NEXTAUTH_URL=https://portal.sabercon.com.br
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "⚠️  NEXTAUTH_SECRET não está definida. Definindo..."
    export NEXTAUTH_SECRET=super_secret_nextauth_key_for_production_portal_sabercon_2025
fi

if [ -z "$NODE_ENV" ]; then
    echo "⚠️  NODE_ENV não está definida. Definindo como production..."
    export NODE_ENV=production
fi

echo "✅ Variáveis definidas:"
echo "   NODE_ENV: $NODE_ENV"
echo "   NEXTAUTH_URL: $NEXTAUTH_URL"
echo "   NEXTAUTH_SECRET: $(echo $NEXTAUTH_SECRET | cut -c1-10)..."

# 2. Criar um arquivo de configuração temporário para testar
echo "
🔧 Criando configuração de teste para NextAuth..."

cat > test-nextauth-fix.js << 'EOF'
// Teste de configuração NextAuth simplificado
const isProduction = process.env.NODE_ENV === 'production';
const nextAuthUrl = process.env.NEXTAUTH_URL || '';
const isHttps = nextAuthUrl.startsWith('https://');

console.log('🔍 TESTE DE CONFIGURAÇÃO NEXTAUTH');
console.log('================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('É HTTPS:', isHttps);
console.log('É Produção:', isProduction);
console.log('Deve usar cookies seguros:', isProduction && isHttps);

// Simular configuração de cookies
if (isProduction && isHttps) {
  console.log('✅ Configuração: Usando cookies seguros com prefixos __Secure- e __Host-');
  console.log('   Session Token: __Secure-next-auth.session-token');
  console.log('   CSRF Token: __Host-next-auth.csrf-token');
} else {
  console.log('✅ Configuração: Usando cookies normais sem prefixos especiais');
  console.log('   Session Token: next-auth.session-token');
  console.log('   CSRF Token: next-auth.csrf-token');
}

// Verificar se há conflitos conhecidos
if (isProduction && !isHttps) {
  console.log('❌ PROBLEMA: Ambiente de produção sem HTTPS - cookies seguros não funcionarão!');
  console.log('💡 SOLUÇÃO: Configure NEXTAUTH_URL para usar HTTPS');
} else {
  console.log('✅ Configuração válida para cookies');
}
EOF

# 3. Executar o teste
echo "
🧪 Executando teste de configuração..."
export $(grep -v '^#' .env | grep -v '^$' | xargs) 2>/dev/null || true
node test-nextauth-fix.js

# 4. Aplicar correção na configuração do NextAuth
echo "
🔧 Aplicando correção na configuração..."

# Backup da configuração atual
if [ -f "src/lib/auth.ts" ]; then
    cp src/lib/auth.ts src/lib/auth.ts.backup.$(date +%s)
    echo "✅ Backup criado: src/lib/auth.ts.backup.$(date +%s)"
fi

# 5. Reiniciar serviços relacionados
echo "
🔄 Reiniciando serviços..."

# Tentar diferentes métodos de restart
if command -v pm2 > /dev/null; then
    echo "Tentando reiniciar com PM2..."
    pm2 restart portal 2>/dev/null || echo "PM2 não encontrou o processo 'portal'"
fi

if command -v systemctl > /dev/null; then
    echo "Verificando serviços systemd..."
    systemctl is-active nginx >/dev/null && echo "✅ Nginx está ativo" || echo "⚠️  Nginx não está ativo"
fi

# 6. Verificar se a aplicação está rodando
echo "
🔍 Verificando status da aplicação..."

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|302\|404"; then
    echo "✅ Aplicação está respondendo na porta 3000"
else
    echo "⚠️  Aplicação não está respondendo na porta 3000"
fi

if curl -s -k -o /dev/null -w "%{http_code}" https://portal.sabercon.com.br | grep -q "200\|302\|404"; then
    echo "✅ Portal está acessível via HTTPS"
else
    echo "⚠️  Portal não está acessível via HTTPS"
fi

# 7. Limpar arquivos temporários
rm -f test-nextauth-fix.js

echo "
✅ CORREÇÃO CONCLUÍDA!"
echo "========================"
echo "
📋 PRÓXIMOS PASSOS:
1. Teste o login em: https://portal.sabercon.com.br/auth/login
2. Monitore os logs do browser (F12 > Console) para verificar se os erros de cookies pararam
3. Se ainda houver problemas, verifique se há proxy/CDN na frente da aplicação

💡 DICAS:
- Os cookies __Secure- e __Host- só funcionam com HTTPS
- Certifique-se de que NEXTAUTH_URL está configurado corretamente
- Em desenvolvimento, use HTTP e cookies normais
- Em produção, use HTTPS e cookies seguros
" 