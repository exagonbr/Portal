/**
 * Teste específico para verificar se o refreshToken está sendo retornado no login
 * Execute com: node test-login-refresh-token.js
 */

const BASE_URL = 'http://localhost:3000';

async function testLoginRefreshToken() {
  console.log('🔍 Testando retorno do refreshToken no login...\n');
  
  try {
    // 1. Testar endpoint /api/auth/login
    console.log('1. Testando /api/auth/login...');
    const loginResponse1 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        email: 'admin@sabercon.edu.br',
        password: 'password123',
        rememberMe: true
      })
    });
    
    const loginData1 = await loginResponse1.json();
    console.log('📊 Status:', loginResponse1.status);
    console.log('📊 Resposta completa:', JSON.stringify(loginData1, null, 2));
    
    if (loginData1.success && loginData1.data) {
      console.log('✅ Login bem-sucedido!');
      console.log('🔑 accessToken presente:', !!loginData1.data.accessToken);
      console.log('🔑 token presente:', !!loginData1.data.token);
      console.log('🔄 refreshToken presente:', !!loginData1.data.refreshToken);
      console.log('🆔 sessionId presente:', !!loginData1.data.sessionId);
      
      if (loginData1.data.refreshToken) {
        console.log('✅ refreshToken encontrado:', loginData1.data.refreshToken.substring(0, 50) + '...');
      } else {
        console.log('❌ refreshToken NÃO encontrado na resposta!');
        console.log('🔍 Campos disponíveis em data:', Object.keys(loginData1.data));
      }
    } else {
      console.log('❌ Login falhou:', loginData1.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 2. Testar endpoint /api/custom-auth/login
    console.log('2. Testando /api/custom-auth/login...');
    const loginResponse2 = await fetch(`${BASE_URL}/api/custom-auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        email: 'admin@sabercon.edu.br',
        password: 'password123'
      })
    });
    
    const loginData2 = await loginResponse2.json();
    console.log('📊 Status:', loginResponse2.status);
    console.log('📊 Resposta completa:', JSON.stringify(loginData2, null, 2));
    
    if (loginData2.success && loginData2.data) {
      console.log('✅ Login bem-sucedido!');
      console.log('🔑 token presente:', !!loginData2.data.token);
      console.log('🔄 refreshToken presente:', !!loginData2.data.refreshToken);
      console.log('👤 user presente:', !!loginData2.data.user);
      
      if (loginData2.data.refreshToken) {
        console.log('✅ refreshToken encontrado:', loginData2.data.refreshToken.substring(0, 50) + '...');
      } else {
        console.log('❌ refreshToken NÃO encontrado na resposta!');
        console.log('🔍 Campos disponíveis em data:', Object.keys(loginData2.data));
      }
    } else {
      console.log('❌ Login falhou:', loginData2.message);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // 3. Verificar se o problema está no backend externo
    console.log('3. Testando backend externo diretamente...');
    const backendUrl = 'http://127.0.0.1:3001/api/auth/optimized/login';
    
    try {
      const backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@sabercon.edu.br',
          password: 'password123'
        })
      });
      
      const backendData = await backendResponse.json();
      console.log('📊 Backend Status:', backendResponse.status);
      console.log('📊 Backend Resposta:', JSON.stringify(backendData, null, 2));
      
      if (backendData.success || backendData.token) {
        console.log('🔑 Backend token presente:', !!(backendData.token || backendData.data?.token));
        console.log('🔄 Backend refreshToken presente:', !!(backendData.refreshToken || backendData.data?.refreshToken));
        
        if (backendData.refreshToken || backendData.data?.refreshToken) {
          const refreshToken = backendData.refreshToken || backendData.data?.refreshToken;
          console.log('✅ Backend refreshToken encontrado:', refreshToken.substring(0, 50) + '...');
        } else {
          console.log('❌ Backend refreshToken NÃO encontrado!');
          console.log('🔍 Campos disponíveis no backend:', Object.keys(backendData));
          if (backendData.data) {
            console.log('🔍 Campos em data:', Object.keys(backendData.data));
          }
        }
      } else {
        console.log('❌ Backend login falhou:', backendData.message || 'Erro desconhecido');
      }
      
    } catch (backendError) {
      console.log('❌ Erro ao conectar com backend externo:', backendError.message);
      console.log('💡 Isso pode indicar que o backend externo não está rodando ou não está configurado corretamente');
    }
    
    console.log('\n✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
testLoginRefreshToken();