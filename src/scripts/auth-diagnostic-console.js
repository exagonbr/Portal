/**
 * Script de diagnóstico de autenticação para console do navegador
 * Cole este script no console do navegador para diagnosticar problemas de autenticação
 */

(function() {
  console.log('🔍 INICIANDO DIAGNÓSTICO DE AUTENTICAÇÃO...');

  // Função para verificar token no localStorage e sessionStorage
  function checkTokenStorage() {
    console.group('1️⃣ Verificando tokens armazenados');
    
    const tokenKeys = ['accessToken', 'auth_token', 'token', 'authToken', 'jwt'];
    let foundToken = null;
    let tokenSource = null;
    
    // Verificar localStorage
    console.group('localStorage:');
    tokenKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`✅ ${key}: ${value.substring(0, 15)}...`);
        if (!foundToken) {
          foundToken = value;
          tokenSource = `localStorage.${key}`;
        }
      } else {
        console.log(`❌ ${key}: não encontrado`);
      }
    });
    console.groupEnd();
    
    // Verificar sessionStorage
    console.group('sessionStorage:');
    tokenKeys.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value) {
        console.log(`✅ ${key}: ${value.substring(0, 15)}...`);
        if (!foundToken) {
          foundToken = value;
          tokenSource = `sessionStorage.${key}`;
        }
      } else {
        console.log(`❌ ${key}: não encontrado`);
      }
    });
    console.groupEnd();
    
    // Resumo
    if (foundToken) {
      console.log(`✅ Token encontrado em: ${tokenSource}`);
    } else {
      console.log('❌ Nenhum token encontrado em localStorage ou sessionStorage');
    }
    
    console.groupEnd();
    return { token: foundToken, source: tokenSource };
  }
  
  // Função para analisar token JWT
  function analyzeToken(token) {
    if (!token) {
      console.log('❌ Nenhum token para analisar');
      return null;
    }
    
    console.group('2️⃣ Analisando token');
    
    // Verificar formato
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log(`❌ Formato inválido: token tem ${parts.length} partes, deveria ter 3`);
      console.groupEnd();
      return null;
    }
    
    try {
      // Decodificar header
      const header = JSON.parse(atob(parts[0]));
      console.log('✅ Header:', header);
      
      // Decodificar payload
      const payload = JSON.parse(atob(parts[1]));
      console.log('✅ Payload:', payload);
      
      // Verificar expiração
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        const isExpired = expDate < now;
        
        if (isExpired) {
          console.log(`❌ Token EXPIRADO em: ${expDate.toLocaleString()}`);
        } else {
          const timeLeft = Math.round((expDate.getTime() - now.getTime()) / 1000 / 60);
          console.log(`✅ Token válido até: ${expDate.toLocaleString()} (${timeLeft} minutos restantes)`);
        }
      } else {
        console.log('⚠️ Token não possui data de expiração');
      }
      
      console.groupEnd();
      return payload;
    } catch (error) {
      console.log('❌ Erro ao decodificar token:', error);
      console.groupEnd();
      return null;
    }
  }
  
  // Função para testar requisição autenticada
  async function testAuthenticatedRequest(token) {
    if (!token) {
      console.log('❌ Sem token para testar requisição');
      return false;
    }
    
    console.group('3️⃣ Testando requisição autenticada');
    
    try {
      console.log('🔄 Enviando requisição de teste para /api/auth/me...');
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Requisição bem-sucedida:', data);
        console.groupEnd();
        return true;
      } else {
        console.log(`❌ Erro ${response.status}: ${response.statusText}`);
        
        if (response.status === 401) {
          console.log('❌ Token não autorizado (401) - provavelmente inválido ou expirado');
        }
        
        console.groupEnd();
        return false;
      }
    } catch (error) {
      console.log('❌ Erro ao fazer requisição:', error);
      console.groupEnd();
      return false;
    }
  }
  
  // Função para limpar dados de autenticação
  function clearAuthData() {
    console.group('🧹 Limpando dados de autenticação');
    
    // Limpar localStorage
    ['accessToken', 'auth_token', 'token', 'authToken', 'jwt', 'refreshToken', 'user', 'userData'].forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removido ${key} do localStorage`);
    });
    
    // Limpar sessionStorage
    ['accessToken', 'auth_token', 'token', 'authToken', 'jwt'].forEach(key => {
      sessionStorage.removeItem(key);
      console.log(`🗑️ Removido ${key} do sessionStorage`);
    });
    
    console.log('✅ Todos os dados de autenticação foram limpos');
    console.groupEnd();
  }
  
  // Função principal de diagnóstico
  async function runDiagnostic() {
    console.log('🔄 Executando diagnóstico completo...');
    
    // Verificar armazenamento
    const { token, source } = checkTokenStorage();
    
    // Analisar token
    const payload = analyzeToken(token);
    
    // Testar requisição
    const requestSuccess = await testAuthenticatedRequest(token);
    
    // Resumo e recomendações
    console.group('📋 Resumo do diagnóstico');
    
    if (!token) {
      console.log('❌ Problema: Nenhum token encontrado');
      console.log('👉 Recomendação: Faça login novamente para obter um novo token');
    } else if (!payload) {
      console.log('❌ Problema: Token com formato inválido');
      console.log('👉 Recomendação: Limpe os dados de autenticação e faça login novamente');
    } else if (payload.exp && new Date(payload.exp * 1000) < new Date()) {
      console.log('❌ Problema: Token expirado');
      console.log('👉 Recomendação: Faça login novamente para obter um novo token');
    } else if (!requestSuccess) {
      console.log('❌ Problema: Token não aceito pelo servidor');
      console.log('👉 Recomendação: Verifique se o token é válido ou faça login novamente');
    } else {
      console.log('✅ Autenticação parece estar funcionando corretamente');
    }
    
    console.groupEnd();
    
    // Disponibilizar funções úteis
    window.authDiagnostic = {
      checkTokenStorage,
      analyzeToken,
      testAuthenticatedRequest,
      clearAuthData,
      runDiagnostic
    };
    
    console.log('\n🛠️ Funções de diagnóstico disponíveis:');
    console.log('- authDiagnostic.checkTokenStorage() - Verificar tokens armazenados');
    console.log('- authDiagnostic.analyzeToken(token) - Analisar token específico');
    console.log('- authDiagnostic.testAuthenticatedRequest(token) - Testar requisição');
    console.log('- authDiagnostic.clearAuthData() - Limpar dados de autenticação');
    console.log('- authDiagnostic.runDiagnostic() - Executar diagnóstico completo');
  }
  
  // Executar diagnóstico
  runDiagnostic();
})(); 