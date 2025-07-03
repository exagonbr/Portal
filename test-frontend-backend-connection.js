const https = require('https');
const http = require('http');

async function testFrontendBackendConnection() {
  console.log('🧪 Testando Conexão Frontend -> Backend...');
  console.log('==================================================');

  // Simular requisição do frontend para a API de settings
  const frontendApiUrl = 'http://localhost:3000/api/settings';
  
  console.log(`🔍 Testando rota do frontend: ${frontendApiUrl}`);
  
  try {
    const response = await makeRequest(frontendApiUrl, 'http');
    console.log(`📊 Status: ${response.statusCode}`);
    
    if (response.data.length === 0) {
      console.log('❌ Resposta vazia');
    } else {
      console.log(`📄 Resposta (${response.data.length} bytes):`, response.data.substring(0, 300) + '...');
      
      try {
        const jsonData = JSON.parse(response.data);
        console.log('✅ JSON válido');
        console.log('📋 Estrutura:', Object.keys(jsonData));
        
        if (jsonData.success) {
          console.log('✅ Requisição bem-sucedida');
          if (jsonData.fallback) {
            console.log('⚠️  Usando dados de fallback - backend pode não estar acessível');
          } else {
            console.log('✅ Dados do backend carregados com sucesso');
          }
        } else {
          console.log('❌ Requisição falhou:', jsonData.message);
          if (jsonData.details) {
            console.log('🔍 Detalhes do erro:', jsonData.details);
          }
        }
      } catch (e) {
        console.log(`❌ JSON inválido: ${e.message}`);
        console.log('📝 Raw response:', response.data.substring(0, 500));
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao acessar frontend: ${error.message}`);
    
    // Se o frontend não estiver rodando, testar diretamente o backend
    console.log('\n🔄 Frontend não disponível, testando backend diretamente...');
    
    try {
      const backendResponse = await makeRequest('http://localhost:3001/apisettings/public', 'http');
      console.log(`📊 Backend Status: ${backendResponse.statusCode}`);
      
      if (backendResponse.statusCode === 200) {
        console.log('✅ Backend está funcionando corretamente');
        console.log('💡 Solução: Inicie o frontend com "npm run dev"');
      }
    } catch (backendError) {
      console.log(`❌ Backend também não está acessível: ${backendError.message}`);
    }
  }
  
  console.log('\n==================================================');
  console.log('✅ Teste concluído!');
}

function makeRequest(url, protocol = 'https', timeout = 10000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = protocol === 'https' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (protocol === 'https' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        data: data
      }));
    });

    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

testFrontendBackendConnection().catch(console.log);