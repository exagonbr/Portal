const fetch = require('node-fetch');

console.log('🧪 Testando correção de CORS...\n');

async function testCorsLogin() {
  const url = 'http://localhost:3001/api/auth/login';
  
  console.log(`📡 Testando: ${url}`);
  
  try {
    // Primeiro, testar requisição OPTIONS (preflight)
    console.log('1️⃣ Testando requisição OPTIONS (preflight)...');
    const optionsResponse = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`   Status: ${optionsResponse.status}`);
    console.log(`   Headers CORS:`);
    console.log(`   - Allow-Origin: ${optionsResponse.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`   - Allow-Methods: ${optionsResponse.headers.get('Access-Control-Allow-Methods')}`);
    console.log(`   - Allow-Headers: ${optionsResponse.headers.get('Access-Control-Allow-Headers')}`);
    console.log(`   - Allow-Credentials: ${optionsResponse.headers.get('Access-Control-Allow-Credentials')}`);
    
    if (optionsResponse.status === 200) {
      console.log('   ✅ Preflight OK!\n');
    } else {
      console.log('   ❌ Preflight falhou!\n');
    }
    
    // Segundo, testar requisição POST real
    console.log('2️⃣ Testando requisição POST real...');
    const postResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    console.log(`   Status: ${postResponse.status}`);
    console.log(`   Headers CORS:`);
    console.log(`   - Allow-Origin: ${postResponse.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`   - Allow-Credentials: ${postResponse.headers.get('Access-Control-Allow-Credentials')}`);
    
    const responseData = await postResponse.text();
    console.log(`   Resposta: ${responseData}\n`);
    
    if (postResponse.status < 400) {
      console.log('   ✅ Requisição POST OK!\n');
    } else {
      console.log('   ⚠️ Requisição POST retornou erro (mas pode ser normal se não há autenticação)\n');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar CORS:', error.message);
    
    if (error.message.includes('CORS')) {
      console.log('\n🔧 Problema de CORS ainda existe!');
      console.log('💡 Soluções possíveis:');
      console.log('   1. Verificar se o backend está rodando na porta 3001');
      console.log('   2. Reiniciar o servidor backend');
      console.log('   3. Verificar se as configurações foram aplicadas');
    }
  }
}

async function testServerStatus() {
  console.log('🔍 Verificando se o servidor está rodando...');
  
  try {
    const response = await fetch('http://localhost:3001/api/status', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor está rodando!');
      console.log(`   Status: ${data.status}`);
      console.log(`   CORS: ${data.cors || 'configurado'}\n`);
      return true;
    }
  } catch (error) {
    console.log('❌ Servidor não está respondendo na porta 3001');
    console.log('💡 Execute: npm run dev ou node backend/cors-fix.js\n');
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de CORS...\n');
  
  const serverRunning = await testServerStatus();
  
  if (serverRunning) {
    await testCorsLogin();
    
    console.log('📋 Resultado do teste:');
    console.log('   Se ambos os testes passaram, o CORS foi corrigido! ✅');
    console.log('   Se houve erro, verifique as configurações do servidor. ❌');
  }
  
  console.log('\n🔧 Para aplicar a correção permanente:');
  console.log('   1. As alterações já foram feitas em backend/src/config/middlewares.ts');
  console.log('   2. Reinicie o servidor backend');
  console.log('   3. O problema de CORS deve estar resolvido');
}

runTests(); 