const axios = require('axios');

async function testLoginFix() {
  console.log('🧪 Testando correções do login...');
  
  const testCredentials = [
    { email: 'admin@sabercon.edu.br', password: 'password123' },
    { email: 'teacher@sabercon.edu.br', password: 'password123' },
    { email: 'student@sabercon.edu.br', password: 'password123' }
  ];
  
  for (const credentials of testCredentials) {
    try {
      console.log(`\n🔐 Testando login para: ${credentials.email}`);
      
      const response = await axios.post('https://portal.sabercon.com.br/api/users/login', 
        credentials, 
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'test-login-fix/1.0'
          },
          timeout: 15000,
          withCredentials: true
        }
      );
      
      if (response.data.success && response.data.data) {
        console.log(`✅ Login bem-sucedido para ${credentials.email}`);
        console.log(`   - Role: ${response.data.data.user?.role || 'N/A'}`);
        console.log(`   - Token: ${response.data.data.accessToken ? 'Presente' : 'Ausente'}`);
      } else {
        console.log(`❌ Login falhou para ${credentials.email}: ${response.data.message || 'Erro desconhecido'}`);
      }
      
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log(`⏰ Timeout ao fazer login para ${credentials.email}`);
      } else if (error.response) {
        console.log(`❌ Erro HTTP ${error.response.status} para ${credentials.email}: ${error.response.data?.message || 'Erro no servidor'}`);
      } else {
        console.log(`❌ Erro de conexão para ${credentials.email}: ${error.message}`);
      }
    }
  }
  
  console.log('\n🔍 Testando conectividade básica...');
  try {
    const healthResponse = await axios.get('https://portal.sabercon.com.br/api/health', {
      timeout: 5000
    });
    console.log('✅ Servidor respondendo normalmente');
  } catch (error) {
    console.log('❌ Problema de conectividade com o servidor:', error.message);
  }
  
  console.log('\n🏁 Teste concluído!');
}

testLoginFix().catch(console.error); 