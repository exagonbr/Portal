const http = require('http');

async function testLocalBackend() {
  console.log('🧪 Testando Backend Local...');
  console.log('==================================================');

  const testUrls = [
    'http://localhost:3001/apisettings/public',
    'http://localhost:3001/apisystem-settings/public',
    'http://localhost:3001/api/settings/public',
    'http://localhost:3001/api/system-settings/public'
  ];
  
  for (const url of testUrls) {
    console.log(`\n🔍 Testando: ${url}`);
    
    try {
      const response = await makeRequest(url);
      console.log(`📊 Status: ${response.statusCode}`);
      
      if (response.data.length === 0) {
        console.log('❌ Resposta vazia');
      } else {
        console.log(`📄 Resposta (${response.data.length} bytes):`, response.data.substring(0, 200) + '...');
        
        try {
          const jsonData = JSON.parse(response.data);
          console.log('✅ JSON válido');
          console.log('📋 Estrutura:', Object.keys(jsonData));
        } catch (e) {
          console.log(`❌ JSON inválido: ${e.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
  }
  
  console.log('\n==================================================');
  console.log('✅ Teste concluído!');
}

function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
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

testLocalBackend().catch(console.log);