const https = require('https');

async function quickTest() {
  console.log('🚀 Teste rápido das APIs...\n');
  
  const apis = [
    'https://portal.sabercon.com.br/api/settings',
    'https://portal.sabercon.com.br/api/certificates/search?cpf_last_digits=890'
  ];
  
  for (const url of apis) {
    console.log(`Testing: ${url}`);
    try {
      const response = await makeRequest(url, 5000); // 5s timeout
      console.log(`Status: ${response.statusCode}`);
      
      if (response.data.length === 0) {
        console.log('❌ Resposta vazia');
      } else {
        try {
          JSON.parse(response.data);
          console.log('✅ JSON válido');
        } catch (e) {
          console.log(`❌ JSON inválido: ${e.message}`);
          console.log(`Raw: "${response.data.substring(0, 100)}"`);
        }
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    console.log('---');
  }
}

function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
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

quickTest().catch(console.error);