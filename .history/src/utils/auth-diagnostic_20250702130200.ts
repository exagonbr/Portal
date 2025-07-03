import { getAuthToken, clearAuthToken } from '../services/auth';

export interface AuthDiagnosticResult {
  hasToken: boolean;
  tokenValid: boolean;
  tokenExpired: boolean;
  tokenFormat: 'jwt' | 'base64' | 'invalid';
  userId?: string;
  email?: string;
  role?: string;
  expiresAt?: Date;
  recommendations: string[];
  errors: string[];
}

export interface TokenPayload {
  userId?: string;
  id?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  type?: string;
}

/**
 * Diagnóstico completo do estado de autenticação
 */
export async function runAuthDiagnostics(): Promise<AuthDiagnosticResult> {
  const result: AuthDiagnosticResult = {
    hasToken: false,
    tokenValid: false,
    tokenExpired: false,
    tokenFormat: 'invalid',
    recommendations: [],
    errors: []
  };

  try {
    // 1. Verificar se existe token
    const token = getAuthToken();
    if (!token) {
      result.errors.push('Token de autenticação não encontrado');
      result.recommendations.push('Faça login novamente');
      return result;
    }

    result.hasToken = true;

    // 2. Analisar formato do token
    const tokenAnalysis = analyzeTokenFormat(token);
    result.tokenFormat = tokenAnalysis.format;

    if (tokenAnalysis.format === 'invalid') {
      result.errors.push('Formato de token inválido');
      result.recommendations.push('Limpe o cache e faça login novamente');
      return result;
    }

    // 3. Decodificar payload do token
    const payload = decodeTokenPayload(token, tokenAnalysis.format);
    if (!payload) {
      result.errors.push('Não foi possível decodificar o token');
      result.recommendations.push('Token corrompido - faça login novamente');
      return result;
    }

    // 4. Extrair informações do usuário
    result.userId = payload.userId || payload.id;
    result.email = payload.email;
    result.role = payload.role;

    // 5. Verificar expiração
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      result.expiresAt = expirationDate;
      result.tokenExpired = Date.now() >= payload.exp * 1000;

      if (result.tokenExpired) {
        result.errors.push(`Token expirado em ${expirationDate.toLocaleString()}`);
        result.recommendations.push('Token expirado - tente renovar ou faça login novamente');
      }
    }

    // 6. Teste de validação com backend
    const backendValidation = await testTokenWithBackend(token);
    result.tokenValid = backendValidation.valid;

    if (!backendValidation.valid) {
      result.errors.push(`Validação do backend falhou: ${backendValidation.error}`);
      result.recommendations.push('Token rejeitado pelo servidor - faça login novamente');
    }

    // 7. Gerar recomendações
    if (result.tokenValid && !result.tokenExpired) {
      result.recommendations.push('Token válido e funcionando corretamente');
    } else if (result.tokenExpired) {
      result.recommendations.push('Tente renovar o token automaticamente');
      result.recommendations.push('Se a renovação falhar, faça login novamente');
    }

  } catch (error) {
    result.errors.push(`Erro durante diagnóstico: ${error instanceof Error ? error.message : String(error)}`);
    result.recommendations.push('Erro inesperado - limpe o cache e faça login novamente');
  }

  return result;
}

/**
 * Analisa o formato do token
 */
function analyzeTokenFormat(token: string): { format: 'jwt' | 'base64' | 'invalid'; parts?: string[] } {
  if (!token || typeof token !== 'string') {
    return { format: 'invalid' };
  }

  // Verificar se é JWT (formato: header.payload.signature)
  const jwtParts = token.split('.');
  if (jwtParts.length === 3) {
    try {
      // Tentar decodificar o header para confirmar que é JWT
      const header = JSON.parse(atob(jwtParts[0]));
      if (header.typ === 'JWT' || header.alg) {
        return { format: 'jwt', parts: jwtParts };
      }
    } catch {
      // Não é JWT válido
    }
  }

  // Verificar se é base64 válido
  try {
    const decoded = atob(token);
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === 'object') {
      return { format: 'base64' };
    }
  } catch {
    // Não é base64 válido
  }

  return { format: 'invalid' };
}

/**
 * Decodifica o payload do token baseado no formato
 */
function decodeTokenPayload(token: string, format: 'jwt' | 'base64'): TokenPayload | null {
  try {
    if (format === 'jwt') {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } else if (format === 'base64') {
      const decoded = atob(token);
      const payload = JSON.parse(decoded);
      return payload;
    }
  } catch (error) {
    console.warn('Erro ao decodificar token:', error);
  }
  
  return null;
}

/**
 * Testa o token com o backend
 */
async function testTokenWithBackend(token: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return { valid: true };
    } else {
      const errorText = await response.text();
      return { valid: false, error: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Erro de conexão' 
    };
  }
}

/**
 * Função de auto-reparo para problemas comuns de autenticação
 */
export async function autoRepairAuth(): Promise<{ success: boolean; actions: string[] }> {
  const actions: string[] = [];
  
  try {
    const diagnosis = await runAuthDiagnostics();
    
    // 1. Se não há token, não há o que reparar
    if (!diagnosis.hasToken) {
      return { success: false, actions: ['Nenhum token encontrado - login necessário'] };
    }

    // 2. Se token está expirado, tentar renovar
    if (diagnosis.tokenExpired) {
      actions.push('Token expirado detectado');
      
      try {
        const refreshResult = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (refreshResult.ok) {
          const data = await refreshResult.json();
          if (data.success && data.data?.token) {
            // Salvar novo token
            localStorage.setItem('auth_token', data.data.token);
            actions.push('Token renovado com sucesso');
            return { success: true, actions };
          }
        }
      } catch (error) {
        actions.push(`Falha na renovação: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // 3. Se token é inválido, limpar e forçar novo login
    if (!diagnosis.tokenValid || diagnosis.tokenFormat === 'invalid') {
      actions.push('Token inválido detectado - limpando cache');
      clearAuthToken();
      actions.push('Cache limpo - redirecionamento para login necessário');
      
      // Redirecionar para login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?reason=invalid_token';
      }
      
      return { success: true, actions };
    }

    // 4. Se chegou até aqui, token parece válido
    actions.push('Token válido - nenhuma ação necessária');
    return { success: true, actions };

  } catch (error) {
    actions.push(`Erro durante auto-reparo: ${error instanceof Error ? error.message : String(error)}`);
    return { success: false, actions };
  }
}

/**
 * Função de debug para console do navegador
 */
export function debugAuthState(): void {
  console.group('🔍 Debug de Autenticação');
  
  runAuthDiagnostics().then(result => {
    console.log('📊 Diagnóstico completo:', result);
    
    if (result.errors.length > 0) {
      console.group('❌ Erros encontrados:');
      result.errors.forEach(error => console.error(error));
      console.groupEnd();
    }
    
    if (result.recommendations.length > 0) {
      console.group('💡 Recomendações:');
      result.recommendations.forEach(rec => console.info(rec));
      console.groupEnd();
    }
    
    console.groupEnd();
  }).catch(error => {
    console.error('Erro durante diagnóstico:', error);
    console.groupEnd();
  });
}

// Expor função para uso global no console
if (typeof window !== 'undefined') {
  (window as any).debugAuthState = debugAuthState;
}
