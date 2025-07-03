const https = require('https');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'portal.sabercon.com.br',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = jsonData.length;
    }

    console.log(`\n🔍 Testando: ${method} https://${options.hostname}${path}`);

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Resposta:', responseData);
        
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Erro:', error.message);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testando endpoints do backend...');

  // Teste 1: Health check
  await testEndpoint('/api/health');

  // Teste 2: Status da API de autenticação
  await testEndpoint('/api/auth/optimized/status');

  // Teste 3: Teste de login (debug)
  await testEndpoint('/api/auth/optimized/test-login', 'POST', {
    email: 'admin@exemplo.com',
    password: 'senha123'
  });

  // Teste 4: Login real
  await testEndpoint('/api/auth/optimized/login', 'POST', {
    email: 'admin@exemplo.com',
    password: 'senha123'
  });

  console.log('\n✅ Testes concluídos!');
}

runTests().catch(console.error);