#!/usr/bin/env node

/**
 * Script de teste para o Sistema de Autenticação Otimizado
 * 
 * Este script testa:
 * - Login otimizado
 * - Validação de tokens
 * - Renovação de tokens
 * - Performance
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

// Configuração
const BASE_URL = process.env.API_URL || 'https://portal.sabercon.com.br/api';
const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@exemplo.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'senha123';

console.log('🧪 Iniciando testes do Sistema de Autenticação Otimizado...\n');

async function testOptimizedLogin() {
  console.log('📝 Teste 1: Login Otimizado');
  const startTime = Date.now();

  try {
    const response = await axios.post(`${BASE_URL}/auth/optimized/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const duration = Date.now() - startTime;
    
    if (response.data.success) {
      console.log(`✅ Login bem-sucedido em ${duration}ms`);
      console.log(`📊 Usuário: ${response.data.data.user.name}`);
      console.log(`🔑 Role: ${response.data.data.user.role_slug}`);
      console.log(`🛡️ Permissões: ${response.data.data.user.permissions.length}`);
      console.log(`⏰ Expira em: ${response.data.data.expiresIn}s\n`);
      
      return {
        accessToken: response.data.data.token,
        refreshToken: response.data.data.refreshToken,
        user: response.data.data.user
      };
    } else {
      console.log('❌ Login falhou:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Erro no login:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testTokenValidation(accessToken) {
  console.log('📝 Teste 2: Validação de Token');
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/optimized/validate`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.data.success) {
      console.log('✅ Token válido');
      console.log(`👤 Usuário autenticado: ${response.data.data.user.email}\n`);
      return true;
    } else {
      console.log('❌ Token inválido:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na validação:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testTokenRefresh(refreshToken) {
  console.log('📝 Teste 3: Renovação de Token');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/optimized/refresh`, {
      refreshToken: refreshToken
    });

    if (response.data.success) {
      console.log('✅ Token renovado com sucesso');
      console.log(`⏰ Novo token expira em: ${response.data.data.expiresIn}s\n`);
      return response.data.data.token;
    } else {
      console.log('❌ Falha na renovação:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Erro na renovação:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testProfile(accessToken) {
  console.log('📝 Teste 4: Obter Perfil');
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/optimized/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.data.success) {
      console.log('✅ Perfil obtido com sucesso');
      console.log(`📧 Email: ${response.data.data.user.email}`);
      console.log(`🏢 Instituição: ${response.data.data.user.institution_name || 'N/A'}\n`);
      return true;
    } else {
      console.log('❌ Falha ao obter perfil:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao obter perfil:', error.response?.data?.message || error.message);
    return false;
  }
}

function analyzeJWT(token) {
  console.log('📝 Teste 5: Análise do JWT');
  
  try {
    const decoded = jwt.decode(token, { complete: true });
    
    console.log('✅ JWT decodificado com sucesso');
    console.log(`🔐 Algoritmo: ${decoded.header.alg}`);
    console.log(`📄 Tipo: ${decoded.header.typ}`);
    console.log(`👤 UserID: ${decoded.payload.userId}`);
    console.log(`🏷️ Type: ${decoded.payload.type}`);
    
    const now = Math.floor(Date.now() / 1000);
    const timeToExpiry = decoded.payload.exp - now;
    console.log(`⏰ Expira em: ${timeToExpiry}s (${Math.round(timeToExpiry / 60)}min)\n`);
    
    return true;
  } catch (error) {
    console.log('❌ Erro ao analisar JWT:', error.message);
    return false;
  }
}

async function performanceTest() {
  console.log('📝 Teste 6: Performance (10 logins consecutivos)');
  
  const times = [];
  
  for (let i = 0; i < 10; i++) {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${BASE_URL}/auth/optimized/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      
      const duration = Date.now() - startTime;
      times.push(duration);
      
      if (response.data.success) {
        process.stdout.write(`✅ Login ${i + 1}: ${duration}ms `);
      } else {
        process.stdout.write(`❌ Login ${i + 1}: Falhou `);
      }
    } catch (error) {
      process.stdout.write(`❌ Login ${i + 1}: Erro `);
    }
  }
  
  console.log('\n');
  
  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`📊 Performance Summary:`);
    console.log(`   Média: ${Math.round(avgTime)}ms`);
    console.log(`   Mínimo: ${minTime}ms`);
    console.log(`   Máximo: ${maxTime}ms`);
    console.log(`   Meta: < 200ms ${avgTime < 200 ? '✅' : '❌'}\n`);
  }
}

async function runAllTests() {
  try {
    // Teste 1: Login
    const loginResult = await testOptimizedLogin();
    if (!loginResult) {
      console.log('❌ Teste de login falhou. Parando execução.');
      return;
    }

    // Teste 2: Validação
    await testTokenValidation(loginResult.accessToken);

    // Teste 3: Renovação
    const newToken = await testTokenRefresh(loginResult.refreshToken);

    // Teste 4: Perfil
    await testProfile(loginResult.accessToken);

    // Teste 5: Análise JWT
    analyzeJWT(loginResult.accessToken);

    // Teste 6: Performance
    await performanceTest();

    console.log('🎉 Todos os testes concluídos!');
    console.log('\n📋 Checklist de Produção:');
    console.log('   - [ ] JWT_SECRET configurado');
    console.log('   - [ ] REFRESH_SECRET configurado');
    console.log('   - [ ] HTTPS habilitado');
    console.log('   - [ ] Performance < 200ms');
    console.log('   - [ ] Logs funcionando');

  } catch (error) {
    console.log('❌ Erro geral nos testes:', error.message);
  }
}

// Executar testes
runAllTests(); 