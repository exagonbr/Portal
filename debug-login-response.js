const fetch = require('node-fetch');

async function debugLoginResponse() {
  console.log('🔍 Debugando resposta do login...\n');

  try {
    console.log('📋 Fazendo login no backend...');
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@portal.com', 
        password: 'admin123' 
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('\n📄 Resposta completa do backend:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n🔍 Análise da estrutura:');
    console.log(`- Tipo de resposta: ${typeof data}`);
    console.log(`- Tem propriedade 'success': ${data.hasOwnProperty('success')}`);
    console.log(`- Tem propriedade 'data': ${data.hasOwnProperty('data')}`);
    console.log(`- Tem propriedade 'user': ${data.hasOwnProperty('user')}`);
    console.log(`- Tem propriedade 'token': ${data.hasOwnProperty('token')}`);
    
    // O problema pode ser que o backend retorna diretamente user, token, expires_at
    // em vez de dentro de um objeto 'data'
    
    console.log('\n🤖 Como o AuthService espera:');
    console.log('AuthService espera: { success: true, data: { user, token, expires_at } }');
    console.log('Backend pode estar retornando: { user, token, expires_at } diretamente');

  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
}

debugLoginResponse(); 