/**
 * Script para debugar o estado da autenticação
 * Execute no console do navegador: node scripts/debug-auth-state.js
 * Ou cole o código no console do navegador
 */

function debugAuthState() {
  console.log('🔍 DEBUG AUTH STATE - Verificando estado da autenticação...\n');
  
  // 1. Verificar localStorage
  console.log('📦 LocalStorage:');
  const localStorageKeys = ['auth_token', 'token', 'authToken', 'user', 'user_session', 'userSession'];
  localStorageKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      if (key.includes('token')) {
        console.log(`  ✅ ${key}: ${value.substring(0, 20)}... (${value.length} chars)`);
        
        // Tentar decodificar se for JWT
        if (value.includes('.')) {
          try {
            const parts = value.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              console.log(`    📋 JWT Payload:`, {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
                exp: payload.exp ? new Date(payload.exp * 1000) : 'sem expiração',
                expired: payload.exp ? payload.exp < Math.floor(Date.now() / 1000) : false
              });
            }
          } catch (e) {
            console.log(`    ❌ Erro ao decodificar JWT: ${e.message}`);
          }
        }
      } else {
        console.log(`  ✅ ${key}: ${value.substring(0, 100)}...`);
      }
    } else {
      console.log(`  ❌ ${key}: não encontrado`);
    }
  });
  
  // 2. Verificar sessionStorage
  console.log('\n📦 SessionStorage:');
  localStorageKeys.forEach(key => {
    const value = sessionStorage.getItem(key);
    if (value) {
      console.log(`  ✅ ${key}: ${value.substring(0, 20)}... (${value.length} chars)`);
    } else {
      console.log(`  ❌ ${key}: não encontrado`);
    }
  });
  
  // 3. Verificar cookies
  console.log('\n🍪 Cookies:');
  const cookies = document.cookie.split(';');
  const cookieKeys = ['auth_token', 'token', 'authToken', 'user_data', 'session_token', 'refresh_token'];
  cookieKeys.forEach(key => {
    const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));
    if (cookie) {
      const value = cookie.split('=')[1];
      console.log(`  ✅ ${key}: ${value.substring(0, 20)}... (${value.length} chars)`);
    } else {
      console.log(`  ❌ ${key}: não encontrado`);
    }
  });
  
  // 4. Testar API Client
  console.log('\n🔧 API Client:');
  try {
    // Importar o apiClient se disponível
    if (typeof window !== 'undefined' && window.apiClient) {
      const token = window.apiClient.getAuthToken();
      if (token) {
        console.log(`  ✅ Token do API Client: ${token.substring(0, 20)}... (${token.length} chars)`);
      } else {
        console.log('  ❌ API Client não tem token');
      }
    } else {
      console.log('  ❓ API Client não disponível globalmente');
    }
  } catch (e) {
    console.log(`  ❌ Erro ao acessar API Client: ${e.message}`);
  }
  
  // 5. Verificar contexto de autenticação
  console.log('\n👤 Contexto de Autenticação:');
  try {
    // Verificar se há dados de usuário no React Context
    const userSessionStr = localStorage.getItem('user_session');
    if (userSessionStr) {
      const userSession = JSON.parse(userSessionStr);
      console.log('  ✅ Sessão do usuário encontrada:', {
        user: userSession.user,
        timestamp: new Date(userSession.timestamp),
        expiresAt: new Date(userSession.expiresAt),
        expired: Date.now() > userSession.expiresAt
      });
    } else {
      console.log('  ❌ Sessão do usuário não encontrada');
    }
  } catch (e) {
    console.log(`  ❌ Erro ao verificar sessão: ${e.message}`);
  }
  
  // 6. Fazer teste de requisição
  console.log('\n🌐 Teste de Requisição:');
  fetch('/api/auth/validate', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log(`  📡 Status da validação: ${response.status}`);
    return response.json();
  })
  .then(data => {
    console.log('  📋 Resposta da validação:', data);
  })
  .catch(error => {
    console.log(`  ❌ Erro na validação: ${error.message}`);
  });
  
  console.log('\n✅ Debug concluído!');
}

// Executar se estivermos no navegador
if (typeof window !== 'undefined') {
  debugAuthState();
} else {
  console.log('Este script deve ser executado no console do navegador.');
  module.exports = debugAuthState;
} 