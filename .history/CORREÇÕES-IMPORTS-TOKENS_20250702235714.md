# Correções dos Erros de Importação de Tokens

## Problema
O arquivo `src/services/systemAdminService.ts` estava tentando importar funções que não existiam nos arquivos de utilidades:

### Funções faltantes em `src/utils/token-validator.ts`:
- `getCurrentToken`
- `syncTokenWithApiClient`
- `clearAllTokens`
- `debugAuth`

### Funções faltantes em `src/utils/token-refresh.ts`:
- `withAutoRefresh`

### Funções faltantes em `src/utils/auth-diagnostics.ts`:
- `runAuthDiagnostics` (já existia)
- `debugAuth`

## Solução Implementada

### 1. Atualizações em `src/utils/token-validator.ts`

Adicionadas as seguintes funções:

```typescript
// Função para obter o token atual do localStorage
export function getCurrentToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Tentar múltiplas chaves possíveis
  return localStorage.getItem('accessToken') || 
         localStorage.getItem('auth_token') ||
         localStorage.getItem('token') ||
         localStorage.getItem('authToken');
}

// Função para sincronizar o token com o apiClient
export async function syncTokenWithApiClient(token?: string): Promise<boolean> {
  try {
    const tokenToSync = token || getCurrentToken();
    
    if (!tokenToSync) {
      console.warn('⚠️ [SYNC-TOKEN] Nenhum token para sincronizar');
      return false;
    }
    
    // Importar apiClient dinamicamente para evitar dependências circulares
    const { apiClient } = await import('../lib/api-client');
    
    if (apiClient && typeof apiClient.setAuthToken === 'function') {
      apiClient.setAuthToken(tokenToSync);
      console.log('✅ [SYNC-TOKEN] Token sincronizado com apiClient');
      return true;
    } else {
      console.warn('⚠️ [SYNC-TOKEN] apiClient não disponível ou sem método setAuthToken');
      return false;
    }
  } catch (error) {
    console.error('❌ [SYNC-TOKEN] Erro ao sincronizar token:', error);
    return false;
  }
}

// Função para limpar todos os tokens
export function clearAllTokens(): void {
  if (typeof window === 'undefined') return;
  
  // Lista de possíveis chaves de token
  const tokenKeys = [
    'accessToken',
    'auth_token',
    'token',
    'authToken',
    'refreshToken',
    'refresh_token',
    'user',
    'userData'
  ];
  
  // Limpar localStorage
  tokenKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Limpar sessionStorage
  tokenKeys.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  // Limpar cookies relacionados
  const authCookies = ['accessToken', 'refreshToken', 'session', 'auth', 'token'];
  authCookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
  });
  
  console.log('🧹 [CLEAR-TOKENS] Todos os tokens foram limpos');
}

// Função para debug de autenticação
export function debugAuth(): void {
  console.group('🔍 Debug de Autenticação');
  
  const token = getCurrentToken();
  console.log('Token encontrado:', !!token);
  
  if (token) {
    const validation = validateToken(token);
    console.log('Token válido:', validation.isValid);
    console.log('Token expirado:', validation.isExpired);
    if (validation.payload) {
      console.log('Payload do token:', validation.payload);
    }
    if (validation.error) {
      console.log('Erro:', validation.error);
    }
  }
  
  console.groupEnd();
}
```

Também foi atualizada a função `isAuthenticated` para retornar um objeto com mais informações:

```typescript
export function isAuthenticated(): { authenticated: boolean; needsRefresh: boolean; error?: string } {
  const result = getAndValidateToken();
  
  if (!result.isValid) {
    return {
      authenticated: false,
      needsRefresh: result.isExpired,
      error: result.error || 'Token inválido'
    };
  }
  
  // Verificar se o token está próximo de expirar (menos de 5 minutos)
  if (result.payload?.exp) {
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = result.payload.exp - now;
    
    if (timeUntilExpiry < 300) { // Menos de 5 minutos
      return {
        authenticated: true,
        needsRefresh: true,
        error: undefined
      };
    }
  }
  
  return {
    authenticated: true,
    needsRefresh: false,
    error: undefined
  };
}
```

### 2. Atualizações em `src/utils/token-refresh.ts`

Adicionada a função `withAutoRefresh`:

```typescript
export async function withAutoRefresh<T>(
  fn: () => Promise<T>,
  options: RefreshTokenOptions = {}
): Promise<T> {
  try {
    // Tentar executar a função
    return await fn();
  } catch (error: any) {
    // Verificar se é erro de autenticação
    const isAuthError = 
      error?.status === 401 ||
      error?.message?.includes('401') ||
      error?.message?.includes('Unauthorized') ||
      error?.message?.includes('Token') ||
      error?.message?.includes('autenticação');
    
    if (isAuthError) {
      console.log('🔄 [AUTO-REFRESH] Erro de autenticação detectado, tentando renovar token...');
      
      // Tentar renovar o token
      const refreshResult = await refreshAuthToken(options);
      
      if (refreshResult.success) {
        console.log('✅ [AUTO-REFRESH] Token renovado com sucesso, tentando novamente...');
        
        // Tentar executar a função novamente
        return await fn();
      } else {
        console.error('❌ [AUTO-REFRESH] Falha ao renovar token:', refreshResult.error);
        throw error;
      }
    }
    
    // Se não for erro de autenticação, propagar o erro
    throw error;
  }
}
```

### 3. Atualizações em `src/utils/auth-diagnostics.ts`

Adicionadas as funções auxiliares:

```typescript
export function clearAllAuthData(): void {
  if (typeof window === 'undefined') return;
  
  // Lista de possíveis chaves de autenticação
  const authKeys = [
    'accessToken',
    'auth_token',
    'token',
    'authToken',
    'refreshToken',
    'refresh_token',
    'user',
    'userData',
    'userInfo',
    'session',
    'sessionId'
  ];
  
  // Limpar localStorage
  authKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Limpar sessionStorage
  authKeys.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  // Limpar cookies relacionados à autenticação
  const authCookies = ['accessToken', 'refreshToken', 'session', 'auth', 'token', 'sessionId'];
  authCookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
  });
  
  console.log('🧹 Todos os dados de autenticação foram limpos');
}

export async function testApiConnectivity(apiEndpoint: string = '/api/health'): Promise<{
  isConnected: boolean;
  responseTime?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      isConnected: response.ok,
      responseTime,
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (error) {
    return {
      isConnected: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export function debugAuth(): void {
  logAuthDiagnostics();
}
```

## Resultado

Após essas correções, todas as funções importadas no `systemAdminService.ts` agora existem e estão devidamente exportadas dos arquivos de utilidades correspondentes. Isso resolve os erros de importação que estavam ocorrendo.

## Observações

1. A função `getCurrentToken` agora tenta múltiplas chaves possíveis no localStorage para maior compatibilidade
2. A função `syncTokenWithApiClient` importa o apiClient dinamicamente para evitar dependências circulares
3. A função `clearAllTokens` limpa tokens de múltiplas fontes (localStorage, sessionStorage e cookies)
4. A função `withAutoRefresh` permite executar funções com renovação automática de token em caso de erro 401
5. A função `isAuthenticated` agora retorna um objeto com mais informações sobre o estado da autenticação