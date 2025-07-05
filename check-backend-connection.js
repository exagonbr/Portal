/**
 * Script para verificar a conexão com o backend
 * Executa um teste simples de conexão com o backend
 */

const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function checkBackendConnection() {
  console.log('🔍 Verificando conexão com o backend...');
  console.log('🔗 URL do backend:', backendUrl);
  
  try {
    // Tentar acessar a rota de health check
    const healthResponse = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🏥 Status da resposta:', healthResponse.status);
    
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('✅ Backend está respondendo:', data);
    } else {
      console.log('⚠️ Backend respondeu com erro:', healthResponse.status);
    }
    
    // Tentar acessar a rota de auth
    console.log('\n🔐 Verificando rota de autenticação...');
    const authResponse = await fetch(`${backendUrl}/auth/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔒 Status da resposta auth:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Rota de auth está respondendo:', authData);
    } else {
      console.log('⚠️ Rota de auth respondeu com erro:', authResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o backend:', error.message);
    console.error('🔍 Detalhes do erro:', {
      name: error.name,
      cause: error.cause,
      code: error.code
    });
    
    // Verificar problemas comuns
    if (error.message.includes('ECONNREFUSED')) {
      console.error('🚨 O servidor backend não está em execução ou não está acessível no endereço:', backendUrl);
      console.error('📋 Sugestões:');
      console.error('  1. Verifique se o servidor backend está em execução');
      console.error('  2. Verifique se a porta está correta');
      console.error('  3. Verifique se não há firewall bloqueando a conexão');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.error('🚨 Timeout ao tentar conectar ao backend');
      console.error('📋 Sugestões:');
      console.error('  1. Verifique se o servidor backend está respondendo');
      console.error('  2. Verifique a conectividade de rede');
    } else if (error.message.includes('fetch failed')) {
      console.error('🚨 Falha na requisição fetch');
      console.error('📋 Sugestões:');
      console.error('  1. Verifique se a URL está correta:', backendUrl);
      console.error('  2. Verifique se o servidor backend está em execução');
    }
  }
}

// Executar o teste
checkBackendConnection().catch(console.error); 