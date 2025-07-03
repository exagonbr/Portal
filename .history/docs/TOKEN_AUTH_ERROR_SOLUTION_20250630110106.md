# Solução para Erro de Token de Autenticação

## Problema Identificado
```
Error: Token de autenticação inválido! "Token inválido ou expirado"
src/services/systemAdminService.ts (552:13) @ getUsersByRole
```

## Diagnóstico

O erro está ocorrendo na função `getUsersByRole()` do `systemAdminService.ts` quando tenta fazer uma requisição para o endpoint `/users/stats`. O problema pode ter várias causas:

### Possíveis Causas

1. **Token Expirado**: O token JWT pode ter expirado
2. **Token Inválido**: O token pode estar corrompido ou em formato incorreto
3. **Token Ausente**: Nenhum token encontrado no storage
4. **Problema de Sincronização**: Token não sincronizado entre frontend e backend
5. **Configuração do Backend**: Middleware de validação rejeitando tokens válidos

## Ferramentas de Diagnóstico Implementadas

### 1. Script de Debug
```typescript
// Execute no console do navegador
debugTokenIssue()
```

### 2. Página de Debug
Acesse: `/debug-auth-token`

### 3. Logs Melhorados
- ApiClient agora fornece diagnóstico detalhado em erros 401
- SystemAdminService fornece informações específicas sobre problemas de token

## Soluções por Cenário

### Cenário 1: Token Ausente
**Sintoma**: "Nenhum token encontrado"
**Solução**:
```typescript
// 1. Fazer login novamente
window.location.href = '/login';

// 2. Ou limpar storage e recarregar
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

### Cenário 2: Token Expirado
**Sintoma**: "Token expirado" ou "exp" menor que timestamp atual
**Solução**:
```typescript
// Auto-refresh já implementado, mas pode forçar manualmente:
import { autoRefreshToken } from '@/utils/token-refresh';
await autoRefreshToken();
```

### Cenário 3: Token Inválido/Corrompido
**Sintoma**: "Token inválido" ou erro de parsing JWT
**Solução**:
```typescript
// Limpar tokens e fazer login novamente
import { clearAllTokens } from '@/utils/token-validator';
clearAllTokens();
window.location.href = '/login';
```

### Cenário 4: Problema de Backend
**Sintoma**: Token válido localmente mas rejeitado pelo backend (401)
**Solução**:
1. Verificar logs do backend
2. Verificar configuração do JWT_SECRET
3. Verificar middleware `validateTokenUltraSimple`

## Implementações de Correção

### 1. Melhor Tratamento de Erro no SystemAdminService
```typescript
// Diagnóstico detalhado quando há erro de token
if (errorMessage.includes('Token inválido') || errorMessage.includes('Token expirado')) {
  console.error('🔍 [SYSTEM-ADMIN-SERVICE] Diagnóstico do token:', {
    currentToken: !!currentToken,
    tokenLength: currentToken ? currentToken.length : 0,
    authStatus: authStatus
  });
  throw new Error(`Erro de autenticação: ${errorMessage}. Verifique se você está logado corretamente.`);
}
```

### 2. Diagnóstico Aprimorado no ApiClient
```typescript
// Logs detalhados em erros 401
console.log('🔍 [API-CLIENT] Diagnóstico de erro 401:', {
  hasToken,
  tokenLength: currentToken ? currentToken.length : 0,
  errorMessage: error.message,
  errorDetails: error.details?.message
});

// Análise do JWT
if (isJWT) {
  const payload = JSON.parse(atob(parts[1]));
  const now = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp && payload.exp < now;
  // ... logs detalhados
}
```

### 3. Auto-Refresh Melhorado
O sistema já tem auto-refresh implementado que:
- Detecta tokens próximos do vencimento
- Tenta refresh automático antes de expirar
- Fallback para relogin se o refresh falhar

## Como Usar as Ferramentas de Debug

### 1. Console do Navegador
```javascript
// Executar diagnóstico completo
debugTokenIssue()

// Verificar token atual
getCurrentToken()

// Verificar status de autenticação
isAuthenticated()

// Limpar todos os tokens
clearAllTokens()
```

### 2. Página de Debug
1. Acesse `/debug-auth-token`
2. Veja informações do token atual
3. Execute diagnóstico completo
4. Analise resultados e interpretação

### 3. Logs do Console
- Procure por logs com prefixos:
  - `[API-CLIENT]`
  - `[SYSTEM-ADMIN-SERVICE]`
  - `[TOKEN-VALIDATOR]`
  - `[TOKEN-REFRESH]`

## Prevenção

### 1. Monitoramento de Expiração
```typescript
// Configurar refresh automático
import { setupAutoRefreshInterval } from '@/utils/token-refresh';
setupAutoRefreshInterval(30); // Verificar a cada 30 minutos
```

### 2. Tratamento de Erros Robusto
```typescript
// Usar withAutoRefresh para operações críticas
import { withAutoRefresh } from '@/utils/token-refresh';

const result = await withAutoRefresh(async () => {
  return await apiClient.get('/users/stats');
});
```

### 3. Fallback Gracioso
O sistema já implementa fallback com dados simulados quando há problemas de autenticação, evitando quebra completa da aplicação.

## Próximos Passos

1. **Acesse `/debug-auth-token`** para diagnosticar o problema atual
2. **Execute o diagnóstico completo** para identificar a causa raiz
3. **Aplique a solução apropriada** baseada no resultado
4. **Configure monitoramento** para prevenir problemas futuros

## Contato para Suporte

Se o problema persistir após seguir estas soluções:
1. Capture os logs completos do diagnóstico
2. Documente os passos reproduzidos
3. Inclua informações do ambiente (browser, versão, etc.) 