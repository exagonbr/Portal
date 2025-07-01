const axios = require('axios');

const BASE_URL = 'https://portal.sabercon.com.br/api/tv-shows';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMzc1MjgwMCwiZXhwIjoxNzMzODM5MjAwfQ.P3qOI0QVyxPjJb3sTWEz_EjJP_Ysf7mKdJYqGl4vSho';

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testTvShows() {
  console.log('🧪 Testando sistema de TV Shows...\n');

  try {
    // 1. Testar listagem
    console.log('📋 1. Testando listagem...');
    const response = await axios.get(BASE_URL, { headers });
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Coleções encontradas: ${response.data.data?.tvShows?.length || 0}`);

    // 2. Testar busca por ID
    if (response.data.data?.tvShows?.length > 0) {
      const tvShowId = response.data.data.tvShows[0].id;
      console.log(`\n🔍 2. Testando busca por ID: ${tvShowId}`);
      
      const detailResponse = await axios.get(`${BASE_URL}/${tvShowId}`, { headers });
      console.log(`✅ Status: ${detailResponse.status}`);
      console.log(`📝 Nome: ${detailResponse.data.data.name}`);
    }

    console.log('\n🎉 Teste básico concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('📄 Status:', error.response.status);
      console.error('📋 Dados:', error.response.data);
    }
  }
}

testTvShows(); 