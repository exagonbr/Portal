#!/usr/bin/env node

// Script de teste para verificar se as correções funcionaram
console.log('🧪 Testando correções do Portal...');

// Teste 1: Verificar se o cleanup-extensions.js pode ser acessado
fetch('/cleanup-extensions.js')
  .then(response => {
    if (response.ok && response.headers.get('content-type')?.includes('javascript')) {
      console.log('✅ cleanup-extensions.js: MIME type correto');
    } else {
      console.log('❌ cleanup-extensions.js: Problema de MIME type');
    }
  })
  .catch(error => console.log('❌ Erro ao testar cleanup-extensions.js:', error.message));

// Teste 2: Verificar diagnóstico de auth
if (typeof window !== 'undefined' && window.debugAuthState) {
  console.log('✅ Função debugAuthState disponível no console');
  window.debugAuthState();
} else {
  console.log('⚠️ Função debugAuthState não disponível');
}

console.log('🎉 Testes concluídos!');
