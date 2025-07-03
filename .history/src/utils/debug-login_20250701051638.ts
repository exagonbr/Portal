// Script de diagnóstico para problemas de login
export async function debugLogin(email: string, password: string) {
  console.log('🔍 Iniciando diagnóstico de login...');
  
  try {
    // 1. Verificar conectividade básica
    console.log('1️⃣ Testando conectividade...');
    const pingResponse = await fetch('/api/health-check', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    }).catch(err => {
      console.log('❌ Erro de rede:', err);
      return null;
    });
    
    if (pingResponse) {
      console.log('✅ Conectividade OK:', pingResponse.status);
    } else {
      console.log('❌ Sem conectividade com o servidor');
    }
    
    // 2. Testar endpoint de login diretamente
    console.log('2️⃣ Testando endpoint de login...');
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'same-origin',
    });
    
    console.log('📡 Status da resposta:', loginResponse.status);
    console.log('📡 Headers da resposta:', Object.fromEntries(loginResponse.headers.entries()));
    
    // 3. Verificar conteúdo da resposta
    const contentType = loginResponse.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    
    let responseData;
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await loginResponse.json();
        console.log('📦 Dados da resposta:', responseData);
      } catch (jsonError) {
        console.log('❌ Erro ao parsear JSON:', jsonError);
        const textResponse = await loginResponse.text();
        console.log('📄 Resposta como texto:', textResponse);
      }
    } else {
      const textResponse = await loginResponse.text();
      console.log('📄 Resposta não-JSON:', textResponse);
    }
    
    // 4. Verificar configuração do backend
    console.log('3️⃣ Verificando configuração do backend...');
    console.log('🔧 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('🔧 NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
    
    // 5. Testar conexão direta com o backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://portal.sabercon.com.br/api';
    console.log('4️⃣ Testando conexão direta com backend:', backendUrl);
    
    try {
      const backendResponse = await fetch(`${backendUrl}/auth/optimized/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'omit', // Evitar CORS
      });
      
      console.log('🌐 Backend - Status:', backendResponse.status);
      console.log('🌐 Backend - Headers:', Object.fromEntries(backendResponse.headers.entries()));
      
      if (backendResponse.headers.get('content-type')?.includes('application/json')) {
        const backendData = await backendResponse.json();
        console.log('🌐 Backend - Dados:', backendData);
      }
    } catch (backendError) {
      console.log('❌ Erro ao conectar diretamente com backend:', backendError);
    }
    
    // 6. Verificar cookies e sessão
    console.log('5️⃣ Verificando cookies e sessão...');
    console.log('🍪 Cookies:', document.cookie);
    console.log('💾 LocalStorage - auth_token:', localStorage.getItem('auth_token'));
    console.log('💾 LocalStorage - user_session:', localStorage.getItem('user_session'));
    
    return {
      success: loginResponse.ok,
      status: loginResponse.status,
      data: responseData
    };
    
  } catch (error) {
    console.log('💥 Erro durante diagnóstico:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para executar no console do navegador
(window as any).debugLogin = debugLogin;