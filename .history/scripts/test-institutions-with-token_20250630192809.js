#!/usr/bin/env node

/**
 * Script para testar o endpoint /api/institutions com token válido
 */

const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const JWT_SECRET = 'ExagonTech';
const BACKEND_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3000/api';

async function getValidToken() {
  console.log('🔐 OBTENDO TOKEN VÁLIDO DO BACKEND');
  console.log('==================================');
  
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
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data && data.data.token) {
        console.log('✅ Token obtido com sucesso');
        console.log('🔑 Token:', data.data.token.substring(0, 50) + '...');
        
        // Validar o token
        const decoded = jwt.verify(data.data.token, JWT_SECRET);
        console.log('✅ Token validado:', {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          exp: new Date(decoded.exp * 1000).toISOString()
        });
        
        return data.data.token;
      }
    }
    
    console.error('❌ Falha ao obter token');
    return null;
  } catch (error) {
    console.error('❌ Erro ao obter token:', error.message);
    return null;
  }
}

async function testBackendInstitutions(token) {
  console.log('\n🏢 TESTANDO BACKEND /api/institutions');
  console.log('====================================');
  
  try {
    const response = await fetch(`${BACKEND_URL}/institutions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 Status:', response.status);
    console.log('📄 Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend institutions funcionando');
      console.log('📊 Estrutura:', Object.keys(data));
      console.log('📊 Dados:', typeof data.data, Array.isArray(data.data) ? `Array com ${data.data.length} itens` : 'Não é array');
    } else {
      const errorText = await response.text();
      console.error('❌ Erro no backend:', response.status, errorText);
      
      if (response.status === 401) {
        console.log('\n🔍 ANÁLISE DO ERRO 401:');
        try {
          const errorData = JSON.parse(errorText);
          console.log('📋 Detalhes:', errorData);
          
          if (errorData.debug && errorData.debug.includes('invalid signature')) {
            console.log('🚨 PROBLEMA: Assinatura JWT inválida no backend');
          }
        } catch (e) {
          console.log('📋 Erro (texto):', errorText);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro na requisição backend:', error.message);
  }
}

async function testFrontendInstitutions(token) {
  console.log('\n🌐 TESTANDO FRONTEND /api/institutions');
  console.log('=====================================');
  
  try {
    const response = await fetch(`${FRONTEND_URL}/institutions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 Status:', response.status);
    console.log('📄 Content-Type:', response.headers.get('content-type'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Frontend institutions funcionando');
      console.log('📊 Estrutura:', Object.keys(data));
      console.log('📊 Dados:', typeof data.data, Array.isArray(data.data) ? `Array com ${data.data.length} itens` : 'Não é array');
    } else {
      const errorText = await response.text();
      console.error('❌ Erro no frontend:', response.status, errorText);
      
      if (response.status === 401) {
        console.log('\n🔍 ANÁLISE DO ERRO 401:');
        try {
          const errorData = JSON.parse(errorText);
          console.log('📋 Detalhes:', errorData);
          
          if (errorData.debug && errorData.debug.includes('invalid signature')) {
            console.log('🚨 PROBLEMA: Assinatura JWT inválida no frontend');
          }
        } catch (e) {
          console.log('📋 Erro (texto):', errorText);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro na requisição frontend:', error.message);
  }
}

async function testTokenValidation(token) {
  console.log('\n🔑 VALIDAÇÃO MANUAL DO TOKEN');
  console.log('============================');
  
  try {
    // Decodificar sem verificar assinatura
    const decoded = jwt.decode(token);
    console.log('📋 Payload decodificado:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions?.length || 0,
      iat: new Date(decoded.iat * 1000).toISOString(),
      exp: new Date(decoded.exp * 1000).toISOString(),
      isExpired: decoded.exp < Math.floor(Date.now() / 1000)
    });
    
    // Verificar assinatura
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('✅ Assinatura válida');
    
    // Verificar se o token está expirado
    const now = Math.floor(Date.now() / 1000);
    if (verified.exp < now) {
      console.log('⚠️ Token expirado');
    } else {
      console.log('✅ Token ainda válido por', Math.floor((verified.exp - now) / 60), 'minutos');
    }
    
  } catch (error) {
    console.error('❌ Erro na validação:', error.message);
  }
}

async function main() {
  console.log('🔍 TESTE COMPLETO DO ENDPOINT INSTITUTIONS');
  console.log('==========================================\n');
  
  // 1. Obter token válido
  const token = await getValidToken();
  
  if (!token) {
    console.error('💥 Não foi possível obter token válido. Abortando testes.');
    return;
  }
  
  // 2. Validar token manualmente
  await testTokenValidation(token);
  
  // 3. Testar backend direto
  await testBackendInstitutions(token);
  
  // 4. Testar frontend (proxy)
  await testFrontendInstitutions(token);
  
  console.log('\n📋 CONCLUSÃO');
  console.log('============');
  console.log('Se ambos os testes passaram, o problema não é com JWT.');
  console.log('Se apenas um falhou, o problema está nesse componente específico.');
  console.log('Se ambos falharam com erro 401, há problema na validação JWT.');
}

main().catch(console.error);