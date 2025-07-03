const http = require('http');

// Função para fazer requisição
function testRoute(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\n${path}:`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`Error testing ${path}:`, error);
      resolve();
    });

    req.end();
  });
}

// Testar várias rotas
async function runTests() {
  console.log('🧪 Testando rotas do backend...\n');
  
  await testRoute('/health');
  await testRoute('/api/health');
  await testRoute('/api/settings');
  await testRoute('/api/settings/public');
  await testRoute('/settings/public');
  await testRoute('/api/users');
  await testRoute('/api/auth/validate');
}

runTests();