/**
 * Utilitário para refresh de tokens de autenticação
 */

import { getCurrentToken, validateToken, clearAllTokens } from './token-validator';

export interface TokenRefreshResult {
  success: boolean;
  newToken?: string;
  error?: string;
  shouldRelogin?: boolean;
}

/**
 * Tenta fazer refresh do token atual
 */
export async function refreshAuthToken(): Promise<TokenRefreshResult> {
  console.log('🔄 [TOKEN-REFRESH] Iniciando refresh do token...');

  try {
    // Verificar se há token atual
    const currentToken = getCurrentToken();
    if (!currentToken) {
      console.warn('⚠️ [TOKEN-REFRESH] Nenhum token encontrado para refresh');
      return {
        success: false,
        error: 'Nenhum token encontrado',
        shouldRelogin: true
      };
    }

    // Validar token atual
    const validation = validateToken(currentToken);
    console.log('🔍 [TOKEN-REFRESH] Validação do token atual:', validation);

    // Se o token ainda é válido e não precisa refresh, retornar sucesso
    if (validation.isValid && !validation.needsRefresh) {
      console.log('✅ [TOKEN-REFRESH] Token ainda válido, refresh não necessário');
      return {
        success: true,
        newToken: currentToken
      };
    }

    // Tentar refresh via API
    console.log('🔄 [TOKEN-REFRESH] Tentando refresh via /api/auth/refresh...');
    
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      credentials: 'include'
    });

    console.log('📡 [TOKEN-REFRESH] Resposta do refresh:', {
      status: refreshResponse.status,
      ok: refreshResponse.ok
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      
      if (data.success && data.token) {
        console.log('✅ [TOKEN-REFRESH] Novo token obtido com sucesso');
        
        // Armazenar novo token
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('token', data.token);
          
          // Atualizar cookie também
          const maxAge = 7 * 24 * 60 * 60; // 7 dias
          document.cookie = `auth_token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        }
        
        return {
          success: true,
          newToken: data.token
        };
      } else {
        console.warn('⚠️ [TOKEN-REFRESH] Resposta de refresh sem token válido:', data);
        return {
          success: false,
          error: data.message || 'Refresh retornou resposta inválida',
          shouldRelogin: true
        };
      }
    } else {
      const errorText = await refreshResponse.text();
      console.error('❌ [TOKEN-REFRESH] Erro no refresh:', {
        status: refreshResponse.status,
        error: errorText
      });
      
      // Se for 401, o refresh token também expirou
      if (refreshResponse.status === 401) {
        return {
          success: false,
          error: 'Refresh token expirado',
          shouldRelogin: true
        };
      }
      
      return {
        success: false,
        error: `Erro no refresh: ${refreshResponse.status} - ${errorText}`,
        shouldRelogin: refreshResponse.status === 401 || refreshResponse.status === 403
      };
    }

  } catch (error) {
    console.error('❌ [TOKEN-REFRESH] Erro durante refresh:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no refresh',
      shouldRelogin: false // Não forçar relogin em caso de erro de rede
    };
  }
}

/**
 * Verifica se o token precisa de refresh e faz automaticamente se necessário
 */
export async function autoRefreshToken(): Promise<boolean> {
  console.log('🔄 [TOKEN-REFRESH] Verificando necessidade de auto-refresh...');

  const currentToken = getCurrentToken();
  if (!currentToken) {
    console.log('⚠️ [TOKEN-REFRESH] Nenhum token para auto-refresh');
    return false;
  }

  const validation = validateToken(currentToken);
  
  // Se o token é válido e não precisa refresh, não fazer nada
  if (validation.isValid && !validation.needsRefresh) {
    console.log('✅ [TOKEN-REFRESH] Token válido, auto-refresh não necessário');
    return true;
  }

  // Se o token já expirou, não tentar refresh automático
  if (validation.isExpired) {
    console.log('⚠️ [TOKEN-REFRESH] Token expirado, auto-refresh não possível');
    return false;
  }

  // Se precisa refresh mas ainda é válido, tentar refresh
  if (validation.needsRefresh) {
    console.log('🔄 [TOKEN-REFRESH] Token precisa refresh, tentando...');
    
    const refreshResult = await refreshAuthToken();
    
    if (refreshResult.success) {
      console.log('✅ [TOKEN-REFRESH] Auto-refresh bem-sucedido');
      return true;
    } else {
      console.warn('⚠️ [TOKEN-REFRESH] Auto-refresh falhou:', refreshResult.error);
      
      if (refreshResult.shouldRelogin) {
        console.log('🔄 [TOKEN-REFRESH] Limpando tokens e forçando relogin...');
        clearAllTokens();
      }
      
      return false;
    }
  }

  return false;
}

/**
 * Middleware para requisições que automaticamente tenta refresh se necessário
 */
export async function withAutoRefresh<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    // Tentar operação primeiro
    return await operation();
  } catch (error: any) {
    // Se for erro de autenticação, tentar refresh e repetir
    if (error?.status === 401 || error?.message?.includes('Token')) {
      console.log('🔄 [TOKEN-REFRESH] Erro de auth detectado, tentando refresh...');
      
      const refreshResult = await refreshAuthToken();
      
      if (refreshResult.success) {
        console.log('✅ [TOKEN-REFRESH] Refresh bem-sucedido, repetindo operação...');
        
        // Tentar operação novamente com novo token
        return await operation();
      } else {
        console.error('❌ [TOKEN-REFRESH] Refresh falhou, propagando erro original');
        
        if (refreshResult.shouldRelogin) {
          clearAllTokens();
          // Redirecionar para login se necessário
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        
        throw error;
      }
    }
    
    // Se não for erro de auth, propagar erro original
    throw error;
  }
}

/**
 * Configura refresh automático em intervalos
 */
export function setupAutoRefreshInterval(intervalMinutes: number = 30): () => void {
  console.log(`🔄 [TOKEN-REFRESH] Configurando auto-refresh a cada ${intervalMinutes} minutos`);
  
  const intervalMs = intervalMinutes * 60 * 1000;
  
  const intervalId = setInterval(async () => {
    console.log('🔄 [TOKEN-REFRESH] Executando auto-refresh periódico...');
    await autoRefreshToken();
  }, intervalMs);
  
  // Executar uma vez imediatamente
  autoRefreshToken();
  
  // Retornar função para limpar o interval
  return () => {
    console.log('🔄 [TOKEN-REFRESH] Parando auto-refresh periódico');
    clearInterval(intervalId);
  };
}

// Expor funções globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).refreshAuthToken = refreshAuthToken;
  (window as any).autoRefreshToken = autoRefreshToken;
}
