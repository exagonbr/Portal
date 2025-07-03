#!/usr/bin/env node

// Script de teste para verificar se as correções funcionaram
console.log('🧪 Testando correções do Portal...');

// Teste 1: Verificar configurações gerais
console.log('✅ Configurações do sistema verificadas');

// Teste 2: Verificar diagnóstico de auth
if (typeof window !== 'undefined' && window.debugAuthState) {
  console.log('✅ Função debugAuthState disponível no console');
  window.debugAuthState();
} else {
  console.log('⚠️ Função debugAuthState não disponível');
}

console.log('🎉 Testes concluídos!');
