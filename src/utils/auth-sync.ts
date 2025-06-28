/**
 * Utilitário para sincronizar autenticação entre frontend local e backend de produção
 */

export interface AuthSyncResult {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}

/**
 * Obtém um token válido do backend de produção
 */
export async function getValidTokenFromProduction(): Promise<AuthSyncResult> {
  try {
    // Tentar diferentes credenciais de admin
    const credentials = [
      { email: 'admin@sabercon.edu.br', password: 'admin123' },
      { email: 'admin@sabercon.com.br', password: 'admin123' },
      { email: 'estevao@programmer.net', password: 'admin123' },
      { email: 'admin@sabercon.edu.br', password: 'ExagonTech' }
    ];

    for (const cred of credentials) {
      try {
        const loginResponse = await fetch('https://portal.sabercon.com.br/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(cred),
          signal: AbortSignal.timeout(10000) // 10 segundos timeout
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          
          if (loginData.success && loginData.token) {
            // Armazenar token localmente
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth_token', loginData.token);
              localStorage.setItem('token', loginData.token);
              
              if (loginData.user) {
                localStorage.setItem('user', JSON.stringify(loginData.user));
              }

              // Configurar cookie
              document.cookie = `auth_token=${loginData.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            }

            return {
              success: true,
              token: loginData.token,
              user: loginData.user,
              message: `Token obtido com sucesso usando ${cred.email}`
            };
          }
        }
      } catch (credError) {
        console.log(`Falha com credencial ${cred.email}:`, credError);
        continue; // Tentar próxima credencial
      }
    }

    throw new Error('Todas as credenciais falharam');
  } catch (error) {
    console.error('Erro ao obter token de produção:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Valida se o token atual ainda é válido
 */
export async function validateCurrentToken(): Promise<AuthSyncResult> {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  
  if (!token) {
    return {
      success: false,
      message: 'Nenhum token encontrado'
    };
  }

  try {
    // Testar token com uma requisição simples
    const testResponse = await fetch('https://portal.sabercon.com.br/api/users/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });

    if (testResponse.ok) {
      return {
        success: true,
        token,
        message: 'Token válido'
      };
    }

    if (testResponse.status === 401) {
      return {
        success: false,
        message: 'Token expirado ou inválido'
      };
    }

    throw new Error(`Validation failed: ${testResponse.status}`);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro de validação'
    };
  }
}

/**
 * Sincroniza autenticação - valida token atual ou obtém novo
 */
export async function syncAuthentication(): Promise<AuthSyncResult> {
  console.log('🔄 Sincronizando autenticação...');
  
  // Primeiro, tentar validar token atual
  const validation = await validateCurrentToken();
  
  if (validation.success) {
    console.log('✅ Token atual é válido');
    return validation;
  }

  console.log('⚠️ Token atual inválido, obtendo novo token...');
  
  // Se token atual não é válido, obter novo
  const newAuth = await getValidTokenFromProduction();
  
  if (newAuth.success) {
    console.log('✅ Novo token obtido com sucesso');
    return newAuth;
  }

  console.log('❌ Falha ao obter novo token');
  return newAuth;
}

/**
 * Limpa todos os dados de autenticação
 */
export function clearAuthentication(): void {
  const keysToRemove = ['auth_token', 'token', 'authToken', 'user', 'userData'];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // Limpar cookies
  const cookiesToClear = ['auth_token', 'token', 'authToken', 'user_data'];
  cookiesToClear.forEach(cookieName => {
    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });

  console.log('🧹 Autenticação limpa');
}

/**
 * Hook para usar em componentes React
 */
export function useAuthSync() {
  const sync = async () => {
    return await syncAuthentication();
  };

  const validate = async () => {
    return await validateCurrentToken();
  };

  const clear = () => {
    clearAuthentication();
  };

  return { sync, validate, clear };
}
