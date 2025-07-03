const axios = require('axios');

const BASE_URL = 'https://portal.sabercon.com.br/api';

async function testRoutes() {
  console.log('🧪 Testando se as rotas estão registradas...\n');

  try {
    // 1. Testar se a rota /tv-shows existe
    console.log('📋 1. Testando rota /tv-shows...');
    const response = await axios.get(`${BASE_URL}/tv-shows`);
    console.log(`✅ Status: ${response.status} - Rota registrada!`);
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`✅ Status: 401 - Rota registrada (erro de autenticação esperado)`);
    } else if (error.response?.status === 404) {
      console.log(`❌ Status: 404 - Rota NÃO registrada`);
    } else {
      console.log(`⚠️ Status: ${error.response?.status} - ${error.message}`);
    }
  }

  try {
    // 2. Testar outras rotas do sistema
    console.log('\n📋 2. Testando outras rotas para comparação...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log(`✅ /health: ${healthResponse.status}`);
    
    const collectionsResponse = await axios.get(`${BASE_URL}/collections`);
    console.log(`⚠️ /collections: ${collectionsResponse.status}`);
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log(`✅ /collections: 401 (autenticação necessária)`);
    } else {
      console.log(`❌ /collections: ${error.response?.status}`);
    }
  }

  console.log('\n🎉 Teste de rotas concluído!');
}

testRoutes(); 