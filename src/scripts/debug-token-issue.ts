/**
 * Script de diagnóstico para problemas de token de autenticação
 */

import { getCurrentToken, validateToken, isAuthenticated } from '../utils/token-validator';

export async function debugTokenIssue() {
  console.log('🔍 [DEBUG-TOKEN] Iniciando diagnóstico do token...');
  
  // 1. Verificar se há token armazenado
  const currentToken = getCurrentToken();
  console.log('📋 [DEBUG-TOKEN] Token atual:', {
    exists: !!currentToken,
    length: currentToken ? currentToken.length : 0,
    preview: currentToken ? currentToken.substring(0, 20) + '...' : 'N/A'
  });
  
  if (!currentToken) {
    console.log('❌ [DEBUG-TOKEN] Nenhum token encontrado!');
    console.log('💡 [DEBUG-TOKEN] Verificando storage...');
    
    if (typeof window !== 'undefined') {
      const keys = ['auth_token', 'token', 'authToken'];
      keys.forEach(key => {
        const localStorage_value = localStorage.getItem(key);
        const sessionStorage_value = sessionStorage.getItem(key);
        console.log(`   localStorage.${key}:`, localStorage_value ? `${localStorage_value.length} chars` : 'null');
        console.log(`   sessionStorage.${key}:`, sessionStorage_value ? `${sessionStorage_value.length} chars` : 'null');
      });
      
      // Verificar cookies
      console.log('🍪 [DEBUG-TOKEN] Cookies:');
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name.includes('token') || name.includes('auth')) {
          console.log(`   ${name}:`, value ? `${value.length} chars` : 'empty');
        }
      });
    }
    
    return {
      hasToken: false,
      error: 'Nenhum token encontrado'
    };
  }
  
  // 2. Validar token
  const validation = validateToken(currentToken);
  console.log('🔍 [DEBUG-TOKEN] Validação do token:', validation);
  
  // 3. Verificar status de autenticação
  const authStatus = isAuthenticated();
  console.log('🔍 [DEBUG-TOKEN] Status de autenticação:', authStatus);
  
  // 4. Testar requisição para o backend
  console.log('🧪 [DEBUG-TOKEN] Testando requisição para backend...');
  
  try {
    const response = await fetch('https://portal.sabercon.com.br/api/users/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 [DEBUG-TOKEN] Resposta do backend:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }
    
    console.log('📋 [DEBUG-TOKEN] Dados da resposta:', responseData);
    
    if (!response.ok) {
      return {
        hasToken: true,
        tokenValid: validation.isValid,
        backendResponse: {
          status: response.status,
          error: responseData.error || responseData.message || responseText
        },
        diagnosis: response.status === 401 ? 'Token rejeitado pelo backend' : 'Erro no servidor'
      };
    }
    
    return {
      hasToken: true,
      tokenValid: validation.isValid,
      backendResponse: {
        status: response.status,
        success: true,
        data: responseData
      },
      diagnosis: 'Token funcionando corretamente'
    };
    
  } catch (error) {
    console.log('❌ [DEBUG-TOKEN] Erro na requisição:', error);
    return {
      hasToken: true,
      tokenValid: validation.isValid,
      networkError: error instanceof Error ? error.message : String(error),
      diagnosis: 'Erro de rede ou conectividade'
    };
  }
}

// Executar diagnóstico se for chamado diretamente
if (typeof window !== 'undefined') {
  (window as any).debugTokenIssue = debugTokenIssue;
  console.log('💡 Execute debugTokenIssue() no console para diagnosticar problemas de token');
} 