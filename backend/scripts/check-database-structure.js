const axios = require('axios');

const BASE_URL = 'https://portal.sabercon.com.br/api';

// Credenciais de teste
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
    }
    return false;
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

async function checkDatabaseStructure() {
  console.log('🔍 Verificando estrutura do banco de dados...\n');

  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Não foi possível fazer login. Abortando verificação.');
    return;
  }

  try {
    // 1. Buscar um TV Show específico
    console.log('📋 1. Buscando TV Shows...');
    const showsResponse = await axios.get(`${BASE_URL}/tv-shows`, {
      headers: getAuthHeaders()
    });
    
    const shows = showsResponse.data?.data?.tvShows || [];
    console.log(`📊 Encontrados ${shows.length} TV Shows`);
    
    if (shows.length > 0) {
      const testShow = shows[0];
      console.log(`🎯 Testando com: "${testShow.name}" (ID: ${testShow.id})`);
      
      // 2. Buscar vídeos individuais para ver a estrutura
      console.log(`\n📂 2. Verificando vídeos individuais...`);
      const videosResponse = await axios.get(`${BASE_URL}/tv-shows/${testShow.id}/videos`, {
        headers: getAuthHeaders()
      });
      
      const videos = videosResponse.data?.data || [];
      console.log(`📊 Encontrados ${videos.length} vídeos individuais`);
      
      if (videos.length > 0) {
        console.log(`\n🔍 Estrutura do primeiro vídeo:`);
        const firstVideo = videos[0];
        console.log(JSON.stringify(firstVideo, null, 2));
        
        // 3. Testar query SQL direta através de um endpoint de debug
        console.log(`\n📊 3. Testando query com JOINs...`);
        
        // Criar um endpoint temporário ou usar um script SQL direto
        console.log('💡 Sugestão: Verificar manualmente no banco se existem registros em:');
        console.log('   - Tabela video_file');
        console.log('   - Tabela file');
        console.log('   - Relacionamentos entre video -> video_file -> file');
        
        // 4. Verificar se existe algum vídeo com arquivos
        console.log(`\n🔗 4. Verificando vídeos com video_url...`);
        const videosWithUrls = videos.filter(v => v.video_url);
        console.log(`📊 Vídeos com URL: ${videosWithUrls.length}/${videos.length}`);
        
        if (videosWithUrls.length > 0) {
          console.log(`\n📋 Exemplo de vídeo com URL:`);
          console.log(JSON.stringify(videosWithUrls[0], null, 2));
        }
      } else {
        console.log('❌ Nenhum vídeo individual encontrado');
      }
    }
    
  } catch (error) {
    console.log('❌ Erro na verificação:', error.response?.data || error.message);
  }

  console.log('\n🎉 Verificação de estrutura concluída!');
}

checkDatabaseStructure(); 