const fetch = require('node-fetch');

async function testLoginFixed() {
  console.log('🔧 Testando login após correção da estrutura...\n');

  try {
    // Simular como o AuthService faria agora
    console.log('📋 Simulando AuthService corrigido...');
    
    // 1. Fazer requisição (como apiClient.post faria)
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@portal.com', 
        password: 'admin123' 
      })
    });
    
    const data = await response.json();
    
    // 2. Simular resposta do apiClient
    const apiClientResponse = {
      success: response.ok,
      data: data,
      message: data.message
    };
    
    console.log('✅ Resposta do apiClient simulada:');
    console.log(`- success: ${apiClientResponse.success}`);
    console.log(`- data exists: ${!!apiClientResponse.data}`);
    
    // 3. Validação do AuthService (corrigida)
    if (!apiClientResponse.success || !apiClientResponse.data) {
      console.log('❌ Falharia na primeira validação');
      return;
    }
    
    console.log('✅ Passou na primeira validação');
    
    // 4. Extração das propriedades (como agora está no código)
    const { user, token, expires_at } = apiClientResponse.data;
    
    console.log('\n🔍 Extração das propriedades:');
    console.log(`- user: ${!!user}`);
    console.log(`- token: ${!!token}`);
    console.log(`- expires_at: ${!!expires_at}`);
    
    // 5. Segunda validação
    if (!user || !token || !expires_at) {
      console.log('❌ Falharia na segunda validação (resposta incompleta)');
      return;
    }
    
    console.log('✅ Passou na segunda validação');
    console.log('\n🎉 Login deveria funcionar agora!');
    
    if (user) {
      console.log(`\n👤 Dados do usuário:`);
      console.log(`- ID: ${user.id}`);
      console.log(`- Nome: ${user.name}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role_name}`);
    }

  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }
}

testLoginFixed(); 