const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔍 Testando login...');
    
    // Primeiro, vamos executar o setup
    console.log('📋 Executando setup...');
    const setupResponse = await fetch('http://localhost:3001/api/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const setupData = await setupResponse.json();
    console.log('Setup response:', setupData);
    
    // Agora vamos tentar fazer login
    console.log('🔐 Tentando fazer login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@portal.com',
        password: 'admin123'
      }),
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    console.log('Login response:', loginData);
    
    if (loginResponse.ok) {
      console.log('✅ Login realizado com sucesso!');
    } else {
      console.log('❌ Falha no login:', loginData.message);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testLogin(); 