/**
 * Script para verificar carregamento de variáveis de ambiente
 */

import dotenv from 'dotenv';
import path from 'path';

console.log('🔍 VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE\n');

// Tentar carregar .env da raiz do projeto
const envPath = path.resolve(process.cwd(), '.env');
console.log('📁 Caminho do .env:', envPath);

// Carregar .env
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Erro ao carregar .env:', result.error);
} else {
  console.log('✅ .env carregado com sucesso\n');
}

// Verificar variáveis importantes
const envVars = [
  'NEXT_PUBLIC_API_URL',
  'BACKEND_URL', 
  'INTERNAL_API_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'NODE_ENV'
];

console.log('📋 VARIÁVEIS DE AMBIENTE:');
envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ${varName}: ${value}`);
  } else {
    console.log(`   ${varName}: ❌ NÃO DEFINIDO`);
  }
});

// Verificar se estamos em desenvolvimento ou produção
console.log('\n🌍 AMBIENTE:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   PWD: ${process.cwd()}`);

// Testar importação do config/env.ts
console.log('\n🔧 TESTE DE IMPORTAÇÃO config/env.ts:');
import('../config/env').then(module => {
  const { ENV_CONFIG, getInternalApiUrl } = module;
  console.log(`   INTERNAL_API_URL (ENV_CONFIG): ${ENV_CONFIG.INTERNAL_API_URL}`);
  console.log(`   getInternalApiUrl('/users/stats'): ${getInternalApiUrl('/users/stats')}`);
  console.log(`   BACKEND_URL (ENV_CONFIG): ${ENV_CONFIG.BACKEND_URL}`);
}).catch(error => {
  console.error('❌ Erro ao importar config/env.ts:', error);
});