#!/usr/bin/env node

/**
 * Script para testar se o loop de login foi corrigido
 */

const fetch = require('node-fetch');

const FRONTEND_URL = 'https://portal.sabercon.com.br';
const BACKEND_URL = 'http://localhost:3001/api';

async function testBackendDirect() {
  console.log('🔧 Testando backend direto...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sabercon.edu.br',
        password: 'password123'
      }),
      timeout: 5000
    });
    
    const data = await response.text();
    console.log('📡 Resposta do backend direto:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      isJSON: data.startsWith('{'),
      preview: data.substring(0, 100)
    });
    
    return response.status === 200 || response.status === 401; // 401 é esperado para credenciais inválidas
  } catch (error) {
    console.log('❌ Erro no backend direto:', error.message);
    return false;
  }
}

async function testFrontendEndpoint() {
  console.log('🌐 Testando endpoint do frontend...');
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      }),
      timeout: 10000
    });
    
    const data = await response.text();
    console.log('📡 Resposta do frontend:', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      isJSON: data.startsWith('{'),
      preview: data.substring(0, 100)
    });
    
    // Verificar se não é HTML
    if (data.includes('<html>')) {
      console.log('❌ Frontend ainda retornando HTML!');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ Erro no frontend:', error.message);
    return false;
  }
}

async function testForLoop() {
  console.log('🔄 Testando se há loop...');
  
  const startTime = Date.now();
  let requestCount = 0;
  
  // Fazer 3 requisições rápidas para ver se há loop
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(`${FRONTEND_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        }),
        timeout: 5000
      });
      
      requestCount++;
      console.log(`✅ Requisição ${i + 1} concluída em ${Date.now() - startTime}ms`);
      
      if (Date.now() - startTime > 10000) {
        console.log('❌ Requisição demorou mais de 10 segundos - possível loop');
        return false;
      }
    } catch (error) {
      console.log(`❌ Requisição ${i + 1} falhou:`, error.message);
    }
  }
  
  console.log(`✅ ${requestCount} requisições concluídas em ${Date.now() - startTime}ms`);
  return true;
}

async function main() {
  console.log('🧪 TESTE DE CORREÇÃO DE LOOP DE LOGIN');
  console.log('=====================================\n');
  
  const backendOk = await testBackendDirect();
  console.log(`Backend direto: ${backendOk ? '✅ OK' : '❌ FALHA'}\n`);
  
  const frontendOk = await testFrontendEndpoint();
  console.log(`Frontend endpoint: ${frontendOk ? '✅ OK' : '❌ FALHA'}\n`);
  
  const noLoop = await testForLoop();
  console.log(`Sem loop: ${noLoop ? '✅ OK' : '❌ FALHA'}\n`);
  
  if (backendOk && frontendOk && noLoop) {
    console.log('🎉 SUCESSO: Loop de login foi corrigido!');
  } else {
    console.log('❌ FALHA: Loop ainda existe ou há outros problemas');
  }
}

main().catch(console.error); 