/**
 * Script de diagnóstico para problemas de autenticação
 * Execute com: npx tsx src/scripts/diagnose-auth.ts
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validateJWTWithMultipleSecrets } from '../utils/jwt-validator';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO\n');

// 1. Verificar variáveis de ambiente
console.log('1️⃣ VARIÁVEIS DE AMBIENTE:');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 5)}...` : '❌ NÃO DEFINIDO');
console.log('   NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 5)}...` : '❌ NÃO DEFINIDO');
console.log('   AUTH_SECRET:', process.env.AUTH_SECRET ? `${process.env.AUTH_SECRET.substring(0, 5)}...` : '❌ NÃO DEFINIDO');
console.log('   BACKEND_URL:', process.env.BACKEND_URL || '❌ NÃO DEFINIDO');
console.log('   INTERNAL_API_URL:', process.env.INTERNAL_API_URL || '❌ NÃO DEFINIDO');
console.log('');

// 2. Testar conexão com o backend
console.log('2️⃣ TESTE DE CONEXÃO COM BACKEND:');
const backendUrl = process.env.BACKEND_URL || process.env.INTERNAL_API_URL || 'https://portal.sabercon.com.br/api';
console.log(`   URL do Backend: ${backendUrl}`);

async function testBackendConnection() {
  try {
    const healthUrl = new URL('/health', backendUrl).toString();
    console.log(`   Testando: ${healthUrl}`);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      console.log('   ✅ Backend retornando JSON corretamente');
      console.log(`   Dados: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
      const text = await response.text();
      console.log('   ❌ Backend retornando HTML/texto em vez de JSON');
      console.log(`   Resposta: ${text.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log('   ❌ Erro ao conectar com backend:', error);
  }
}

// 3. Testar token de exemplo
console.log('\n3️⃣ TESTE DE TOKEN JWT:');
const sampleToken = process.argv[2]; // Token pode ser passado como argumento

if (sampleToken) {
  console.log('   Token fornecido:', sampleToken.substring(0, 30) + '...');
  
  // Decodificar sem verificar
  try {
    const decoded = jwt.decode(sampleToken);
    console.log('   Payload decodificado:', JSON.stringify(decoded, null, 2));
  } catch (error) {
    console.log('   ❌ Erro ao decodificar token:', error);
  }
  
  // Validar com múltiplos secrets
  const validation = validateJWTWithMultipleSecrets(sampleToken);
  if (validation.success) {
    console.log('   ✅ Token válido! Secret usado:', validation.usedSecret?.substring(0, 5) + '...');
  } else {
    console.log('   ❌ Token inválido:', validation.error);
  }
} else {
  console.log('   ℹ️  Nenhum token fornecido. Use: npx tsx src/scripts/diagnose-auth.ts <TOKEN>');
}

// 4. Testar endpoint problemático
console.log('\n4️⃣ TESTE DO ENDPOINT /users/stats:');
async function testUsersStatsEndpoint() {
  try {
    const statsUrl = new URL('/users/stats', backendUrl).toString();
    console.log(`   Testando: ${statsUrl}`);
    
    const response = await fetch(statsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Adicionar token se fornecido
        ...(sampleToken ? { 'Authorization': `Bearer ${sampleToken}` } : {})
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    // Verificar redirecionamentos
    if (response.redirected) {
      console.log(`   ⚠️  Redirecionado para: ${response.url}`);
    }
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      console.log('   ✅ Endpoint retornando JSON');
      console.log(`   Dados: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
      const text = await response.text();
      console.log('   ❌ Endpoint retornando HTML/texto em vez de JSON');
      console.log(`   Resposta: ${text.substring(0, 300)}...`);
      
      // Verificar se é uma página de erro comum
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        console.log('   📄 Parece ser uma página HTML (possível erro 404 ou página de login)');
      }
      if (text.includes('404') || text.includes('Not Found')) {
        console.log('   ❌ Possível erro 404 - endpoint não encontrado');
      }
      if (text.includes('login') || text.includes('signin')) {
        console.log('   🔐 Possível redirecionamento para página de login');
      }
    }
  } catch (error) {
    console.log('   ❌ Erro ao testar endpoint:', error);
  }
}

// Executar testes
(async () => {
  await testBackendConnection();
  await testUsersStatsEndpoint();
  
  console.log('\n📋 RESUMO:');
  console.log('- Verifique se as variáveis de ambiente estão corretas');
  console.log('- Verifique se o backend está acessível e retornando JSON');
  console.log('- Verifique se os secrets JWT estão sincronizados entre frontend e backend');
  console.log('- Se o backend está retornando HTML, pode ser um problema de roteamento ou proxy');
})();