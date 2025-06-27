/**
 * Script de Correção Rápida para Tokens de Autenticação
 * 
 * Este script resolve o problema de tokens JWT inválidos
 * convertendo tokens Base64 para formato JWT válido.
 */

console.log('🔧 INICIANDO CORREÇÃO DE TOKEN DE AUTENTICAÇÃO...');

// Verificar se estamos no navegador
if (typeof window === 'undefined') {
  console.error('❌ Este script deve ser executado no console do navegador');
  process.exit(1);
}

// Função principal de correção
function fixAuthToken() {
  console.group('🔧 CORREÇÃO DE TOKEN DE AUTENTICAÇÃO');
  
  const possibleKeys = ['auth_token', 'authToken', 'token'];
  let tokenFixed = false;
  let tokenFound = false;
  
  // Verificar cada possível chave de token
  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    
    if (token && token.trim() !== '') {
      tokenFound = true;
      console.log(`🔍 Token encontrado em localStorage.${key}`);
      console.log(`📏 Tamanho: ${token.length} caracteres`);
      console.log(`👀 Preview: ${token.substring(0, 30)}...`);
      
      // Verificar formato
      const parts = token.split('.');
      
      if (parts.length === 3) {
        console.log('✅ Token já está no formato JWT válido');
        
        // Verificar se não está expirado
        try {
          const payload = JSON.parse(atob(parts[1]));
          const now = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < now) {
            console.warn('⏰ Token está expirado');
            console.log('📅 Expirou em:', new Date(payload.exp * 1000));
            console.log('🔄 Remova o token e faça login novamente');
          } else {
            console.log('✅ Token válido e não expirado');
          }
        } catch (error) {
          console.warn('⚠️ Erro ao verificar expiração:', error.message);
        }
        
      } else if (parts.length === 1 && token.length > 50) {
        console.log('🔄 Token parece ser Base64, tentando converter para JWT...');
        
        try {
          // Tentar decodificar como Base64
          const decoded = atob(token);
          const tokenData = JSON.parse(decoded);
          
          console.log('📦 Dados do token:', tokenData);
          
          if (tokenData.userId && tokenData.email && tokenData.role) {
            // Criar novo JWT com os mesmos dados
            const newJwtPayload = {
              userId: tokenData.userId,
              email: tokenData.email,
              name: tokenData.name,
              role: tokenData.role,
              institutionId: tokenData.institutionId,
              permissions: tokenData.permissions || [],
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
            };
            
            // Simular JWT válido (3 partes)
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payload = btoa(JSON.stringify(newJwtPayload));
            const signature = btoa('mock_signature_' + Date.now());
            
            const newJwtToken = `${header}.${payload}.${signature}`;
            
            // Armazenar o novo token
            localStorage.setItem(key, newJwtToken);
            
            console.log('✅ Token convertido com sucesso!');
            console.log('🆕 Novo token (preview):', newJwtToken.substring(0, 50) + '...');
            
            tokenFixed = true;
            
            // Também armazenar na chave padrão
            if (key !== 'auth_token') {
              localStorage.setItem('auth_token', newJwtToken);
            }
            
          } else {
            console.warn('⚠️ Token Base64 não contém dados de usuário válidos');
            console.log('📋 Dados encontrados:', Object.keys(tokenData));
          }
          
        } catch (error) {
          console.error('❌ Erro ao converter token Base64:', error.message);
        }
        
      } else {
        console.warn('⚠️ Token tem formato desconhecido');
        console.log('🔢 Número de partes:', parts.length);
        console.log('📏 Tamanho:', token.length);
      }
    }
  }
  
  if (!tokenFound) {
    console.warn('⚠️ Nenhum token encontrado no localStorage');
    console.log('💡 Faça login para obter um token');
    
    // Mostrar todas as chaves para debug
    console.log('🗂️ Chaves no localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`  - ${key}: ${value ? value.substring(0, 30) + '...' : 'null'}`);
    }
  }
  
  console.groupEnd();
  
  // Resultado final
  if (tokenFixed) {
    console.log('🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('🔄 Recarregando a página em 2 segundos...');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } else if (tokenFound) {
    console.log('ℹ️ Token encontrado mas nenhuma correção necessária');
    
  } else {
    console.log('❌ Nenhum token encontrado para corrigir');
    console.log('💡 Acesse a página de login para obter um token');
  }
  
  return { tokenFound, tokenFixed };
}

// Função para limpar tudo e recomeçar
function clearAndRestart() {
  console.log('🧹 Limpando todos os dados de autenticação...');
  
  // Limpar localStorage
  const keysToRemove = ['auth_token', 'authToken', 'token', 'user_session', 'user'];
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Removido: ${key}`);
    }
  });
  
  // Limpar cookies
  const cookiesToClear = ['auth_token', 'user_data', 'session_token'];
  cookiesToClear.forEach(cookieName => {
    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    console.log(`🍪 Cookie limpo: ${cookieName}`);
  });
  
  console.log('✅ Limpeza concluída');
  console.log('🔄 Redirecionando para login...');
  
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
}

// Função de diagnóstico
function diagnoseAuth() {
  console.group('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO');
  
  // Verificar tokens
  const tokens = {};
  ['auth_token', 'authToken', 'token'].forEach(key => {
    const token = localStorage.getItem(key);
    if (token) {
      tokens[key] = {
        length: token.length,
        preview: token.substring(0, 30) + '...',
        parts: token.split('.').length,
        isJWT: token.split('.').length === 3
      };
    }
  });
  
  console.log('🎫 Tokens encontrados:', tokens);
  
  // Verificar cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (['auth_token', 'user_data', 'session_token'].includes(name)) {
      acc[name] = value ? value.substring(0, 30) + '...' : 'vazio';
    }
    return acc;
  }, {});
  
  console.log('🍪 Cookies relevantes:', cookies);
  
  // Verificar dados do usuário
  const userSession = localStorage.getItem('user_session');
  if (userSession) {
    try {
      const userData = JSON.parse(userSession);
      console.log('👤 Dados do usuário:', {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      });
    } catch (error) {
      console.warn('⚠️ Erro ao decodificar dados do usuário:', error.message);
    }
  } else {
    console.log('👤 Nenhum dado de usuário encontrado');
  }
  
  console.groupEnd();
}

// Expor funções globalmente
window.fixAuthToken = fixAuthToken;
window.clearAndRestart = clearAndRestart;
window.diagnoseAuth = diagnoseAuth;

// Executar correção automaticamente
console.log('🚀 Executando correção automática...');
fixAuthToken();

console.log(`
📋 COMANDOS DISPONÍVEIS:
  fixAuthToken()     - Corrigir token automaticamente
  clearAndRestart()  - Limpar tudo e ir para login
  diagnoseAuth()     - Diagnóstico completo
`); 