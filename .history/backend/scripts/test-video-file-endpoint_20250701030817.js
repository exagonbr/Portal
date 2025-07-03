const fetch = require('node-fetch');

// Configuração
const BASE_URL = 'https://portal.sabercon.com.br/api';
const VIDEO_ID = '527'; // ID do vídeo de exemplo do payload fornecido

// Função para fazer login e obter token
async function login() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@portal.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      console.log('✅ Login realizado com sucesso');
      return data.token;
    } else {
      console.error('❌ Erro no login:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error.message);
    return null;
  }
}

// Função para testar o endpoint de video-file
async function testVideoFileEndpoint(token, videoId) {
  try {
    console.log(`\n🔍 Testando endpoint /video-file/${videoId}`);
    
    const response = await fetch(`${BASE_URL}/video-file/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Dados retornados:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('\n✅ SUCESSO! Dados do arquivo encontrados:');
      console.log(`- SHA256: ${data.data.sha256hex}`);
      console.log(`- Extensão: ${data.data.extension}`);
      console.log(`- Nome do arquivo: ${data.data.file_name}`);
      console.log(`- Título do vídeo: ${data.data.video_title}`);
      
      // Construir URL do CloudFront
      if (data.data.sha256hex && data.data.extension) {
        const cloudFrontUrl = `https://d26a2wm7tuz2gu.cloudfront.net/upload/${data.data.sha256hex}${data.data.extension.toLowerCase()}`;
        console.log(`- URL do CloudFront: ${cloudFrontUrl}`);
      }
      
      return true;
    } else {
      console.log('❌ ERRO! Dados não encontrados ou incompletos');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar endpoint:', error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando teste do endpoint /video-file');
  console.log('='.repeat(50));
  
  // 1. Fazer login
  const token = await login();
  if (!token) {
    console.log('❌ Não foi possível obter token de autenticação');
    return;
  }
  
  // 2. Testar endpoint com ID específico
  const success = await testVideoFileEndpoint(token, VIDEO_ID);
  
  console.log('\n' + '='.repeat(50));
  console.log(success ? '✅ TESTE CONCLUÍDO COM SUCESSO!' : '❌ TESTE FALHOU!');
  
  // 3. Testar com outros IDs se disponíveis
  const otherVideoIds = ['528', '529', '530', '531'];
  
  for (const videoId of otherVideoIds) {
    console.log(`\n🔍 Testando vídeo ID: ${videoId}`);
    await testVideoFileEndpoint(token, videoId);
  }
}

// Executar teste
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 