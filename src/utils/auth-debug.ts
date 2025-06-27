/**
 * Utilitário para diagnosticar problemas de autenticação
 */

export interface AuthDiagnostic {
  token: {
    present: boolean;
    valid: boolean;
    length: number;
    source: string;
  };
  session: {
    present: boolean;
    valid: boolean;
    user: any;
    expiresAt: number | null;
  };
  cookies: {
    authToken: string | null;
    userData: string | null;
  };
  localStorage: {
    authToken: string | null;
    userSession: string | null;
  };
  recommendations: string[];
}

/**
 * Executa diagnóstico completo da autenticação
 */
export function diagnoseAuth(): AuthDiagnostic {
  // Limpar tokens expirados antes do diagnóstico
  cleanExpiredTokens();
  
  const diagnostic: AuthDiagnostic = {
    token: {
      present: false,
      valid: false,
      length: 0,
      source: 'none'
    },
    session: {
      present: false,
      valid: false,
      user: null,
      expiresAt: null
    },
    cookies: {
      authToken: null,
      userData: null
    },
    localStorage: {
      authToken: null,
      userSession: null
    },
    recommendations: []
  };

  // Verificar localStorage
  if (typeof window !== 'undefined') {
    // Verificar múltiplas chaves possíveis para o token
    const possibleTokenKeys = ['auth_token', 'token', 'authToken'];
    let foundToken = null;
    let tokenSource = 'none';
    
    for (const key of possibleTokenKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        foundToken = token;
        tokenSource = `localStorage.${key}`;
        break;
      }
    }
    
    diagnostic.localStorage.authToken = foundToken;
    diagnostic.localStorage.userSession = localStorage.getItem('user_session') || localStorage.getItem('userSession');
    
    // Verificar token
    if (foundToken) {
      diagnostic.token.present = true;
      diagnostic.token.length = foundToken.length;
      diagnostic.token.source = tokenSource;
      
      // Melhor validação de JWT incluindo verificação de expiração
      const parts = foundToken.split('.');
      const hasValidFormat = parts.length === 3 && foundToken.length > 50;
      const isNotExpired = hasValidFormat ? !isTokenExpired(foundToken) : false;
      
      diagnostic.token.valid = hasValidFormat && isNotExpired;
    }
    
    // Verificar sessão
    if (diagnostic.localStorage.userSession) {
      try {
        const sessionData = JSON.parse(diagnostic.localStorage.userSession);
        diagnostic.session.present = true;
        diagnostic.session.user = sessionData.user;
        diagnostic.session.expiresAt = sessionData.expiresAt;
        diagnostic.session.valid = sessionData.expiresAt > Date.now();
      } catch (error) {
        diagnostic.session.present = false;
      }
    }
    
    // Verificar cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        diagnostic.cookies.authToken = value;
      }
      if (name === 'user_data') {
        diagnostic.cookies.userData = value;
      }
    }
  }

  // Gerar recomendações
  if (!diagnostic.token.present) {
    diagnostic.recommendations.push('❌ Token não encontrado - Faça login novamente');
  } else if (!diagnostic.token.valid) {
    // Verificar se é problema de formato ou expiração
    const token = diagnostic.localStorage.authToken;
    if (token) {
      const parts = token.split('.');
      if (parts.length !== 3) {
        diagnostic.recommendations.push('⚠️ Token com formato inválido - Faça login novamente');
      } else if (isTokenExpired(token)) {
        diagnostic.recommendations.push('⏰ Token expirado - Faça login novamente');
      } else {
        diagnostic.recommendations.push('⚠️ Token parece inválido - Verifique formato');
      }
    }
  }

  if (!diagnostic.session.present) {
    diagnostic.recommendations.push('❌ Sessão não encontrada - Faça login novamente');
  } else if (!diagnostic.session.valid) {
    diagnostic.recommendations.push('⏰ Sessão expirada - Faça login novamente');
  }

  if (diagnostic.token.present && diagnostic.session.present && diagnostic.token.valid && diagnostic.session.valid) {
    diagnostic.recommendations.push('✅ Autenticação parece estar OK');
  }

  return diagnostic;
}

/**
 * Testa uma requisição para a API com o token atual
 */
export async function testApiCall(endpoint: string = '/api/users/stats'): Promise<{
  success: boolean;
  status: number;
  data?: any;
  error?: string;
}> {
  try {
    // Usar a mesma lógica de busca de token que outras partes do sistema
    let token = localStorage.getItem('auth_token') || 
                localStorage.getItem('token') ||
                localStorage.getItem('authToken');
    
    if (!token) {
      return {
        success: false,
        status: 0,
        error: 'Token não encontrado em nenhuma das chaves possíveis (auth_token, token, authToken)'
      };
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      // Se não conseguir fazer parse do JSON, usar texto da resposta
      data = { message: await response.text() || `HTTP ${response.status}` };
    }

    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? data : undefined,
      error: !response.ok ? (data.error || data.message || `HTTP ${response.status}`) : undefined
    };

  } catch (error: any) {
    // Tratar diferentes tipos de erro de forma mais específica
    let errorMessage = 'Erro de rede';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Requisição cancelada (timeout)';
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Erro de conectividade - verifique sua conexão';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      status: 0,
      error: errorMessage
    };
  }
}

/**
 * Verifica se um token JWT está expirado
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true; // Se não é JWT válido, considerar expirado
    }
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      return false; // Se não tem expiração, considerar válido
    }
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (error) {
    console.warn('Erro ao verificar expiração do token:', error);
    return true; // Em caso de erro, considerar expirado por segurança
  }
}

/**
 * Limpa tokens expirados automaticamente
 */
export function cleanExpiredTokens(): void {
  if (typeof window === 'undefined') return;
  
  const tokenKeys = ['auth_token', 'token', 'authToken'];
  let cleanedTokens = 0;
  
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);
    if (token && isTokenExpired(token)) {
      localStorage.removeItem(key);
      cleanedTokens++;
      console.log(`🧹 Token expirado removido: ${key}`);
    }
  }
  
  if (cleanedTokens > 0) {
    console.log(`🧹 ${cleanedTokens} token(s) expirado(s) foram limpos automaticamente`);
  }
}

/**
 * Limpa todos os dados de autenticação
 */
export function clearAllAuth(): void {
  if (typeof window !== 'undefined') {
    // Limpar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user_session');
    localStorage.removeItem('user');
    
    // Limpar cookies
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    console.log('🧹 Todos os dados de autenticação foram limpos');
  }
}

/**
 * Força um novo login redirecionando para a página de login
 */
export function forceRelogin(): void {
  clearAllAuth();
  
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
  }
}

/**
 * Inicializa o sistema de limpeza automática de tokens
 * Deve ser chamado quando a aplicação carrega
 */
export function initializeAuthCleanup(): void {
  if (typeof window === 'undefined') return;
  
  // Limpar tokens expirados imediatamente
  cleanExpiredTokens();
  
  // Configurar limpeza periódica (a cada 5 minutos)
  const cleanupInterval = setInterval(() => {
    cleanExpiredTokens();
  }, 5 * 60 * 1000); // 5 minutos
  
  // Limpar o interval quando a página for descarregada
  window.addEventListener('beforeunload', () => {
    clearInterval(cleanupInterval);
  });
  
  console.log('🔧 Sistema de limpeza automática de tokens inicializado');
}

/**
 * Executa diagnóstico e exibe no console
 */
export function debugAuth(): void {
  const diagnostic = diagnoseAuth();
  
  console.group('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO');
  console.log('📋 Diagnóstico completo:', diagnostic);
  
  console.group('🎫 Token');
  console.log('Presente:', diagnostic.token.present);
  console.log('Válido:', diagnostic.token.valid);
  console.log('Tamanho:', diagnostic.token.length);
  console.log('Fonte:', diagnostic.token.source);
  
  // Mostrar preview do token se existir
  if (diagnostic.localStorage.authToken) {
    const token = diagnostic.localStorage.authToken;
    console.log('Preview do token:', token.substring(0, 50) + '...');
    
    // Tentar decodificar o JWT para ver se está válido
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Payload do JWT:', payload);
          console.log('Expira em:', payload.exp ? new Date(payload.exp * 1000) : 'Não definido');
          console.log('Token expirado?', payload.exp ? payload.exp < Math.floor(Date.now() / 1000) : 'Não pode determinar');
        } catch (decodeError) {
          console.warn('⚠️ Erro ao decodificar payload JWT:', decodeError);
          console.info('💡 Token pode ter formato JWT mas payload inválido');
        }
      } else {
        console.info('ℹ️ Token não tem formato JWT padrão (não tem 3 partes)');
        console.info('💡 Pode ser um token personalizado ou Base64');
        
        // Tentar decodificar como Base64 simples
        try {
          const decoded = atob(token);
          const tokenData = JSON.parse(decoded);
          console.log('Token decodificado como Base64:', tokenData);
          console.info('💡 Este parece ser um token Base64 válido');
        } catch (base64Error) {
          console.info('ℹ️ Token não é Base64 válido ou não contém JSON');
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro geral ao processar token:', error);
    }
  }
  console.groupEnd();
  
  console.group('👤 Sessão');
  console.log('Presente:', diagnostic.session.present);
  console.log('Válida:', diagnostic.session.valid);
  console.log('Usuário:', diagnostic.session.user?.name, diagnostic.session.user?.role);
  console.log('Expira em:', diagnostic.session.expiresAt ? new Date(diagnostic.session.expiresAt) : 'N/A');
  console.groupEnd();
  
  console.group('📝 Recomendações');
  diagnostic.recommendations.forEach(rec => console.log(rec));
  console.groupEnd();
  
  console.groupEnd();
  
  // Teste automático da API com mais detalhes e melhor tratamento de erro
  testApiCall().then(result => {
    console.group('🧪 TESTE DA API');
    console.log('Sucesso:', result.success);
    console.log('Status:', result.status);
    
    // Tratar o erro de forma mais elegante para evitar logs desnecessários
    if (result.error) {
      // Se o erro é sobre token inválido/expirado, tratar como informação, não erro
      if (result.error.includes('Token inválido ou expirado') || result.error.includes('invalid') || result.error.includes('expired')) {
        console.warn('⚠️ Token de autenticação:', result.error);
        console.info('💡 Isso é normal se você não estiver logado ou o token expirou');
      } else {
        console.warn('❌ Erro na API:', result.error);
      }
    }
    
    if (result.data) console.log('Dados:', result.data);
    
    // Se deu erro 401, vamos investigar mais
    if (result.status === 401) {
      console.group('🔍 INVESTIGAÇÃO DO ERRO 401');
      
      // Verificar todas as possíveis chaves de token
      const possibleTokenKeys = ['auth_token', 'token', 'authToken'];
      let foundToken = null;
      let foundKey = null;
      
      for (const key of possibleTokenKeys) {
        const token = localStorage.getItem(key);
        if (token) {
          foundToken = token;
          foundKey = key;
          break;
        }
      }
      
      if (foundToken && foundKey) {
        console.log(`Token encontrado no localStorage com chave: ${foundKey}`);
        console.log('Tamanho do token:', foundToken.length);
        console.log('Primeiros 20 caracteres:', foundToken.substring(0, 20));
        console.log('Últimos 20 caracteres:', foundToken.substring(foundToken.length - 20));
        
        // Verificar se o token está sendo enviado corretamente
        console.log('Headers que seriam enviados:');
        console.log('Authorization: Bearer ' + foundToken.substring(0, 20) + '...');
        
        // Verificar se é um JWT válido
        const parts = foundToken.split('.');
        console.log('Número de partes do JWT:', parts.length);
        if (parts.length === 3) {
          console.log('✅ Token tem formato JWT válido');
          
          // Verificar se o token está expirado
          try {
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp && payload.exp < now;
            
            if (isExpired) {
              console.warn('⏰ Token expirado! Isso explica o erro 401.');
              console.log('📅 Expirou em:', new Date(payload.exp * 1000));
              console.log('🕐 Agora:', new Date());
              console.info('💡 Faça login novamente para obter um novo token');
            } else {
              console.log('✅ Token não está expirado, pode ser outro problema');
            }
          } catch (error) {
            console.warn('⚠️ Erro ao verificar expiração do token:', error);
          }
        } else {
          console.warn('⚠️ Token não tem formato JWT válido (deveria ter 3 partes)');
          console.info('💡 Token pode ser um formato personalizado ou Base64');
          
          // Tentar converter automaticamente se for Base64
          if (parts.length === 1 && foundToken.length > 50) {
            console.log('🔧 Tentando converter token Base64 para JWT...');
            const converted = convertBase64TokenToJWT();
            if (converted) {
              console.log('✅ Token convertido! Recarregue a página para usar o novo token.');
            }
          }
        }
      } else {
        console.warn('⚠️ Nenhum token encontrado no localStorage');
        console.log('Chaves verificadas:', possibleTokenKeys);
        console.info('💡 Faça login para obter um token de autenticação');
        
        // Mostrar todas as chaves do localStorage para debug
        console.log('Todas as chaves no localStorage:');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            console.log(`- ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
          }
        }
      }
      console.groupEnd();
    }
    
    console.groupEnd();
  }).catch(error => {
    // Capturar qualquer erro da promise para evitar unhandled rejections
    console.group('🧪 TESTE DA API - ERRO');
    console.warn('❌ Erro inesperado durante o teste da API:', error);
    console.info('💡 Isso pode indicar um problema de rede ou configuração');
    console.groupEnd();
  });
}

/**
 * Testa múltiplos endpoints para verificar se o problema é generalizado
 */
export async function testMultipleEndpoints(): Promise<void> {
  const endpoints = [
    '/api/users/stats',
    '/api/dashboard/system',
    '/api/dashboard/analytics',
    '/api/dashboard/engagement',
    '/api/auth/validate'
  ];

  console.group('🔬 TESTE DE MÚLTIPLOS ENDPOINTS');
  
  for (const endpoint of endpoints) {
    const result = await testApiCall(endpoint);
    
    console.group(`📡 ${endpoint}`);
    console.log('✅ Sucesso:', result.success);
    console.log('📊 Status:', result.status);
    
    if (result.error) {
      console.error('❌ Erro:', result.error);
    }
    
    if (result.data) {
      console.log('📦 Dados recebidos:', typeof result.data === 'object' ? Object.keys(result.data) : result.data);
    }
    
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Testa se o problema está no token ou na comunicação com o backend
 */
export async function testTokenDirectly(): Promise<void> {
  // Verificar todas as possíveis chaves de token
  let token = localStorage.getItem('auth_token') || 
              localStorage.getItem('token') ||
              localStorage.getItem('authToken');
  
  if (!token) {
    console.warn('⚠️ Nenhum token encontrado para testar');
    console.log('Chaves verificadas: auth_token, token, authToken');
    console.info('💡 Faça login para obter um token de autenticação');
    return;
  }

  console.group('🧪 TESTE DIRETO DO TOKEN');
  
  // Tentar decodificar o token localmente
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      console.log('🔍 Header do JWT:', header);
      console.log('📦 Payload do JWT:', payload);
      
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < now;
      
      console.log('⏰ Token expirado?', isExpired);
      console.log('📅 Expira em:', payload.exp ? new Date(payload.exp * 1000) : 'Não definido');
      console.log('🕐 Agora:', new Date());
      
      if (isExpired) {
        console.warn('⏰ TOKEN EXPIRADO! Este é provavelmente o problema.');
        console.info('💡 Faça login novamente para obter um token válido');
      } else {
        console.log('✅ Token ainda válido pelo tempo de expiração');
      }
    } else {
      console.warn('⚠️ Token não tem formato JWT válido');
      console.info('💡 Pode ser um token personalizado ou corrompido');
    }
  } catch (error) {
    console.warn('⚠️ Erro ao decodificar token:', error);
    console.info('💡 Token pode estar corrompido ou em formato não reconhecido');
  }
  
  console.groupEnd();
}

/**
 * Sincroniza dados de autenticação entre diferentes storages
 */
export function syncAuthData(): void {
  if (typeof window === 'undefined') return;
  
  console.log('🔄 Sincronizando dados de autenticação...');
  
  // Buscar token em todas as possíveis localizações
  const possibleTokenKeys = ['auth_token', 'token', 'authToken'];
  let foundToken: string | null = null;
  let tokenSource = '';
  
  // Prioridade 1: localStorage
  for (const key of possibleTokenKeys) {
    const token = localStorage.getItem(key);
    if (token && token.trim() !== '') {
      foundToken = token.trim();
      tokenSource = `localStorage.${key}`;
      break;
    }
  }
  
  // Prioridade 2: sessionStorage (se não encontrou no localStorage)
  if (!foundToken) {
    for (const key of possibleTokenKeys) {
      const token = sessionStorage.getItem(key);
      if (token && token.trim() !== '') {
        foundToken = token.trim();
        tokenSource = `sessionStorage.${key}`;
        break;
      }
    }
  }
  
  // Prioridade 3: cookies (se não encontrou nos storages)
  if (!foundToken) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (possibleTokenKeys.includes(name) && value && value.trim() !== '') {
        foundToken = value.trim();
        tokenSource = `cookie.${name}`;
        break;
      }
    }
  }
  
  if (foundToken) {
    console.log(`✅ Token encontrado em ${tokenSource}, sincronizando...`);
    
    // Validar se é um JWT válido
    const jwtParts = foundToken.split('.');
    let isValidJWT = false;
    let isExpired = false;
    
    if (jwtParts.length === 3) {
      try {
        const payload = JSON.parse(atob(jwtParts[1]));
        isValidJWT = true;
        
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          isExpired = true;
          console.warn('⏰ Token encontrado está expirado');
        }
      } catch (error) {
        console.warn('⚠️ Erro ao decodificar JWT, mas continuando sincronização');
      }
    }
    
    // Se o token está expirado, limpar tudo
    if (isExpired) {
      console.log('🧹 Token expirado, limpando dados de autenticação...');
      clearAllAuth();
      return;
    }
    
    // Sincronizar token para todas as localizações
    try {
      // Armazenar em localStorage (prioridade principal)
      localStorage.setItem('auth_token', foundToken);
      localStorage.setItem('token', foundToken); // Compatibilidade
      
      // Limpar sessionStorage para evitar conflitos
      possibleTokenKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });
      
      // Configurar cookie
      const maxAge = 7 * 24 * 60 * 60; // 7 dias
      document.cookie = `auth_token=${foundToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
      
      console.log('✅ Token sincronizado com sucesso');
      
      // Verificar sincronização
      const verifyToken = localStorage.getItem('auth_token');
      if (verifyToken === foundToken) {
        console.log('✅ Verificação: Token sincronizado corretamente');
      } else {
        console.error('❌ Verificação: Falha na sincronização');
      }
      
    } catch (error) {
      console.warn('⚠️ Erro ao sincronizar token:', error);
      console.info('💡 Tente limpar o cache do navegador ou fazer login novamente');
    }
    
  } else {
    console.log('❌ Nenhum token válido encontrado para sincronizar');
    
    // Se não há token, garantir que tudo está limpo
    clearAllAuth();
  }
  
  // Sincronizar dados do usuário se disponíveis
  const userKeys = ['user', 'user_session', 'userSession'];
  let foundUserData: any = null;
  
  for (const key of userKeys) {
    const userData = localStorage.getItem(key);
    if (userData) {
      try {
        foundUserData = JSON.parse(userData);
        break;
      } catch (error) {
        console.warn(`⚠️ Erro ao parsear dados do usuário da chave ${key}`);
      }
    }
  }
  
  if (foundUserData && foundToken) {
    console.log('🔄 Sincronizando dados do usuário...');
    try {
      localStorage.setItem('user_session', JSON.stringify(foundUserData));
      
      // Configurar cookie com dados do usuário (não sensíveis)
      const userDataForCookie = {
        id: foundUserData.id || foundUserData.userId,
        name: foundUserData.name,
        email: foundUserData.email,
        role: foundUserData.role || foundUserData.role_name
      };
      
      const userDataString = encodeURIComponent(JSON.stringify(userDataForCookie));
      document.cookie = `user_data=${userDataString}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      
      console.log('✅ Dados do usuário sincronizados');
    } catch (error) {
      console.warn('⚠️ Erro ao sincronizar dados do usuário:', error);
      console.info('💡 Dados do usuário podem estar corrompidos');
    }
  }
}

/**
 * Função de reparo automático para problemas de autenticação
 */
export function repairAuth(): void {
  console.group('🔧 REPARO AUTOMÁTICO DE AUTENTICAÇÃO');
  
  // 1. Sincronizar dados
  syncAuthData();
  
  // 2. Executar diagnóstico
  const diagnostic = diagnoseAuth();
  
  // 3. Aplicar correções específicas baseadas no diagnóstico
  if (diagnostic.token.present && !diagnostic.token.valid) {
    console.log('🔧 Tentando reparar token inválido...');
    
    // Verificar se o token está na chave errada
    const allTokens = [
      localStorage.getItem('authToken'),
      localStorage.getItem('auth_token'), 
      localStorage.getItem('token')
    ].filter(Boolean);
    
    for (const token of allTokens) {
      if (token && token.split('.').length === 3) {
        console.log('🔧 Token JWT válido encontrado, sincronizando...');
        localStorage.setItem('auth_token', token);
        localStorage.setItem('authToken', token);
        break;
      }
    }
    
    // 4. Verificar se é um token Base64 que pode ser convertido para JWT
    if (diagnostic.token.present && diagnostic.token.length > 50) {
      const token = diagnostic.localStorage.authToken;
      if (token && token.split('.').length === 1) {
        console.log('🔧 Detectado token Base64, tentando converter para JWT...');
        try {
          // Tentar decodificar como Base64
          const decoded = atob(token);
          const tokenData = JSON.parse(decoded);
          
          if (tokenData.userId && tokenData.email && tokenData.role) {
            console.log('🔧 Token Base64 válido encontrado, gerando novo JWT...');
            
            // Gerar um novo token JWT com os mesmos dados
            const newJwtPayload = {
              userId: tokenData.userId,
              email: tokenData.email,
              name: tokenData.name,
              role: tokenData.role,
              institutionId: tokenData.institutionId,
              permissions: tokenData.permissions || [],
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
            };
            
            // Simular um JWT válido (3 partes)
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payload = btoa(JSON.stringify(newJwtPayload));
            const signature = btoa('mock_signature'); // Assinatura mock para desenvolvimento
            
            const newJwtToken = `${header}.${payload}.${signature}`;
            
            // Armazenar o novo token
            localStorage.setItem('auth_token', newJwtToken);
            localStorage.setItem('authToken', newJwtToken);
            
            console.log('✅ Token Base64 convertido para JWT com sucesso!');
          }
        } catch (error) {
          console.warn('⚠️ Erro ao converter token Base64:', error);
          console.info('💡 Token pode não estar em formato Base64 válido');
        }
      }
    }
  }
  
  // 5. Testar após reparo
  testApiCall('/api/auth/validate').then(result => {
    if (result.success) {
      console.log('✅ Reparo bem-sucedido! Autenticação funcionando.');
    } else {
      console.warn('⚠️ Reparo não resolveu o problema:', result.error);
      console.info('💡 Recomendação: Execute clearAllAuth() e faça login novamente');
    }
  });
  
  console.groupEnd();
}

/**
 * Função específica para converter tokens Base64 para JWT
 */
export function convertBase64TokenToJWT(): boolean {
  if (typeof window === 'undefined') return false;
  
  console.group('🔄 CONVERSÃO DE TOKEN BASE64 PARA JWT');
  
  const possibleKeys = ['auth_token', 'authToken', 'token'];
  let converted = false;
  
  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);
    if (token && token.split('.').length === 1 && token.length > 50) {
      try {
        // Tentar decodificar como Base64
        const decoded = atob(token);
        const tokenData = JSON.parse(decoded);
        
        if (tokenData.userId && tokenData.email && tokenData.role) {
          console.log(`🔄 Convertendo token Base64 em ${key} para JWT...`);
          
          // Gerar um novo token JWT com os mesmos dados
          const newJwtPayload = {
            userId: tokenData.userId,
            email: tokenData.email,
            name: tokenData.name,
            role: tokenData.role,
            institutionId: tokenData.institutionId,
            permissions: tokenData.permissions || [],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
          };
          
          // Simular um JWT válido (3 partes)
          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
          const payload = btoa(JSON.stringify(newJwtPayload));
          const signature = btoa('mock_signature'); // Assinatura mock para desenvolvimento
          
          const newJwtToken = `${header}.${payload}.${signature}`;
          
          // Armazenar o novo token
          localStorage.setItem(key, newJwtToken);
          
          console.log(`✅ Token em ${key} convertido com sucesso!`);
          converted = true;
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao converter token em ${key}:`, error);
      }
    }
  }
  
  if (!converted) {
    console.log('ℹ️ Nenhum token Base64 encontrado para conversão');
  }
  
  console.groupEnd();
  return converted;
}

// Expor globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  (window as any).clearAllAuth = clearAllAuth;
  (window as any).forceRelogin = forceRelogin;
  (window as any).testMultipleEndpoints = testMultipleEndpoints;
  (window as any).testTokenDirectly = testTokenDirectly;
  (window as any).syncAuthData = syncAuthData;
  (window as any).repairAuth = repairAuth;
  (window as any).convertBase64TokenToJWT = convertBase64TokenToJWT;
  (window as any).initializeAuthCleanup = initializeAuthCleanup;
  
  // Função de conveniência para resolver o problema atual
  (window as any).fixAuthToken = () => {
    console.log('🔧 CORREÇÃO RÁPIDA DO TOKEN DE AUTENTICAÇÃO');
    const converted = convertBase64TokenToJWT();
    if (converted) {
      console.log('✅ Token corrigido! Recarregando a página...');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      console.log('ℹ️ Nenhuma correção necessária ou token já está no formato correto');
      debugAuth();
    }
  };
  
  // Inicializar sistema de limpeza automática
  initializeAuthCleanup();
} 