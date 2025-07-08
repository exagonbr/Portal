const https = require('https');

async function testCertificatesAPI() {
  console.log('🧪 Testando API de Certificados...');
  console.log('==================================================');

  const testUrl = 'https://portal.sabercon.com.br/api/certificates/search?cpf_last_digits=6890';
  
  try {
    console.log(`🔍 Testando: GET ${testUrl}`);
    
    const response = await makeRequest(testUrl);
    
    console.log(`📊 Status: ${response.statusCode}`);
    console.log('📋 Headers:', response.headers);
    
    const rawData = response.data;
    console.log(`📄 Raw Response (${rawData.length} bytes):`, rawData.substring(0, 500) + '...');
    
    // Tentar fazer parse do JSON
    try {
      const jsonData = JSON.parse(rawData);
      console.log('✅ JSON válido:', JSON.stringify(jsonData, null, 2).substring(0, 500) + '...');
      
      console.log('\n📊 RESULTADO:');
      console.log(`   Status: ${response.statusCode}`);
      console.log('   Erro: Nenhum');
      console.log('   Dados válidos: true');
      
    } catch (parseError) {
      console.log('❌ Erro de parsing JSON:', parseError.message);
      console.log('📝 Conteúdo que causou erro:', rawData.substring(0, 500) + '...');
      
      console.log('\n📊 RESULTADO:');
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Erro: ${parseError.message}`);
      console.log('   Dados válidos: false');
      
      console.log('\n🚨 PROBLEMA DETECTADO:');
      console.log(`   Erro: ${parseError.message}`);
      console.log(`   Raw Response: "${rawData.substring(0, 200)}"`);
      console.log(`   Tamanho: ${rawData.length} bytes`);
    }
    
  } catch (error) {
    console.log('❌ Falha no teste:', error.message);
    console.log('🚨 Erro de requisição:', error.code || error.message);
  }
  
  console.log('\n==================================================');
  console.log('✅ Teste concluído!');
  console.log('==================================================');
}

function makeRequest(url, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      },
      timeout: timeout
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.setTimeout(timeout);
    req.end();
  });
}

// Executar o teste
testCertificatesAPI().catch(console.log);