const http = require('http');

const testCredentials = [
  { email: 'admin@exemplo.com', password: 'senha123' },
  { email: 'admin@sabercon.edu.br', password: 'password123' },
  { email: 'admin@portal.com', password: 'password123' },
  { email: 'admin@admin.com', password: 'admin' },
  { email: 'test@test.com', password: 'test123' },
  { email: 'user@example.com', password: 'password' }
];

function testLogin(credentials) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(credentials);
    
    const options = {
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api/auth/optimized/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    console.log(`\n🔐 Testando login: ${credentials.email}`);

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ 
            status: res.statusCode, 
            data: json,
            credentials: credentials
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: responseData,
            credentials: credentials
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function testAllCredentials() {
  console.log('🧪 Testando múltiplas credenciais...');
  
  for (const credentials of testCredentials) {
    try {
      const result = await testLogin(credentials);
      
      console.log(`Status: ${result.status}`);
      
      if (result.status === 200 && result.data.success) {
        console.log('✅ LOGIN SUCESSO!');
        console.log('Token:', result.data.data.token.substring(0, 50) + '...');
        console.log('Usuário:', result.data.data.user);
        
        console.log('\n🎉 CREDENCIAIS VÁLIDAS ENCONTRADAS:');
        console.log(`📧 Email: ${credentials.email}`);
        console.log(`🔐 Senha: ${credentials.password}`);
        break;
      } else {
        console.log('❌ Falhou:', result.data.message || result.data);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  }
  
  console.log('\n✅ Teste concluído!');
}

testAllCredentials();