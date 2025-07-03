# Guia de Resolução: Erro 401 de Autenticação

## 🔍 Problema Identificado

O erro `❌ [API-CLIENT] Erro 401 - Detalhes de autenticação: {}` indica que há um problema com a validação do token de autenticação. O fato dos detalhes estarem vazios (`{}`) sugere que o erro está ocorrendo antes mesmo da validação completa do token.

## 🛠️ Ferramentas de Diagnóstico

### 1. Script de Debug Manual
Execute no console do navegador:
```javascript
// Cole este código no console do navegador
debugAuthState();
```

### 2. Utilitário AuthDebugHelper
```typescript
import { AuthDebugHelper } from '@/utils/auth-debug-helper';

// Diagnóstico completo
await AuthDebugHelper.runFullDiagnostic();

// Verificar estado atual
const info = AuthDebugHelper.getAuthDebugInfo();
console.log(info);

// Testar requisição autenticada
const result = await AuthDebugHelper.testAuthenticatedRequest();
console.log(result);
```

### 3. Componente de Debug Visual
```tsx
import { useAuthDebug } from '@/components/debug/AuthDebugPanel';

function MyComponent() {
  const { openDebug, DebugPanel } = useAuthDebug();
  
  return (
    <>
      <button onClick={openDebug}>🔍 Debug Auth</button>
      <DebugPanel />
    </>
  );
}
```

## 🔧 Possíveis Causas e Soluções

### 1. Token Não Encontrado
**Sintomas:**
- `hasToken: false` no log
- Mensagem: "Token de autenticação não encontrado"

**Soluções:**
```typescript
// Verificar se o usuário está logado
const token = localStorage.getItem('auth_token');
if (!token) {
  // Redirecionar para login
  window.location.href = '/login';
}
```

### 2. Token Expirado
**Sintomas:**
- Token presente mas requisições falhando
- JWT payload mostra `exp` no passado

**Soluções:**
```typescript
// Verificar expiração do token
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp && payload.exp < Math.floor(Date.now() / 1000);
    }
  } catch (e) {
    return true;
  }
  return false;
}

// Limpar token expirado
if (isTokenExpired(token)) {
  AuthDebugHelper.clearAllAuthData();
  window.location.href = '/login';
}
```

### 3. Token Malformado
**Sintomas:**
- Token presente mas com formato inválido
- Erro ao decodificar JWT

**Soluções:**
```typescript
// Validar formato do token
function validateTokenFormat(token: string): boolean {
  // Verificar se é JWT válido
  if (token.includes('.') && token.split('.').length === 3) {
    try {
      const parts = token.split('.');
      JSON.parse(atob(parts[1])); // Testar decode do payload
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Verificar se é base64 válido (fallback tokens)
  try {
    const decoded = atob(token);
    JSON.parse(decoded);
    return true;
  } catch (e) {
    return false;
  }
}

// Limpar token inválido
if (!validateTokenFormat(token)) {
  AuthDebugHelper.clearAllAuthData();
  window.location.href = '/login';
}
```

### 4. Problema no Middleware do Backend
**Sintomas:**
- Token válido no frontend mas 401 no backend
- Logs do backend mostram erro de validação

**Verificações:**
1. Verificar se o `JWT_SECRET` está configurado no backend
2. Verificar se o middleware está sendo usado corretamente
3. Verificar se o header `Authorization` está sendo enviado

**Backend - Verificar Middleware:**
```typescript
// backend/src/middleware/auth.middleware.ts
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Log para debug
    console.log('🔍 Auth Header:', req.headers.authorization);
    
    let token = req.header('Authorization')?.replace('Bearer ', '') || '';
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    
    // Continuar validação...
  } catch (error) {
    console.log('❌ Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};
```

### 5. Problema de CORS
**Sintomas:**
- Requisições bloqueadas pelo navegador
- Headers não chegando ao backend

**Soluções:**
```typescript
// backend - Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://portal.sabercon.com.br',
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Auth-Token']
}));
```

## 🚀 Procedimento de Diagnóstico

### Passo 1: Verificar Estado Atual
```typescript
// No console do navegador
const info = AuthDebugHelper.getAuthDebugInfo();
console.log('Estado da autenticação:', info);
```

### Passo 2: Testar Requisição
```typescript
// Testar se o token funciona
const result = await AuthDebugHelper.testAuthenticatedRequest();
console.log('Resultado do teste:', result);
```

### Passo 3: Verificar Backend
```bash
# Verificar logs do backend
# Procurar por erros de autenticação
grep -r "401\|unauthorized\|invalid token" backend/logs/
```

### Passo 4: Limpar e Reautenticar
```typescript
// Se necessário, limpar tudo e fazer login novamente
AuthDebugHelper.clearAllAuthData();
window.location.href = '/login';
```

## 🔄 Fluxo de Recuperação Automática

### Implementar Auto-Recovery
```typescript
// src/lib/auth-recovery.ts
export class AuthRecovery {
  static async handleAuthError(error: any): Promise<boolean> {
    console.log('🔄 Tentando recuperar autenticação...');
    
    // 1. Verificar se é erro 401
    if (error.status !== 401) {
      return false;
    }
    
    // 2. Tentar refresh token
    try {
      const refreshed = await this.attemptTokenRefresh();
      if (refreshed) {
        console.log('✅ Token renovado com sucesso');
        return true;
      }
    } catch (refreshError) {
      console.log('❌ Falha no refresh token:', refreshError);
    }
    
    // 3. Limpar dados e redirecionar
    console.log('🧹 Limpando dados e redirecionando...');
    AuthDebugHelper.clearAllAuthData();
    
    // Evitar loop infinito
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login?error=session_expired';
    }
    
    return false;
  }
  
  private static async attemptTokenRefresh(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          return true;
        }
      }
    } catch (error) {
      console.log('Erro no refresh:', error);
    }
    
    return false;
  }
}
```

### Integrar no API Client
```typescript
// src/lib/api-client.ts - no método processError
if (error.status === 401) {
  // Tentar recuperação automática
  const recovered = await AuthRecovery.handleAuthError(error);
  if (recovered) {
    // Repetir a requisição original
    return this.makeRequest(originalEndpoint, originalOptions);
  }
  
  // Se não conseguiu recuperar, continuar com erro normal
  // ... resto do código de tratamento de erro 401
}
```

## 📊 Monitoramento

### Adicionar Métricas
```typescript
// src/utils/auth-metrics.ts
export class AuthMetrics {
  static track401Error(details: any) {
    console.log('📊 AUTH_401_ERROR', {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      hasToken: details.hasToken,
      tokenSource: details.tokenSource,
      userAgent: navigator.userAgent
    });
    
    // Enviar para serviço de monitoramento se configurado
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('auth_error_401', details);
    }
  }
}
```

## 🎯 Prevenção

### 1. Validação Proativa
```typescript
// Verificar token antes de fazer requisições críticas
export async function ensureValidAuth(): Promise<boolean> {
  const info = AuthDebugHelper.getAuthDebugInfo();
  
  if (!info.hasToken) {
    console.log('❌ Token não encontrado');
    return false;
  }
  
  if (info.isExpired) {
    console.log('⏰ Token expirado');
    return false;
  }
  
  // Testar com requisição rápida
  try {
    const result = await AuthDebugHelper.testAuthenticatedRequest('/api/auth/ping');
    return result.success;
  } catch (error) {
    console.log('❌ Teste de autenticação falhou:', error);
    return false;
  }
}
```

### 2. Interceptadores de Requisição
```typescript
// Interceptar todas as requisições para verificar auth
fetch = ((originalFetch) => {
  return async (...args) => {
    // Verificar auth antes de requisições autenticadas
    const [url, options] = args;
    if (options?.headers?.['Authorization']) {
      const isValid = await ensureValidAuth();
      if (!isValid) {
        throw new Error('Token inválido - redirecionando para login');
      }
    }
    
    return originalFetch(...args);
  };
})(fetch);
```

## 📋 Checklist de Resolução

- [ ] Executar diagnóstico completo
- [ ] Verificar se token existe
- [ ] Verificar se token não expirou
- [ ] Verificar formato do token
- [ ] Testar requisição autenticada
- [ ] Verificar logs do backend
- [ ] Verificar configuração CORS
- [ ] Limpar dados se necessário
- [ ] Fazer login novamente
- [ ] Implementar recuperação automática
- [ ] Adicionar monitoramento

## 🆘 Suporte

Se o problema persistir após seguir este guia:

1. Execute o diagnóstico completo e salve o resultado
2. Verifique os logs do backend
3. Documente os passos reproduzir o erro
4. Entre em contato com a equipe de desenvolvimento

---

**Última atualização:** $(date)
**Versão:** 1.0 