const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3001,
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

    console.log(`\n🔍 Testando: ${method} http://${options.hostname}:${options.port}${path}`);

    const req = http.request(options, (res) => {
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
      console.log('Erro:', error.message);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testando backend diretamente na porta 3001...');

  try {
    // Teste 1: Health check
    await testEndpoint('/health');

    // Teste 2: Status da API de autenticação
    await testEndpoint('/api/auth/optimized/status');

    // Teste 3: Login real
    await testEndpoint('/api/auth/optimized/login', 'POST', {
      email: 'admin@exemplo.com',
      password: 'senha123'
    });

    console.log('\n✅ Testes concluídos!');
  } catch (error) {
    console.log('❌ Erro durante os testes:', error.message);
  }
}

runTests();