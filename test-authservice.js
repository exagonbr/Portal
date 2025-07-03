const fetch = require('node-fetch');

async function testAuthService() {
  console.log('🧪 Testando AuthService após correção...\n');

  // Simular uma requisição que o AuthService faria
  console.log('📋 Testando endpoint que o AuthService usa:');
  
  try {
    // Testar o endpoint que o AuthService agora deveria usar: /api/auth/login
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@portal.com', 
        password: 'admin123' 
      })
    });
    
    const data = await response.json();
    console.log(`✅ Backend /api/auth/login: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ Login no backend funcionando!');
      console.log(`Token recebido: ${data.token ? 'Sim' : 'Não'}`);
      console.log(`Usuário: ${data.user ? data.user.name : 'N/A'}`);
    } else {
      console.log(`❌ Erro no backend: ${data.message}`);
    }
  } catch (error) {
    console.log(`❌ Erro na requisição: ${error.message}`);
  }

  console.log('\n🔍 Testando endpoint antigo (deve dar 404):');
  
  try {
    // Testar o endpoint antigo que estava causando erro: /auth/login
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@portal.com', 
        password: 'admin123' 
      })
    });
    
    const data = await response.json();
    console.log(`Backend /auth/login: ${response.status} ${response.statusText}`);
    console.log(`Mensagem: ${data.message}`);
  } catch (error) {
    console.log(`❌ Erro na requisição: ${error.message}`);
  }

  console.log('\n✨ Teste concluído!');
}

testAuthService(); 