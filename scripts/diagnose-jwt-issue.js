#!/usr/bin/env node

/**
 * Script para diagnosticar problemas de JWT entre frontend e backend
 */

const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const JWT_SECRET = 'ExagonTech';
const BACKEND_URL = 'https://portal.sabercon.com.br/api';
const FRONTEND_URL = 'https://portal.sabercon.com.br/api';

console.log('🔍 DIAGNÓSTICO DE PROBLEMAS JWT');
console.log('================================\n');

async function testJWTGeneration() {
  console.log('1️⃣ TESTE DE GERAÇÃO DE TOKEN JWT');
  console.log('----------------------------------');
  
  // Criar um token de teste
  const testPayload = {
    userId: 'test-user',
    email: 'test@example.com',
    role: 'SYSTEM_ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
  };
  
  const testToken = jwt.sign(testPayload, JWT_SECRET);
  console.log('✅ Token gerado:', testToken.substring(0, 50) + '...');
  console.log('📏 Tamanho do token:', testToken.length);
  
  // Verificar se o token pode ser validado
  try {
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('✅ Token validado com sucesso');
    console.log('👤 Payload decodificado:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      exp: new Date(decoded.exp * 1000).toISOString()
    });
  } catch (error) {
    console.log('❌ Erro ao validar token:', error.message);
  }
  
  return testToken;
}

async function testBackendLogin() {
  console.log('\n2️⃣ TESTE DE LOGIN NO BACKEND');
  console.log('-----------------------------');
  
  try {
    const response = await fetch(`${BACKEND_URL}/auth/optimized/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@sabercon.edu.br',
        password: 'password123'
      })
    });
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📄 Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login bem-sucedido');
      console.log('🔑 Token recebido:', data.token ? data.token.substring(0, 50) + '...' : 'NENHUM');
      
      if (data.token) {
        // Tentar validar o token recebido
        try {
          const decoded = jwt.verify(data.token, JWT_SECRET);
          console.log('✅ Token do backend validado com sucesso');
          console.log('👤 Usuário:', decoded.email || decoded.userId);
        } catch (error) {
          console.log('❌ Token do backend inválido:', error.message);
        }
        
        return data.token;
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erro no login:', errorText);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
  
  return null;
}

async function testFrontendLogin() {
  console.log('\n3️⃣ TESTE DE LOGIN NO FRONTEND');
  console.log('------------------------------');
  
  try {
    const response = await fetch(`${FRONTEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@sabercon.edu.br',
        password: 'password123'
      })
    });
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📄 Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login no frontend bem-sucedido');
      console.log('🔑 Token recebido:', data.token ? data.token.substring(0, 50) + '...' : 'NENHUM');
      
      if (data.token) {
        // Tentar validar o token recebido
        try {
          const decoded = jwt.verify(data.token, JWT_SECRET);
          console.log('✅ Token do frontend validado com sucesso');
          console.log('👤 Usuário:', decoded.email || decoded.userId);
        } catch (error) {
          console.log('❌ Token do frontend inválido:', error.message);
        }
        
        return data.token;
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erro no login frontend:', errorText);
    }
  } catch (error) {
    console.log('❌ Erro na requisição frontend:', error.message);
  }
  
  return null;
}

async function testInstitutionsEndpoint(token) {
  console.log('\n4️⃣ TESTE DO ENDPOINT /api/institutions');
  console.log('-------------------------------------');
  
  if (!token) {
    console.log('⚠️ Nenhum token disponível para teste');
    return;
  }
  
  try {
    const response = await fetch(`${FRONTEND_URL}/institutions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📄 Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint /api/institutions funcionando');
      console.log('📊 Dados recebidos:', typeof data, Object.keys(data || {}));
    } else {
      const errorText = await response.text();
      console.log('❌ Erro no endpoint institutions:', errorText);
    }
  } catch (error) {
    console.log('❌ Erro na requisição institutions:', error.message);
  }
}

async function testDirectBackendInstitutions(token) {
  console.log('\n5️⃣ TESTE DIRETO DO BACKEND /api/institutions');
  console.log('--------------------------------------------');
  
  if (!token) {
    console.log('⚠️ Nenhum token disponível para teste');
    return;
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/institutions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📄 Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend /api/institutions funcionando');
      console.log('📊 Dados recebidos:', typeof data, Object.keys(data || {}));
    } else {
      const errorText = await response.text();
      console.log('❌ Erro no backend institutions:', errorText);
      
      // Se for erro 401, vamos analisar mais detalhadamente
      if (response.status === 401) {
        console.log('\n🔍 ANÁLISE DETALHADA DO ERRO 401:');
        try {
          const errorData = JSON.parse(errorText);
          console.log('📋 Detalhes do erro:', errorData);
          
          if (errorData.debug && errorData.debug.includes('invalid signature')) {
            console.log('🚨 PROBLEMA IDENTIFICADO: Assinatura JWT inválida');
            console.log('💡 Possíveis causas:');
            console.log('   - Chaves JWT diferentes entre frontend e backend');
            console.log('   - Token corrompido durante transmissão');
            console.log('   - Problema na codificação/decodificação');
          }
        } catch (e) {
          console.log('📋 Erro (texto):', errorText);
        }
      }
    }
  } catch (error) {
    console.log('❌ Erro na requisição backend institutions:', error.message);
  }
}

async function main() {
  try {
    // 1. Testar geração de token
    const testToken = await testJWTGeneration();
    
    // 2. Testar login no backend
    const backendToken = await testBackendLogin();
    
    // 3. Testar login no frontend
    const frontendToken = await testFrontendLogin();
    
    // 4. Testar endpoint institutions via frontend
    const tokenToUse = frontendToken || backendToken || testToken;
    await testInstitutionsEndpoint(tokenToUse);
    
    // 5. Testar endpoint institutions direto no backend
    await testDirectBackendInstitutions(tokenToUse);
    
    console.log('\n📋 RESUMO DO DIAGNÓSTICO');
    console.log('========================');
    console.log('🔑 JWT_SECRET:', JWT_SECRET);
    console.log('🌐 Backend URL:', BACKEND_URL);
    console.log('🌐 Frontend URL:', FRONTEND_URL);
    console.log('✅ Token de teste gerado:', !!testToken);
    console.log('✅ Login backend:', !!backendToken);
    console.log('✅ Login frontend:', !!frontendToken);
    
    if (!backendToken && !frontendToken) {
      console.log('\n🚨 PROBLEMA CRÍTICO: Nenhum login funcionou');
      console.log('💡 Verifique se os serviços estão rodando:');
      console.log('   - Backend: npm run dev (porta 3001)');
      console.log('   - Frontend: npm run dev (porta 3000)');
    }
    
  } catch (error) {
    console.log('💥 Erro geral:', error);
  }
}

// Executar diagnóstico
main().catch(console.log);