import axios from 'axios';

async function testProdSimple() {
  console.log('🔍 Teste simples da API de produção\n');

  try {
    // 1. Testar listagem de TV Shows
    console.log('1. Listando TV Shows...');
    const listUrl = 'https://portal.sabercon.com.br/api/tv-shows?limit=10';
    const listResponse = await axios.get(listUrl, { timeout: 10000 });
    
    if (listResponse.data.success) {
      const tvShows = listResponse.data.data?.tvShows || [];
      console.log(`✅ Total de TV Shows: ${listResponse.data.data?.total || 0}`);
      
      // Verificar se ID 9 existe
      const show9 = tvShows.find((s: any) => s.id === '9' || s.id === 9);
      if (show9) {
        console.log(`✅ TV Show ID 9 encontrado na lista: ${show9.name}`);
      } else {
        console.log('❌ TV Show ID 9 NÃO encontrado na lista');
        
        // Mostrar alguns IDs disponíveis
        console.log('\nPrimeiros 5 TV Shows:');
        tvShows.slice(0, 5).forEach((show: any) => {
          console.log(`  - ID ${show.id}: ${show.name}`);
        });
      }
    }
    
    // 2. Testar busca direta do ID 9
    console.log('\n2. Buscando TV Show ID 9 diretamente...');
    try {
      const showUrl = 'https://portal.sabercon.com.br/api/tv-shows/9';
      await axios.get(showUrl, { timeout: 10000 });
      console.log('✅ Requisição bem sucedida (não deveria chegar aqui se está dando erro 500)');
    } catch (error: any) {
      if (error.response) {
        console.log(`❌ Erro ${error.response.status}: ${error.response.statusText}`);
        console.log('Response data:', error.response.data);
      } else {
        console.log('❌ Erro na requisição:', error.message);
      }
    }
    
  } catch (error: any) {
    console.log('❌ Erro geral:', error.message);
  }
}

testProdSimple();