#!/usr/bin/env node

/**
 * Script para testar especificamente o login do backend
 */

const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const JWT_SECRET = 'ExagonTech';
const BACKEND_URL = 'https://portal.sabercon.com.br/api';

async function testBackendLoginDetailed() {
  console.log('🔍 TESTE DETALHADO DO LOGIN DO BACKEND');
  console.log('=====================================\n');
  
  const testCredentials = {
    email: 'admin@sabercon.edu.br',
    password: 'password123'
  };
  
  console.log('📋 Credenciais de teste:', {
    email: testCredentials.email,
    password: '[OCULTA]'
  });
  
  try {
    console.log(`🌐 Fazendo requisição para: ${BACKEND_URL}/auth/optimized/login`);
    
    const response = await fetch(`${BACKEND_URL}/auth/optimized/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testCredentials)
    });
    
    console.log('\n📡 RESPOSTA DO SERVIDOR:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    // Obter o texto da resposta primeiro
    const responseText = await response.text();
    console.log('\n📄 CORPO DA RESPOSTA (texto):');
    console.log('Tamanho:', responseText.length, 'caracteres');
    console.log('Primeiros 500 caracteres:', responseText.substring(0, 500));
    
    // Tentar parsear como JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('\n✅ RESPOSTA PARSEADA COMO JSON:');
      console.log('Estrutura:', Object.keys(responseData));
      
      if (responseData.success) {
        console.log('✅ Success:', responseData.success);
        console.log('📝 Message:', responseData.message);
        
        if (responseData.data) {
          console.log('\n📦 DADOS DA RESPOSTA:');
          console.log('Estrutura de data:', Object.keys(responseData.data));
          
          if (responseData.data.token) {
            console.log('🔑 Token encontrado:', responseData.data.token.substring(0, 50) + '...');
            console.log('📏 Tamanho do token:', responseData.data.token.length);
            
            // Tentar validar o token
            try {
              const decoded = jwt.verify(responseData.data.token, JWT_SECRET);
              console.log('✅ Token validado com sucesso');
              console.log('👤 Payload do token:', {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                permissions: decoded.permissions?.length || 0,
                exp: new Date(decoded.exp * 1000).toISOString()
              });
            } catch (jwtError) {
              console.log('❌ Erro ao validar token:', jwtError.message);
            }
          } else {
            console.log('❌ Token não encontrado em data');
          }
          
          if (responseData.data.user) {
            console.log('\n👤 DADOS DO USUÁRIO:');
            console.log('ID:', responseData.data.user.id);
            console.log('Email:', responseData.data.user.email);
            console.log('Nome:', responseData.data.user.name);
            console.log('Role:', responseData.data.user.role);
            console.log('Role Slug:', responseData.data.user.role_slug);
            console.log('Permissões:', responseData.data.user.permissions?.length || 0);
          }
          
          if (responseData.data.refreshToken) {
            console.log('\n🔄 Refresh Token encontrado:', responseData.data.refreshToken.substring(0, 30) + '...');
          }
          
        } else {
          console.log('❌ Campo "data" não encontrado na resposta');
        }
        
      } else {
        console.log('❌ Success:', responseData.success);
        console.log('❌ Message:', responseData.message);
        if (responseData.code) {
          console.log('❌ Code:', responseData.code);
        }
      }
      
    } catch (parseError) {
      console.log('❌ Erro ao parsear JSON:', parseError.message);
      console.log('📄 Resposta como texto:', responseText);
    }
    
  } catch (error) {
    console.log('💥 Erro na requisição:', error.message);
  }
}

async function testDirectTokenValidation() {
  console.log('\n\n🔑 TESTE DE VALIDAÇÃO DIRETA DE TOKEN');
  console.log('====================================');
  
  // Criar um token de teste
  const testPayload = {
    userId: 'test-user',
    email: 'admin@sabercon.edu.br',
    role: 'SYSTEM_ADMIN',
    permissions: ['system:admin'],
    institutionId: 'test-institution',
    sessionId: 'test-session',
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  
  const testToken = jwt.sign(testPayload, JWT_SECRET);
  console.log('✅ Token de teste criado:', testToken.substring(0, 50) + '...');
  
  // Validar o token
  try {
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('✅ Token validado com sucesso');
    console.log('📋 Payload:', decoded);
  } catch (error) {
    console.log('❌ Erro na validação:', error.message);
  }
}

async function main() {
  await testBackendLoginDetailed();
  await testDirectTokenValidation();
  
  console.log('\n📋 RESUMO');
  console.log('=========');
  console.log('🔑 JWT_SECRET usado:', JWT_SECRET);
  console.log('🌐 Backend URL:', BACKEND_URL);
  console.log('\n💡 Se o token não estiver sendo retornado, verifique:');
  console.log('   1. Se o backend está rodando na porta 3001');
  console.log('   2. Se as credenciais de teste existem no banco');
  console.log('   3. Se a estrutura da resposta está correta');
  console.log('   4. Se há erros no console do backend');
}

main().catch(console.log);