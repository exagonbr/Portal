const axios = require('axios');

const BASE_URL = 'https://portal.sabercon.com.br/api/tv-shows';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMzc1MjgwMCwiZXhwIjoxNzMzODM5MjAwfQ.P3qOI0QVyxPjJb3sTWEz_EjJP_Ysf7mKdJYqGl4vSho';

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testTvShowCRUD() {
  console.log('🧪 Testando CRUD completo de TV Shows...\n');

  try {
    // 1. Testar listagem de TV Shows
    console.log('📋 1. Testando listagem de TV Shows...');
    const listResponse = await axios.get(BASE_URL, { headers });
    console.log(`✅ Status: ${listResponse.status}`);
    console.log(`📊 Total de coleções: ${listResponse.data.data?.tvShows?.length || 0}`);
    console.log(`📄 Página atual: ${listResponse.data.data?.page || 1}`);
    
    if (listResponse.data.data?.tvShows?.length > 0) {
      const firstTvShow = listResponse.data.data.tvShows[0];
      console.log(`🎬 Primeira coleção: ${firstTvShow.name}`);
      console.log(`📹 Vídeos: ${firstTvShow.video_count || 0}`);
    }

    // 2. Testar busca por ID específico
    console.log('\n🔍 2. Testando busca por ID...');
    const tvShowId = 5; // ID da primeira coleção encontrada
    
    try {
      const getResponse = await axios.get(`${BASE_URL}/${tvShowId}`, { headers });
      console.log(`✅ Status: ${getResponse.status}`);
      console.log(`📝 Nome: ${getResponse.data.data.name}`);
      console.log(`📖 Overview: ${getResponse.data.data.overview?.substring(0, 50)}...`);
      console.log(`🎭 Produtor: ${getResponse.data.data.producer || 'N/A'}`);
      console.log(`📹 Vídeos carregados: ${getResponse.data.data.videos?.length || 0}`);
      console.log(`❓ Questões carregadas: ${getResponse.data.data.questions?.length || 0}`);
    } catch (error) {
      console.log(`❌ Erro ao buscar ID ${tvShowId}: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 3. Testar estrutura de módulos
    console.log('\n🏗️ 3. Testando estrutura de módulos...');
    try {
      const modulesResponse = await axios.get(`${BASE_URL}/${tvShowId}/modules`, { headers });
      console.log(`✅ Status: ${modulesResponse.status}`);
      const modules = modulesResponse.data.data || {};
      console.log(`📚 Módulos encontrados: ${Object.keys(modules).length}`);
      
      Object.entries(modules).forEach(([moduleKey, videos]) => {
        console.log(`  📁 ${moduleKey}: ${videos.length} vídeos`);
        if (videos.length > 0) {
          console.log(`    📹 Primeiro vídeo: ${videos[0].title}`);
          console.log(`    ⏱️ Duração: ${videos[0].duration || 'N/A'}`);
        }
      });
    } catch (error) {
      console.log(`❌ Erro ao buscar módulos: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 4. Testar estatísticas
    console.log('\n📊 4. Testando estatísticas...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/${tvShowId}/stats`, { headers });
      console.log(`✅ Status: ${statsResponse.status}`);
      const stats = statsResponse.data.data;
      console.log(`📹 Total de vídeos: ${stats.videoCount}`);
      console.log(`❓ Total de questões: ${stats.questionCount}`);
      console.log(`📁 Total de arquivos: ${stats.fileCount}`);
    } catch (error) {
      console.log(`❌ Erro ao buscar estatísticas: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 5. Testar busca com filtro
    console.log('\n🔎 5. Testando busca com filtro...');
    try {
      const searchResponse = await axios.get(`${BASE_URL}?search=coleção`, { headers });
      console.log(`✅ Status: ${searchResponse.status}`);
      console.log(`🔍 Resultados da busca: ${searchResponse.data.data?.tvShows?.length || 0}`);
    } catch (error) {
      console.log(`❌ Erro na busca: ${error.response?.status} - ${error.response?.data?.message}`);
    }

    // 6. Testar criação de nova coleção
    console.log('\n➕ 6. Testando criação de nova coleção...');
    const newTvShowData = {
      name: 'Coleção de Teste - CRUD',
      overview: 'Esta é uma coleção criada para testar o sistema CRUD completo de TV Shows.',
      producer: 'Sistema de Testes',
      popularity: 8.5,
      vote_average: 4.2,
      vote_count: 150,
      total_load: '10 horas',
      original_language: 'pt-BR'
    };

    try {
      const createResponse = await axios.post(BASE_URL, newTvShowData, { headers });
      console.log(`✅ Status: ${createResponse.status}`);
      console.log(`🆕 Nova coleção criada: ${createResponse.data.data.name}`);
      console.log(`🆔 ID: ${createResponse.data.data.id}`);
      
      const newTvShowId = createResponse.data.data.id;

      // 7. Testar atualização
      console.log('\n✏️ 7. Testando atualização...');
      const updateData = {
        overview: 'Overview atualizada via teste CRUD - Sistema funcionando perfeitamente!',
        popularity: 9.0
      };

      const updateResponse = await axios.put(`${BASE_URL}/${newTvShowId}`, updateData, { headers });
      console.log(`✅ Status: ${updateResponse.status}`);
      console.log(`📝 Coleção atualizada: ${updateResponse.data.data.name}`);
      console.log(`📖 Nova overview: ${updateResponse.data.data.overview?.substring(0, 50)}...`);

      // 8. Testar criação de vídeo
      console.log('\n🎬 8. Testando criação de vídeo...');
      const videoData = {
        title: 'Vídeo de Teste - Módulo 1',
        description: 'Este é um vídeo de teste para validar o sistema.',
        duration: '00:15:30',
        module_number: 1,
        episode_number: 1,
        order_in_module: 1,
        tv_show_id: newTvShowId,
        poster_url: '/images/test-poster.jpg',
        video_url: '/videos/test-video.mp4'
      };

      const createVideoResponse = await axios.post(`${BASE_URL}/videos`, videoData, { headers });
      console.log(`✅ Status: ${createVideoResponse.status}`);
      console.log(`🎬 Novo vídeo criado: ${createVideoResponse.data.data.title}`);
      console.log(`📹 Módulo: M${createVideoResponse.data.data.module_number.toString().padStart(2, '0')}`);
      console.log(`📺 Episódio: EP${createVideoResponse.data.data.episode_number.toString().padStart(2, '0')}`);

      // 9. Testar criação de questão
      console.log('\n❓ 9. Testando criação de questão...');
      const questionData = {
        question_text: 'Qual é o principal objetivo desta coleção de teste?',
        question_type: 'multiple_choice',
        order_number: 1,
        tv_show_id: newTvShowId
      };

      const createQuestionResponse = await axios.post(`${BASE_URL}/questions`, questionData, { headers });
      console.log(`✅ Status: ${createQuestionResponse.status}`);
      console.log(`❓ Nova questão criada: ${createQuestionResponse.data.data.question_text}`);
      
      const questionId = createQuestionResponse.data.data.id;

      // 10. Testar criação de respostas
      console.log('\n💬 10. Testando criação de respostas...');
      const answers = [
        { answer_text: 'Testar o sistema CRUD', is_correct: true, order_number: 1, question_id: questionId },
        { answer_text: 'Criar conteúdo educacional', is_correct: false, order_number: 2, question_id: questionId },
        { answer_text: 'Gerenciar vídeos', is_correct: false, order_number: 3, question_id: questionId }
      ];

      for (const answerData of answers) {
        const createAnswerResponse = await axios.post(`${BASE_URL}/answers`, answerData, { headers });
        console.log(`✅ Resposta criada: ${createAnswerResponse.data.data.answer_text} ${createAnswerResponse.data.data.is_correct ? '(✓ Correta)' : '(✗ Incorreta)'}`);
      }

      // 11. Testar remoção (soft delete)
      console.log('\n🗑️ 11. Testando remoção (soft delete)...');
      const deleteResponse = await axios.delete(`${BASE_URL}/${newTvShowId}`, { headers });
      console.log(`✅ Status: ${deleteResponse.status}`);
      console.log(`🗑️ Coleção removida com sucesso`);

    } catch (error) {
      console.log(`❌ Erro na criação: ${error.response?.status} - ${error.response?.data?.message}`);
      console.log('📋 Dados enviados:', JSON.stringify(newTvShowData, null, 2));
    }

    console.log('\n🎉 Teste CRUD completo finalizado!');

  } catch (error) {
    console.log('❌ Erro geral no teste:', error.message);
    if (error.response) {
      console.log('📄 Status:', error.response.status);
      console.log('📋 Dados:', error.response.data);
    }
  }
}

testTvShowCRUD(); 