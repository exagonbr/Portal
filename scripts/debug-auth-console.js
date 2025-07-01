/**
 * Script de diagnóstico e reparo de autenticação
 * Execute este script no console do navegador para diagnosticar problemas de auth
 */

console.log('🔍 INICIANDO DIAGNÓSTICO DE AUTENTICAÇÃO...');

// Função para diagnosticar problemas de autenticação
function diagnoseAuthProblems() {
  console.group('📋 DIAGNÓSTICO COMPLETO');
  
  // 1. Verificar todas as chaves de token no localStorage
  console.group('🔑 TOKENS NO LOCALSTORAGE');
  const tokenKeys = ['authToken', 'auth_token', 'token'];
  const foundTokens = {};
  
  tokenKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      foundTokens[key] = {
        length: value.length,
        isJWT: value.split('.').length === 3,
        preview: value.substring(0, 50) + '...'
      };
      console.log(`✅ ${key}:`, foundTokens[key]);
    } else {
      console.log(`❌ ${key}: não encontrado`);
    }
  });
  console.groupEnd();
  
  // 2. Verificar dados de sessão
  console.group('👤 DADOS DE SESSÃO');
  const sessionKeys = ['userSession', 'user_session'];
  sessionKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`✅ ${key}:`, {
          hasUser: !!parsed.user,
          userId: parsed.user?.id,
          userName: parsed.user?.name,
          userRole: parsed.user?.role,
          expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : 'N/A',
          isExpired: parsed.expiresAt ? parsed.expiresAt < Date.now() : 'N/A'
        });
      } catch (error) {
        console.log(`❌ ${key}: JSON inválido`, error);
      }
    } else {
      console.log(`❌ ${key}: não encontrado`);
    }
  });
  console.groupEnd();
  
  // 3. Verificar cookies
  console.group('🍪 COOKIES');
  const cookies = document.cookie.split(';');
  const authCookies = cookies.filter(cookie => {
    const name = cookie.trim().split('=')[0];
    return ['authToken', 'auth_token', 'userData', 'user_data'].includes(name);
  });
  
  if (authCookies.length > 0) {
    authCookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      console.log(`✅ ${name}:`, value ? value.substring(0, 50) + '...' : 'vazio');
    });
  } else {
    console.log('❌ Nenhum cookie de autenticação encontrado');
  }
  console.groupEnd();
  
  console.groupEnd();
  return foundTokens;
}

// Função para reparar problemas de autenticação
function repairAuthProblems() {
  console.group('🔧 REPARO AUTOMÁTICO');
  
  // 1. Encontrar o token JWT válido
  const tokenKeys = ['authToken', 'auth_token', 'token'];
  let validToken = null;
  let validKey = null;
  
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);
    if (token && token.split('.').length === 3 && token.length > 100) {
      // Verificar se não está expirado
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp && payload.exp < Math.floor(Date.now() / 1000);
        
        if (!isExpired) {
          validToken = token;
          validKey = key;
          console.log(`✅ Token JWT válido encontrado em: ${key}`);
          break;
        } else {
          console.log(`⏰ Token em ${key} está expirado`);
        }
      } catch (error) {
        console.log(`❌ Erro ao validar token em ${key}:`, error);
      }
    }
  }
  
  if (!validToken) {
    console.log('❌ Nenhum token JWT válido encontrado');
    console.log('💡 Solução: Faça login novamente');
    console.groupEnd();
    return false;
  }
  
  // 2. Sincronizar token em todas as chaves padrão
  console.log('🔄 Sincronizando token...');
  localStorage.setItem('authToken', validToken);
  localStorage.setItem('auth_token', validToken);
  
  // 3. Verificar se a sessão do usuário está consistente
  const userSession = localStorage.getItem('userSession');
  if (userSession) {
    try {
      const sessionData = JSON.parse(userSession);
      if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
        console.log('⏰ Sessão do usuário expirada, removendo...');
        localStorage.removeItem('userSession');
      } else {
        console.log('✅ Sessão do usuário válida');
      }
    } catch (error) {
      console.log('❌ Erro ao validar sessão do usuário:', error);
      localStorage.removeItem('userSession');
    }
  }
  
  console.log('✅ Reparo concluído');
  console.groupEnd();
  return true;
}

// Função para testar a API após o reparo
async function testApiAfterRepair() {
  console.group('🧪 TESTE DA API');
  
  const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
  
  if (!token) {
    console.log('❌ Nenhum token encontrado para teste');
    console.groupEnd();
    return;
  }
  
  try {
    const response = await fetch('/api/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API funcionando corretamente!');
      console.log('👤 Usuário autenticado:', data.user?.name, data.user?.role);
    } else {
      console.log('❌ Erro na API:', response.status, data);
    }
  } catch (error) {
    console.log('❌ Erro de rede:', error);
  }
  
  console.groupEnd();
}

// Função principal
async function fixAuthIssues() {
  console.log('🚀 INICIANDO CORREÇÃO DE PROBLEMAS DE AUTENTICAÇÃO');
  
  // 1. Diagnosticar
  const tokens = diagnoseAuthProblems();
  
  // 2. Reparar se necessário
  const repaired = repairAuthProblems();
  
  // 3. Testar
  if (repaired) {
    await testApiAfterRepair();
  }
  
  console.log('✅ Processo concluído');
  
  // 4. Dar instruções finais
  console.group('📝 INSTRUÇÕES FINAIS');
  if (repaired) {
    console.log('✅ Problemas corrigidos! Recarregue a página para aplicar as mudanças.');
    console.log('🔄 Execute: location.reload()');
  } else {
    console.log('❌ Não foi possível corrigir automaticamente.');
    console.log('💡 Soluções manuais:');
    console.log('1. Execute: localStorage.clear() e faça login novamente');
    console.log('2. Ou execute: clearAllAuth() se a função estiver disponível');
  }
  console.groupEnd();
}

// Executar automaticamente
fixAuthIssues();

// Disponibilizar funções globalmente para uso manual
window.diagnoseAuth = diagnoseAuthProblems;
window.repairAuth = repairAuthProblems;
window.testApi = testApiAfterRepair;
window.fixAuth = fixAuthIssues;

console.log('🛠️ Funções disponíveis no console:');
console.log('- diagnoseAuth() - Diagnosticar problemas');
console.log('- repairAuth() - Reparar problemas');
console.log('- testApi() - Testar API');
console.log('- fixAuth() - Processo completo'); 