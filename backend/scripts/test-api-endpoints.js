const axios = require('axios');

// Configuração base
const BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJST0xFX1NZU1RFTV9BRE1JTiIsImlhdCI6MTczNDI5NzEwMCwiZXhwIjoxNzM0MzgzNTAwfQ.example'; // Token de exemplo

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': AUTH_TOKEN,
    'Content-Type': 'application/json'
  }
});

async function testVideoCollectionsAPI() {
  console.log('🚀 Testando APIs de Coleções de Vídeos...\n');

  try {
    // 1. Testar endpoint de listagem
    console.log('📋 1. Testando listagem de coleções...');
    try {
      const response = await api.get('/video-collections/manage');
      console.log('✅ Status:', response.status);
      console.log('✅ Dados:', response.data.message);
      console.log('✅ Total de coleções:', response.data.data?.collections?.length || 0);
    } catch (error) {
      console.log('❌ Erro na listagem:', error.response?.status, error.response?.data?.message || error.message);
    }

    // 2. Testar criação de coleção
    console.log('\n📝 2. Testando criação de coleção...');
    const newCollection = {
      name: 'Teste API - Física Moderna',
      synopsis: 'Coleção sobre conceitos de física moderna criada via API',
      producer: 'Teste Automatizado',
      release_date: '2024-01-01',
      contract_expiry_date: '2025-12-31',
      authors: ['Dr. Einstein', 'Dr. Planck'],
      target_audience: ['ENSINO_MEDIO'],
      total_hours: '03:45:00',
      poster_image_url: 'https://example.com/poster.jpg',
      use_default_cover_for_videos: true,
      popularity: 7.8,
      vote_average: 4.1,
      vote_count: 89
    };

    try {
      const response = await api.post('/video-collections/manage', newCollection);
      console.log('✅ Status:', response.status);
      console.log('✅ Coleção criada:', response.data.data?.collection?.id);
      console.log('✅ Nome:', response.data.data?.collection?.name);
      
      const collectionId = response.data.data?.collection?.id;
      
      if (collectionId) {
        // 3. Testar busca específica
        console.log('\n🔍 3. Testando busca de coleção específica...');
        try {
          const getResponse = await api.get(`/video-collections/manage/${collectionId}`);
          console.log('✅ Status:', getResponse.status);
          console.log('✅ Coleção encontrada:', getResponse.data.data?.collection?.name);
          console.log('✅ Total de vídeos:', getResponse.data.data?.collection?.videos?.length || 0);
        } catch (error) {
          console.log('❌ Erro na busca:', error.response?.status, error.response?.data?.message || error.message);
        }

        // 4. Testar criação de vídeo
        console.log('\n🎥 4. Testando criação de vídeo...');
        const newVideo = {
          collection_id: collectionId,
          module_number: 1,
          title: 'Introdução à Relatividade',
          synopsis: 'Conceitos básicos da teoria da relatividade de Einstein',
          release_year: 2024,
          duration: '00:45:30',
          education_cycle: 'ENSINO_MEDIO',
          poster_image_url: 'https://example.com/video-poster.jpg',
          video_url: 'https://example.com/video.mp4'
        };

        try {
          const videoResponse = await api.post('/video-collections/manage/videos', newVideo);
          console.log('✅ Status:', videoResponse.status);
          console.log('✅ Vídeo criado:', videoResponse.data.data?.video?.id);
          console.log('✅ Título:', videoResponse.data.data?.video?.title);
        } catch (error) {
          console.log('❌ Erro na criação do vídeo:', error.response?.status, error.response?.data?.message || error.message);
        }

        // 5. Testar atualização
        console.log('\n✏️  5. Testando atualização de coleção...');
        try {
          const updateData = {
            synopsis: 'Coleção ATUALIZADA sobre conceitos de física moderna',
            popularity: 8.5
          };
          
          const updateResponse = await api.put(`/video-collections/manage/${collectionId}`, updateData);
          console.log('✅ Status:', updateResponse.status);
          console.log('✅ Coleção atualizada:', updateResponse.data.data?.collection?.synopsis);
        } catch (error) {
          console.log('❌ Erro na atualização:', error.response?.status, error.response?.data?.message || error.message);
        }
      }
    } catch (error) {
      console.log('❌ Erro na criação:', error.response?.status, error.response?.data?.message || error.message);
    }

    // 6. Testar API pública
    console.log('\n🌐 6. Testando API pública...');
    try {
      const publicResponse = await api.get('/video-collections/public');
      console.log('✅ Status:', publicResponse.status);
      console.log('✅ Coleções públicas:', publicResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Erro na API pública:', error.response?.status, error.response?.data?.message || error.message);
    }

    // 7. Testar pesquisa
    console.log('\n🔎 7. Testando pesquisa...');
    try {
      const searchResponse = await api.get('/video-collections/public/search?q=física');
      console.log('✅ Status:', searchResponse.status);
      console.log('✅ Resultados da pesquisa:', searchResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Erro na pesquisa:', error.response?.status, error.response?.data?.message || error.message);
    }

    // 8. Testar estatísticas de migração
    console.log('\n📊 8. Testando estatísticas de migração...');
    try {
      const statsResponse = await api.get('/video-collections/migration/stats');
      console.log('✅ Status:', statsResponse.status);
      console.log('✅ Estatísticas:', statsResponse.data.data);
    } catch (error) {
      console.log('❌ Erro nas estatísticas:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Teste de APIs concluído!');
    console.log('\n📋 Resumo dos endpoints testados:');
    console.log('- GET /video-collections/manage (Listar coleções)');
    console.log('- POST /video-collections/manage (Criar coleção)');
    console.log('- GET /video-collections/manage/:id (Buscar coleção)');
    console.log('- PUT /video-collections/manage/:id (Atualizar coleção)');
    console.log('- POST /video-collections/manage/videos (Criar vídeo)');
    console.log('- GET /video-collections/public (API pública)');
    console.log('- GET /video-collections/public/search (Pesquisa)');
    console.log('- GET /video-collections/migration/stats (Estatísticas)');

  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

// Executar o teste
testVideoCollectionsAPI(); 