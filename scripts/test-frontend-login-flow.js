#!/usr/bin/env node

/**
 * Script para testar o fluxo completo de login no frontend
 */

const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const JWT_SECRET = 'ExagonTech';
const FRONTEND_URL = 'https://portal.sabercon.com.br';

async function testFrontendLogin() {
  console.log('🔐 TESTANDO FLUXO COMPLETO DE LOGIN NO FRONTEND');
  console.log('===============================================\n');
  
  try {
    // 1. Fazer login via frontend
    console.log('1️⃣ FAZENDO LOGIN VIA FRONTEND');
    console.log('-----------------------------');
    
    const loginResponse = await fetch(`${FRONTEND_URL}/api/auth/login`, {
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
    
    console.log('📡 Status do login:', loginResponse.status);
    console.log('📄 Content-Type:', loginResponse.headers.get('content-type'));
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Erro no login:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido');
    console.log('📊 Estrutura da resposta:', Object.keys(loginData));
    console.log('📊 Dados do usuário:', loginData.data?.user ? 'Presente' : 'Ausente');
    console.log('📊 Token:', loginData.data?.token ? 'Presente' : 'Ausente');
    
    if (!loginData.data?.token) {
      console.error('❌ Token não encontrado na resposta do login');
      return;
    }
    
    const token = loginData.data.token;
    console.log('🔑 Token obtido:', token.substring(0, 50) + '...');
    
    // 2. Validar o token
    console.log('\n2️⃣ VALIDANDO TOKEN');
    console.log('------------------');
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token válido:', {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        exp: new Date(decoded.exp * 1000).toISOString()
      });
    } catch (jwtError) {
      console.error('❌ Token inválido:', jwtError.message);
      return;
    }
    
    // 3. Testar endpoint protegido imediatamente após login
    console.log('\n3️⃣ TESTANDO ENDPOINT PROTEGIDO COM TOKEN RECÉM-OBTIDO');
    console.log('----------------------------------------------------');
    
    const institutionsResponse = await fetch(`${FRONTEND_URL}/api/institutions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 Status institutions:', institutionsResponse.status);
    console.log('📄 Content-Type:', institutionsResponse.headers.get('content-type'));
    
    if (institutionsResponse.ok) {
      const institutionsData = await institutionsResponse.json();
      console.log('✅ Endpoint institutions funcionou com token recém-obtido');
      console.log('📊 Dados:', Array.isArray(institutionsData.data) ? `Array com ${institutionsData.data.length} itens` : 'Não é array');
    } else {
      const errorText = await institutionsResponse.text();
      console.error('❌ Erro no endpoint institutions:', institutionsResponse.status, errorText);
      
      if (institutionsResponse.status === 401) {
        console.log('\n🔍 ANÁLISE DO ERRO 401:');
        try {
          const errorData = JSON.parse(errorText);
          console.log('📋 Detalhes do erro:', errorData);
          
          if (errorData.debug) {
            console.log('🐛 Debug info:', errorData.debug);
            
            if (errorData.debug.includes('invalid signature')) {
              console.log('🚨 PROBLEMA IDENTIFICADO: Assinatura JWT inválida');
              console.log('💡 POSSÍVEIS CAUSAS:');
              console.log('   - JWT_SECRET diferente entre frontend e backend');
              console.log('   - Token sendo modificado durante o transporte');
              console.log('   - Problema na validação do middleware');
            }
          }
        } catch (e) {
          console.log('📋 Erro (texto):', errorText);
        }
      }
    }
    
    // 4. Simular armazenamento no localStorage e testar novamente
    console.log('\n4️⃣ SIMULANDO ARMAZENAMENTO E NOVA REQUISIÇÃO');
    console.log('--------------------------------------------');
    
    // Simular que o token foi armazenado e recuperado do localStorage
    // (isso testa se há algum problema no processo de armazenamento/recuperação)
    
    const storedToken = token; // Simular recuperação do localStorage
    
    const secondInstitutionsResponse = await fetch(`${FRONTEND_URL}/api/institutions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${storedToken}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 Status segunda requisição:', secondInstitutionsResponse.status);
    
    if (secondInstitutionsResponse.ok) {
      console.log('✅ Segunda requisição funcionou - problema não é com armazenamento');
    } else {
      const errorText = await secondInstitutionsResponse.text();
      console.error('❌ Segunda requisição falhou:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

async function testTokenComparison() {
  console.log('\n🔍 COMPARANDO TOKENS ENTRE BACKEND E FRONTEND');
  console.log('=============================================\n');
  
  try {
    // Token do backend direto
    console.log('🏢 OBTENDO TOKEN DO BACKEND DIRETO');
    const backendResponse = await fetch('https://portal.sabercon.com.br/api/auth/optimized/login', {
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
    
    if (!backendResponse.ok) {
      console.error('❌ Erro no backend direto');
      return;
    }
    
    const backendData = await backendResponse.json();
    const backendToken = backendData.data.token;
    
    // Token do frontend (proxy)
    console.log('🌐 OBTENDO TOKEN DO FRONTEND (PROXY)');
    const frontendResponse = await fetch('https://portal.sabercon.com.br/api/auth/login', {
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
    
    if (!frontendResponse.ok) {
      console.error('❌ Erro no frontend');
      return;
    }
    
    const frontendData = await frontendResponse.json();
    const frontendToken = frontendData.data.token;
    
    // Comparar tokens
    console.log('\n🔍 COMPARAÇÃO DE TOKENS:');
    console.log('========================');
    console.log('🏢 Backend token:', backendToken.substring(0, 50) + '...');
    console.log('🌐 Frontend token:', frontendToken.substring(0, 50) + '...');
    console.log('🔄 Tokens iguais:', backendToken === frontendToken ? '✅ SIM' : '❌ NÃO');
    
    if (backendToken !== frontendToken) {
      console.log('\n🚨 TOKENS DIFERENTES - PROBLEMA NO PROXY!');
      
      // Decodificar ambos para comparar
      try {
        const backendDecoded = jwt.decode(backendToken);
        const frontendDecoded = jwt.decode(frontendToken);
        
        console.log('\n📋 BACKEND DECODED:', {
          userId: backendDecoded.userId,
          email: backendDecoded.email,
          role: backendDecoded.role,
          iat: backendDecoded.iat,
          exp: backendDecoded.exp
        });
        
        console.log('📋 FRONTEND DECODED:', {
          userId: frontendDecoded.userId,
          email: frontendDecoded.email,
          role: frontendDecoded.role,
          iat: frontendDecoded.iat,
          exp: frontendDecoded.exp
        });
        
      } catch (decodeError) {
        console.error('❌ Erro ao decodificar tokens:', decodeError.message);
      }
    } else {
      console.log('✅ Tokens idênticos - problema não é no proxy');
    }
    
  } catch (error) {
    console.error('❌ Erro na comparação:', error.message);
  }
}

async function main() {
  await testFrontendLogin();
  await testTokenComparison();
  
  console.log('\n📋 RESUMO DOS TESTES');
  console.log('===================');
  console.log('1. Se o login funcionou mas institutions falhou com 401, o problema é na validação JWT');
  console.log('2. Se os tokens são diferentes, o problema é no proxy do frontend');
  console.log('3. Se os tokens são iguais mas ainda há erro 401, o problema é no middleware de auth');
}

main().catch(console.error);