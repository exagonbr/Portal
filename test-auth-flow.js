const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testAuthFlow() {
  console.log('🧪 Testando fluxo de autenticação...
');

  try {
    // 1. Test login
    console.log('1️⃣ Testando login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@portal.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Status:', loginResponse.status);
    console.log('Response:', JSON.stringify(loginData, null, 2));

    if (!loginResponse.ok) {
      console.log('❌ Login falhou');
      return;
    }

    const token = loginData.token || loginData.data?.token;
    if (!token) {
      console.log('❌ Token não encontrado na resposta');
      return;
    }

    console.log('✅ Login bem-sucedido
');

    // 2. Test profile endpoint
    console.log('2️⃣ Testando endpoint de perfil...');
    const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const profileData = await profileResponse.json();
    console.log('Status:', profileResponse.status);
    console.log('Response:', JSON.stringify(profileData, null, 2));

    if (profileResponse.ok) {
      console.log('✅ Perfil carregado com sucesso
');
    } else {
      console.log('❌ Falha ao carregar perfil
');
    }

    // 3. Test token refresh
    console.log('3️⃣ Testando refresh de token...');
    const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: 'dummy-refresh-token'
      })
    });

    const refreshData = await refreshResponse.json();
    console.log('Status:', refreshResponse.status);
    console.log('Response:', JSON.stringify(refreshData, null, 2));

    if (refreshResponse.ok) {
      console.log('✅ Token refresh bem-sucedido
');
    } else {
      console.log('❌ Falha no refresh do token
');
    }

    // 4. Test logout
    console.log('4️⃣ Testando logout...');
    const logoutResponse = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const logoutData = await logoutResponse.json();
    console.log('Status:', logoutResponse.status);
    console.log('Response:', JSON.stringify(logoutData, null, 2));

    if (logoutResponse.ok) {
      console.log('✅ Logout bem-sucedido');
    } else {
      console.log('❌ Falha no logout');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testAuthFlow();
