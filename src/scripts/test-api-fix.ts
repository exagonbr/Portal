/**
 * Script para testar as correções da API
 */

import { getBackendUrl } from '../app/api/lib/backend-config';
import { handleApiResponse } from '../app/api/lib/response-handler';

console.log('🧪 TESTE DAS CORREÇÕES DA API\n');

// 1. Testar configuração do backend
console.log('1️⃣ CONFIGURAÇÃO DO BACKEND:');
console.log('   Backend URL base:', getBackendUrl());
console.log('   Backend URL /users/stats:', getBackendUrl('/users/stats'));
console.log('');

// 2. Testar requisição direta
console.log('2️⃣ TESTE DE REQUISIÇÃO DIRETA:');

async function testDirectRequest() {
  try {
    const url = getBackendUrl('/health');
    console.log(`   Testando: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    // Testar o handler de resposta
    const result = await handleApiResponse(response, 'test-health');
    console.log('   ✅ Handler processou a resposta com sucesso');
    
    // Extrair dados da resposta
    const data = await result.json();
    console.log(`   Dados: ${JSON.stringify(data).substring(0, 100)}...`);
  } catch (error) {
    console.log('   ❌ Erro:', error);
  }
}

// 3. Testar endpoint problemático
console.log('\n3️⃣ TESTE DO ENDPOINT /users/stats:');

async function testUsersStats() {
  try {
    const url = getBackendUrl('/users/stats');
    console.log(`   Testando: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.status === 401) {
      console.log('   ⚠️  401 Unauthorized - Token necessário (comportamento esperado)');
    }
    
    // Testar o handler de resposta
    const result = await handleApiResponse(response, 'test-users-stats');
    const data = await result.json();
    
    if (data.success === false) {
      console.log('   ℹ️  Resposta de erro:', data.message || data.error);
    } else {
      console.log('   ✅ Endpoint respondeu com sucesso');
    }
  } catch (error) {
    console.log('   ❌ Erro:', error);
  }
}

// 4. Verificar variáveis de ambiente
console.log('\n4️⃣ VARIÁVEIS DE AMBIENTE ATUAIS:');
console.log('   BACKEND_URL:', process.env.BACKEND_URL);
console.log('   INTERNAL_API_URL:', process.env.INTERNAL_API_URL);
console.log('   NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('   FORCE_PRODUCTION_BACKEND:', process.env.FORCE_PRODUCTION_BACKEND || 'false');

// Executar testes
(async () => {
  await testDirectRequest();
  await testUsersStats();
  
  console.log('\n📋 RESUMO DAS CORREÇÕES:');
  console.log('✅ Criado handler seguro para respostas JSON/HTML');
  console.log('✅ Implementada configuração centralizada do backend');
  console.log('✅ Adicionado timeout nas requisições');
  console.log('✅ Melhorado tratamento de erros');
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Adicione FORCE_PRODUCTION_BACKEND=true no .env para forçar uso do backend de produção');
  console.log('2. Ou pare o servidor local na porta 3001 se não estiver em uso');
  console.log('3. Reinicie o servidor Next.js para aplicar as mudanças');
})();