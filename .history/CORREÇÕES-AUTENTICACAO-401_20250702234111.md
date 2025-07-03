# Correções para Erros 401 - Sistema de Autenticação

## Problema Identificado

Os endpoints estão retornando erro 401 (Unauthorized) porque:

1. O frontend não está enviando o token de autenticação corretamente
2. Os endpoints diretos precisam de melhor tratamento de refresh token
3. Falta consistência entre os diferentes padrões de autenticação

## Endpoints Afetados

### Endpoints Diretos (usando `getAuthentication`):
- `/api/dashboard/system`
- `/api/dashboard/analytics`
- `/api/dashboard/engagement`

### Endpoints Proxy (usando `prepareAuthHeaders`):
- `/api/users/stats`
- `/api/aws/connection-logs/stats`

## Solução Proposta

### 1. Atualizar `auth-utils.ts` para incluir suporte a refresh token

```typescript
// Adicionar função para renovar token
export async function refreshAuthToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.accessToken;
    }
    return null;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return null;
  }
}

// Atualizar getAuthentication para tentar refresh token
export async function getAuthentication(request: NextRequest) {
  // ... código existente ...
  
  // Se nenhum token válido foi encontrado, tentar refresh token
  const refreshToken = request.cookies.get('refresh_token')?.value;
  if (refreshToken && refreshToken !== 'null') {
    console.log('🔄 Tentando renovar token com refresh token...');
    const newToken = await refreshAuthToken(refreshToken);
    if (newToken) {
      const jwtSession = await validateJWTToken(newToken);
      if (jwtSession) {
        console.log('✅ Token renovado com sucesso');
        return jwtSession;
      }
    }
  }
  
  return null;
}
```

### 2. Adicionar middleware de autenticação consistente

Criar um middleware que adicione automaticamente os headers de autenticação:

```typescript
// src/middleware/auth-middleware.ts
export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { 
          status: 401,
          headers: getCorsHeaders(request.headers.get('origin'))
        }
      );
    }
    
    // Adicionar sessão ao request para uso posterior
    (request as any).session = session;
    
    return handler(request);
  };
}
```

### 3. Atualizar endpoints para usar o middleware

```typescript
// Exemplo para /api/dashboard/system/route.ts
export const GET = withAuth(async (request: NextRequest) => {
  const session = (request as any).session;
  
  // Verificar permissões
  if (!hasRequiredRole(session.user.role, ['SYSTEM_ADMIN'])) {
    return NextResponse.json(
      { success: false, message: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  // ... resto do código ...
});
```

### 4. Garantir que o frontend envie o token corretamente

No frontend, garantir que todas as requisições incluam o token:

```typescript
// utils/api-client.ts
export async function apiRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token') || getCookie('auth_token');
  
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };
  
  if (token && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Importante para enviar cookies
  });
  
  // Se receber 401, tentar renovar token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token') || getCookie('refresh_token');
    if (refreshToken) {
      const newToken = await refreshAuthToken(refreshToken);
      if (newToken) {
        localStorage.setItem('auth_token', newToken);
        // Tentar novamente com novo token
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers, credentials: 'include' });
      }
    }
  }
  
  return response;
}
```

### 5. Adicionar interceptor para axios (se usado)

```typescript
// config/axios-config.ts
import axios from 'axios';

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || getCookie('auth_token');
    if (token && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para refresh token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token') || getCookie('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken } = response.data;
          
          localStorage.setItem('auth_token', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return axios(originalRequest);
        } catch (refreshError) {
          // Redirecionar para login
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);
```

## Implementação Imediata

Para resolver os erros 401 imediatamente, vamos:

1. Atualizar os endpoints diretos para incluir melhor tratamento de autenticação
2. Garantir que o CORS está configurado corretamente
3. Adicionar logs detalhados para debug
4. Implementar fallback para dados quando a autenticação falhar (temporariamente)

## Próximos Passos

1. Implementar as correções nos arquivos mencionados
2. Testar cada endpoint individualmente
3. Verificar se o frontend está enviando os tokens corretamente
4. Adicionar testes automatizados para autenticação