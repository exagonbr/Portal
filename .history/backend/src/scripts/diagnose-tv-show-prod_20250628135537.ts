import axios from 'axios';

async function diagnoseTvShowProd() {
  const baseUrl = 'https://portal.sabercon.com.br/api';
  
  console.log('🔍 Diagnosticando problema com TV Shows em produção...\n');

  try {
    // 1. Testar se a API está respondendo
    console.log('1. Testando health check...');
    try {
      const healthResponse = await axios.get(`${baseUrl}/health`);
      console.log('✅ API está respondendo:', healthResponse.status);
    } catch (error: any) {
      console.log('❌ Erro no health check:', error.message);
    }

    // 2. Listar TV Shows (sem ID específico)
    console.log('\n2. Listando TV Shows...');
    try {
      const listResponse = await axios.get(`${baseUrl}/tv-shows?limit=5`);
      console.log('✅ Lista de TV Shows retornada com sucesso');
      console.log(`Total de registros: ${listResponse.data.data?.total || 'N/A'}`);
      
      // Verificar se o ID 9 está na lista
      const tvShows = listResponse.data.data?.tvShows || [];
      const hasId9 = tvShows.some((show: any) => show.id === '9' || show.id === 9);
      console.log(`TV Show com ID 9 está na lista? ${hasId9 ? 'SIM' : 'NÃO'}`);
      
      // Mostrar primeiros IDs disponíveis
      if (tvShows.length > 0) {
        console.log('\nPrimeiros IDs disponíveis:');
        tvShows.slice(0, 5).forEach((show: any) => {
          console.log(`- ID: ${show.id} - ${show.name}`);
        });
      }
    } catch (error: any) {
      console.log('❌ Erro ao listar TV Shows:', error.response?.status || error.message);
      if (error.response?.data) {
        console.log('Detalhes:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // 3. Tentar buscar TV Show ID 9
    console.log('\n3. Buscando TV Show ID 9...');
    try {
      const showResponse = await axios.get(`${baseUrl}/tv-shows/9`);
      console.log('✅ TV Show ID 9 encontrado!');
      console.log('Nome:', showResponse.data.data?.name);
    } catch (error: any) {
      console.log('❌ Erro ao buscar TV Show ID 9:', error.response?.status || error.message);
      if (error.response?.data) {
        console.log('Detalhes:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // 4. Tentar outros IDs próximos
    console.log('\n4. Testando IDs próximos...');
    for (let id = 8; id <= 10; id++) {
      try {
        const response = await axios.get(`${baseUrl}/tv-shows/${id}`);
        console.log(`✅ ID ${id}: ${response.data.data?.name || 'OK'}`);
      } catch (error: any) {
        console.log(`❌ ID ${id}: Erro ${error.response?.status || error.message}`);
      }
    }

    // 5. Verificar se é problema de autenticação
    console.log('\n5. Testando com diferentes headers...');
    try {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Portal-Diagnostic/1.0'
      };
      const response = await axios.get(`${baseUrl}/tv-shows/9`, { headers });
      console.log('✅ Com headers customizados: OK');
    } catch (error: any) {
      console.log('❌ Com headers customizados:', error.response?.status || error.message);
    }

  } catch (error) {
    console.error('\n❌ Erro geral:', error);
  }
}

// Executar diagnóstico
diagnoseTvShowProd().then(() => {
  console.log('\n✅ Diagnóstico concluído');
}).catch(error => {
  console.error('\n❌ Erro fatal:', error);
});