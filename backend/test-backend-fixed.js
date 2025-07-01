const http = require('http');

const BASE_URL = 'https://portal.sabercon.com.br/api';

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testando endpoints do backend corrigido...\n');

  const tests = [
    {
      name: 'Health Check',
      path: '/health',
      expectedStatus: 200
    },
    {
      name: 'Queue Next (sem auth)',
      path: '/api/queue/next',
      expectedStatus: 401
    },
    {
      name: 'Queue Next (com auth)',
      path: '/api/queue/next',
      expectedStatus: 200,
      headers: { 'Authorization': 'Bearer test-token' }
    },
    {
      name: 'Cache Get (sem auth)',
      path: '/api/cache/get?key=test',
      expectedStatus: 401
    },
    {
      name: 'Cache Get (com auth)',
      path: '/api/cache/get?key=test',
      expectedStatus: 404,
      headers: { 'Authorization': 'Bearer test-token' }
    },
    {
      name: 'Users (sem auth)',
      path: '/api/users',
      expectedStatus: 401
    },
    {
      name: 'Users (com auth)',
      path: '/api/users',
      expectedStatus: 200,
      headers: { 'Authorization': 'Bearer test-token' }
    },
    {
      name: 'Institutions (com auth)',
      path: '/api/institutions',
      expectedStatus: 200,
      headers: { 'Authorization': 'Bearer test-token' }
    },
    {
      name: 'Endpoint inexistente',
      path: '/api/nonexistent',
      expectedStatus: 404
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 Testando: ${test.name}`);
      const response = await makeRequest(test.path, {
        headers: test.headers
      });

      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: Status ${response.status} (esperado: ${test.expectedStatus})`);
        
        // Verificar se há header de tempo de resposta
        if (response.headers['x-response-time']) {
          console.log(`   ⏱️  Tempo de resposta: ${response.headers['x-response-time']}`);
        }
        
        passed++;
      } else {
        console.log(`❌ ${test.name}: Status ${response.status} (esperado: ${test.expectedStatus})`);
        console.log(`   Resposta: ${JSON.stringify(response.data, null, 2)}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Erro - ${error.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('📊 Resumo dos testes:');
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`📈 Taxa de sucesso: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 Todos os testes passaram! Backend funcionando corretamente.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique a configuração do backend.');
  }
}

// Aguardar um pouco antes de testar (caso o servidor esteja iniciando)
setTimeout(() => {
  testEndpoints().catch(console.log);
}, 2000); 