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
  
