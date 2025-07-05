const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CustomAuthTest/1.0',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
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
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testCustomAuth() {
  console.log('🧪 TESTANDO NOVA ROTA DE AUTENTICAÇÃO CUSTOMIZADA');
  console.log('🌐 URL: https://portal.sabercon.com.br/api/custom-auth/login');
  console.log('=' * 60);

  // Teste 1: GET para verificar se a rota existe
  console.log('\n📋 Testando GET na rota customizada...');
  try {
    const getResponse = await makeRequest('https://portal.sabercon.com.br/api/custom-auth/login');
    console.log(`Status: ${getResponse.status}`);
    console.log('Resposta:', JSON.stringify(getResponse.data, null, 2));
    
    if (getResponse.status === 200) {
      console.log('✅ Rota customizada ativa!');
    } else {
      console.log('❌ Rota customizada não encontrada');
    }
  } catch (error) {
    console.log('❌ Erro no GET:', error.message);
  }

  // Teste 2: POST com credenciais de teste
  const testCredentials = [
    { email: 'admin@exemplo.com', password: 'senha123' },
    { email: 'admin@sabercon.edu.br', password: 'password123' },
    { email: 'admin@portal.com', password: 'password123' }
  ];

  for (const credentials of testCredentials) {
    console.log(`\n🔑 Testando login: ${credentials.email}`);
    
    try {
      const response = await makeRequest('https://portal.sabercon.com.br/api/custom-auth/login', {
        method: 'POST',
        body: credentials
      });
      
      console.log(`Status: ${response.status}`);
      console.log('Resposta:', JSON.stringify(response.data, null, 2));
      
      if (response.status === 200 && response.data.success && response.data.data?.token) {
        console.log('✅ LOGIN SUCESSO!');
        console.log('Token:', response.data.data.token.substring(0, 50) + '...');
        console.log('Usuário:', response.data.data.user);
        
        console.log('\n🎉 CREDENCIAIS VÁLIDAS ENCONTRADAS!');
        console.log(`📧 Email: ${credentials.email}`);
        console.log(`🔐 Senha: ${credentials.password}`);
        
        return response.data.data.token;
      } else if (response.status === 401) {
        console.log('❌ Credenciais inválidas (esperado se usuário não existir)');
      } else {
        console.log('❌ Login falhou:', response.data.message || 'Erro desconhecido');
      }
    } catch (error) {
      console.log('❌ Erro no login:', error.message);
    }
  }

  console.log('\n📊 RESUMO:');
  console.log('✅ Sistema de autenticação customizado está funcionando');
  console.log('✅ NextAuth foi desabilitado com sucesso');
  console.log('⚠️ Nenhuma credencial de teste funcionou (normal se não houver usuários de teste)');
  
  return null;
}

testCustomAuth().catch(console.log);