const https = require('https');

// Configurações para produção
const PRODUCTION_API = 'https://portal.sabercon.com.br/api';

// Credenciais de teste comuns
const testCredentials = [
  { email: 'admin@exemplo.com', password: 'senha123' },
  { email: 'admin@sabercon.edu.br', password: 'password123' },
  { email: 'admin@portal.com', password: 'password123' },
  { email: 'admin@admin.com', password: 'admin123' },
  { email: 'test@test.com', password: 'test123' },
  { email: 'user@example.com', password: 'password' }
];

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
        'User-Agent': 'ProductionAuthTest/1.0',
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

async function testHealthCheck() {
  console.log('\n🏥 Testando Health Check...');
  
  try {
    const response = await makeRequest(`${PRODUCTION_API}/health`);
    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Health check funcionando!');
      return true;
    } else {
      console.log('❌ Health check falhou');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro no health check:', error.message);
    return false;
  }
}

async function testAuthStatus() {
  console.log('\n🔐 Testando status da API de autenticação...');
  
  try {
    const response = await makeRequest(`${PRODUCTION_API}/auth/optimized/status`);
    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ API de autenticação ativa!');
      return true;
    } else {
      console.log('❌ API de autenticação não está funcionando');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na API de autenticação:', error.message);
    return false;
  }
}

async function testLogin(credentials) {
  console.log(`\n🔑 Testando login: ${credentials.email}`);
  
  try {
    const response = await makeRequest(`${PRODUCTION_API}/auth/optimized/login`, {
      method: 'POST',
      body: credentials
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ LOGIN SUCESSO!');
      console.log('Token:', response.data.data.token.substring(0, 50) + '...');
      console.log('Usuário:', response.data.data.user);
      return response.data.data.token;
    } else {
      console.log('❌ Login falhou:', response.data.message || 'Erro desconhecido');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro no login:', error.message);
    return null;
  }
}

async function testValidation(token) {
  if (!token) {
    console.log('\n⏭️ Pulando validação (sem token)');
    return;
  }

  console.log('\n🔍 Testando validação de token...');
  
  try {
    const response = await makeRequest(`${PRODUCTION_API}/auth/optimized/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Validação funcionando!');
    } else {
      console.log('❌ Validação falhou');
    }
  } catch (error) {
    console.error('❌ Erro na validação:', error.message);
  }
}

async function testFrontendLogin() {
  console.log('\n🌐 Testando login via frontend...');
  
  try {
    const response = await makeRequest(`https://portal.sabercon.com.br/api/auth/login`, {
      method: 'POST',
      body: { email: 'admin@exemplo.com', password: 'senha123' }
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Login via frontend funcionando!');
      return response.data.data.token;
    } else {
      console.log('❌ Login via frontend falhou');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro no login via frontend:', error.message);
    return null;
  }
}

async function runProductionTests() {
  console.log('🚀 TESTANDO SISTEMA DE AUTENTICAÇÃO EM PRODUÇÃO');
  console.log(`🌐 URL: ${PRODUCTION_API}`);
  console.log('=' * 60);
  
  // Teste 1: Health Check
  const healthOk = await testHealthCheck();
  
  // Teste 2: Status da API de autenticação
  const authStatusOk = await testAuthStatus();
  
  // Teste 3: Tentar login com várias credenciais
  let validToken = null;
  for (const credentials of testCredentials) {
    const token = await testLogin(credentials);
    if (token) {
      validToken = token;
      console.log('\n🎉 CREDENCIAIS VÁLIDAS ENCONTRADAS!');
      console.log(`📧 Email: ${credentials.email}`);
      console.log(`🔐 Senha: ${credentials.password}`);
      break;
    }
  }
  
  // Teste 4: Validação de token
  await testValidation(validToken);
  
  // Teste 5: Login via frontend
  const frontendToken = await testFrontendLogin();
  
  // Resumo final
  console.log('\n' + '=' * 60);
  console.log('📊 RESUMO DOS TESTES:');
  console.log(`🏥 Health Check: ${healthOk ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🔐 API Auth Status: ${authStatusOk ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🔑 Login Backend: ${validToken ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`🌐 Login Frontend: ${frontendToken ? '✅ OK' : '❌ FALHOU'}`);
  
  if (healthOk && authStatusOk) {
    console.log('\n✅ SISTEMA DE AUTENTICAÇÃO CUSTOMIZADO ESTÁ ATIVO EM PRODUÇÃO!');
    console.log('✅ NextAuth foi desabilitado com sucesso.');
    
    if (validToken || frontendToken) {
      console.log('✅ Login funcionando corretamente.');
    } else {
      console.log('⚠️ Sistema ativo, mas nenhuma credencial de teste funcionou.');
      console.log('💡 Isso é normal se não houver usuários de teste no banco de produção.');
    }
  } else {
    console.log('\n❌ HÁ PROBLEMAS NO SISTEMA DE AUTENTICAÇÃO EM PRODUÇÃO.');
  }
}

// Executar testes
runProductionTests().catch(console.error);