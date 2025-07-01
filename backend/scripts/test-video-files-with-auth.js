const axios = require('axios');

const BASE_URL = 'https://portal.sabercon.com.br/api';

// Credenciais de teste (usando o admin criado anteriormente)
const TEST_CREDENTIALS = {
  email: 'admin@portal.com',
  password: 'admin123'
};

let authToken = null;

async function login() {
  try {
    console.log('🔐 Fazendo login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      console.log('✅ Login realizado com sucesso!');
      return true;
    } else {
      console.log('❌ Falha no login:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro no login:', error.response?.data || error.message);
    return false;
  }
}

function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
}

async function testVideoFiles() {
  console.log('🎬 Testando busca de vídeos com arquivos...\n');

  // Primeiro fazer login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Não foi possível fazer login. Abortando teste.');
    return;
  }

  try {
    // 1. Listar todos os TV Shows
    console.log('\n📋 1. Listando TV Shows disponíveis...');
    const showsResponse = await axios.get(`${BASE_URL}/tv-shows`, {
      headers: getAuthHeaders()
    });
    console.log(`✅ Status: ${showsResponse.status}`);
    
    const shows = showsResponse.data?.data?.tvShows || [];
    console.log(`📊 Encontrados ${shows.length} TV Shows`);
    
    if (shows.length > 0) {
      const firstShow = shows[0];
      console.log(`🎯 Testando com TV Show: "${firstShow.name}" (ID: ${firstShow.id})`);
      
      // 2. Buscar módulos/vídeos do primeiro show
      console.log(`\n📂 2. Buscando módulos do TV Show ${firstShow.id}...`);
      const modulesResponse = await axios.get(`${BASE_URL}/tv-shows/${firstShow.id}/modules`, {
        headers: getAuthHeaders()
      });
      console.log(`✅ Status: ${modulesResponse.status}`);
      
      const modules = modulesResponse.data?.data || {};
      console.log(`📊 Encontrados ${Object.keys(modules).length} módulos`);
      
      // 3. Analisar os vídeos encontrados
      let totalVideos = 0;
      let videosWithUrls = 0;
      let videosWithCloudFrontUrls = 0;
      
      Object.entries(modules).forEach(([moduleKey, videos]) => {
        console.log(`\n📂 Módulo: ${moduleKey}`);
        console.log(`   📹 Vídeos: ${videos.length}`);
        
        videos.forEach((video, index) => {
          totalVideos++;
          if (video.video_url) {
            videosWithUrls++;
            if (video.video_url.includes('cloudfront.net')) {
              videosWithCloudFrontUrls++;
            }
          }
          
          console.log(`   🎥 ${index + 1}. ${video.title}`);
          console.log(`      📍 ID: ${video.id}`);
          console.log(`      🔗 URL: ${video.video_url || 'SEM URL'}`);
          console.log(`      📄 Arquivo: ${video.file_sha256hex || 'N/A'}.${video.file_extension || 'N/A'}`);
          console.log(`      📏 Tamanho: ${video.file_size ? (video.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}`);
          console.log(`      🎭 Tipo: ${video.file_mimetype || 'N/A'}`);
          console.log(`      🏷️ Sessão: ${video.session_number || 'N/A'}`);
          console.log(`      🔢 Episódio: ${video.episode_number || 'N/A'}`);
          console.log('');
        });
      });
      
      console.log(`\n📊 Resumo:`);
      console.log(`   📹 Total de vídeos: ${totalVideos}`);
      console.log(`   🔗 Vídeos com URL: ${videosWithUrls}`);
      console.log(`   ☁️ URLs do CloudFront: ${videosWithCloudFrontUrls}`);
      console.log(`   ❌ Vídeos sem URL: ${totalVideos - videosWithUrls}`);
      
      // 4. Testar busca de vídeos individuais
      console.log(`\n📋 3. Testando busca de vídeos individuais...`);
      const videosResponse = await axios.get(`${BASE_URL}/tv-shows/${firstShow.id}/videos`, {
        headers: getAuthHeaders()
      });
      console.log(`✅ Status: ${videosResponse.status}`);
      
      const individualVideos = videosResponse.data?.data || [];
      console.log(`📊 Encontrados ${individualVideos.length} vídeos individuais`);
      
      // 5. Verificar se as URLs estão sendo construídas corretamente
      if (totalVideos > 0 && videosWithCloudFrontUrls > 0) {
        console.log(`\n✅ SUCESSO: URLs do CloudFront estão sendo construídas corretamente!`);
        console.log(`   🎯 ${videosWithCloudFrontUrls}/${totalVideos} vídeos têm URLs do CloudFront`);
      } else if (totalVideos > 0) {
        console.log(`\n⚠️ ATENÇÃO: Vídeos encontrados mas sem URLs do CloudFront`);
        console.log(`   🔍 Pode ser que não existam arquivos vinculados nas tabelas video_file/file`);
      } else {
        console.log(`\n❌ PROBLEMA: Nenhum vídeo encontrado`);
      }
      
    } else {
      console.log('❌ Nenhum TV Show encontrado para testar');
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔐 Erro de autenticação - token pode ter expirado');
    }
  }

  console.log('\n🎉 Teste de vídeos com arquivos concluído!');
}

testVideoFiles(); 