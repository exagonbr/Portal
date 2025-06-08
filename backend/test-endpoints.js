const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
  console.log('🧪 Testando endpoints do backend...\n');

  // Test health check
  try {
    console.log('1. Testando health check...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check OK:', response.data);
  } catch (error) {
    console.log('❌ Health check falhou:', error.message);
  }

  // Test queue endpoint (should return 401 without auth)
  try {
    console.log('\n2. Testando endpoint de queue...');
    const response = await axios.get(`${BASE_URL}/queue/next`);
    console.log('✅ Queue endpoint OK:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Queue endpoint protegido corretamente (401)');
    } else {
      console.log('❌ Queue endpoint erro:', error.message);
    }
  }

  // Test cache endpoint (should return 401 without auth)
  try {
    console.log('\n3. Testando endpoint de cache...');
    const response = await axios.get(`${BASE_URL}/cache/get?key=test`);
    console.log('✅ Cache endpoint OK:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Cache endpoint protegido corretamente (401)');
    } else {
      console.log('❌ Cache endpoint erro:', error.message);
    }
  }

  // Test institutions endpoint (should return 401 without auth)
  try {
    console.log('\n4. Testando endpoint de instituições...');
    const response = await axios.get(`${BASE_URL}/api/institutions`);
    console.log('✅ Institutions endpoint OK:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Institutions endpoint protegido corretamente (401)');
    } else {
      console.log('❌ Institutions endpoint erro:', error.message);
    }
  }

  // Test users endpoint (should return 401 without auth)
  try {
    console.log('\n5. Testando endpoint de usuários...');
    const response = await axios.get(`${BASE_URL}/api/users`);
    console.log('✅ Users endpoint OK:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Users endpoint protegido corretamente (401)');
    } else {
      console.log('❌ Users endpoint erro:', error.message);
    }
  }

  // Test 404 handler
  try {
    console.log('\n6. Testando handler 404...');
    const response = await axios.get(`${BASE_URL}/api/nonexistent`);
    console.log('❌ Deveria retornar 404');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Handler 404 funcionando corretamente');
    } else {
      console.log('❌ Handler 404 erro:', error.message);
    }
  }

  console.log('\n🏁 Teste concluído!');
}

testEndpoints().catch(console.error); 