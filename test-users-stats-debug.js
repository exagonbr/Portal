#!/usr/bin/env node

require('dotenv').config(); // Load environment variables
const jwt = require('jsonwebtoken');

async function testUsersStats() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("⚠️  JWT_SECRET not defined in environment variables");
  }
  console.log('🔐 Using JWT_SECRET from environment:', secret.substring(0, 10) + '...');
  
  const payload = {
    userId: 'test-admin-id',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'SYSTEM_ADMIN',
    institutionId: 'test-institution',
    permissions: ['admin', 'read', 'write'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
  };
  
  const token = jwt.sign(payload, secret);
  
  console.log('🧪 Testando API Users/Stats com debug detalhado...\n');
  console.log('🔐 Token gerado:', token.substring(0, 50) + '...');
  
  try {
    const response = await fetch('http://localhost:3001/api/users/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('\n📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('\n📄 Response Body (raw):', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('\n📊 Response Data (parsed):', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('\n✅ API funcionando!');
        console.log('📈 Stats:', data.data);
      } else {
        console.log('\n❌ API retornou erro:', data.message);
        if (data.error) {
          console.log('🔍 Detalhes do erro:', data.error);
        }
      }
    } catch (parseError) {
      console.log('\n❌ Erro ao fazer parse do JSON:', parseError.message);
      console.log('📄 Resposta raw:', responseText);
    }
    
  } catch (error) {
    console.log('\n💥 Erro de conexão:', error.message);
  }
}

// Teste também com token mais simples
async function testWithSimpleToken() {
  console.log('\n\n🔄 Testando com token base64 simples...');
  
  const simplePayload = {
    userId: 'test-user',
    email: 'test@test.com',
    role: 'SYSTEM_ADMIN',
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  
  const base64Token = Buffer.from(JSON.stringify(simplePayload)).toString('base64');
  
  try {
    const response = await fetch('http://localhost:3001/api/users/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${base64Token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const responseText = await response.text();
    console.log('📡 Status:', response.status);
    console.log('📄 Response:', responseText);
    
  } catch (error) {
    console.log('💥 Erro:', error.message);
  }
}

// Teste direto da database
async function testDatabaseConnection() {
  console.log('\n\n🗄️ Testando conexão direta com a database...');
  
  try {
    const response = await fetch('http://localhost:3001/api/institutions?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt.sign({
          userId: 'test',
          email: 'test@test.com',
          role: 'SYSTEM_ADMIN'
        }, secret)}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status da API institutions:', response.status);
    
    if (response.ok) {
      console.log('✅ Database parece estar funcionando (institutions OK)');
    } else {
      console.log('❌ Problema na database ou autenticação');
    }
    
  } catch (error) {
    console.log('💥 Erro ao testar database:', error.message);
  }
}

async function runAllTests() {
  await testUsersStats();
  await testWithSimpleToken();
  await testDatabaseConnection();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Testes de debug concluídos!');
  console.log('💡 Verifique os logs do backend para mais detalhes.');
}

runAllTests().catch(console.error); 