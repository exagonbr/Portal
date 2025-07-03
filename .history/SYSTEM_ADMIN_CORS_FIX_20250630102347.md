# Correção de CORS no SystemAdminService

## Problema Identificado

O erro "CORS MISSING ALLOW ORIGIN" estava ocorrendo em todas as requisições do arquivo `src/services/systemAdminService.ts` que faziam chamadas fetch diretas, impedindo que as requisições fossem processadas corretamente devido à política de CORS (Cross-Origin Resource Sharing).

## Análise da Causa

1. **Falta de headers CORS**: As requisições fetch diretas não incluíam os headers necessários para CORS
2. **Configuração inadequada de fetch**: As chamadas não especificavam `mode: 'cors'` e `credentials: 'include'`
3. **Headers de autenticação não padronizados**: Token de autenticação não estava sendo incluído consistentemente
4. **Ausência de configuração centralizada**: Cada chamada fetch precisava ser configurada individualmente

## Soluções Implementadas

### 1. Import da Configuração de CORS

```typescript
import { CORS_HEADERS } from '@/config/cors';
```

Importação dos headers CORS já configurados no projeto para reutilização.

### 2. Função Utilitária `fetchWithCors`

```typescript
private async fetchWithCors(url: string, options: RequestInit = {}): Promise<Response> {
  // Preparar headers com CORS
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...CORS_HEADERS,
    ...(options.headers as Record<string, string> || {})
  };

  // Obter token de autenticação se disponível
  const token = getCurrentToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`🌐 [SYSTEM-ADMIN] Fazendo requisição com CORS para: ${url}`);
  
  return fetch(url, {
    ...options,
    headers,
    mode: 'cors',
    credentials: 'include'
  });
}
```

**Características da função:**
- Inclui automaticamente headers CORS
- Adiciona token de autenticação quando disponível
- Configura `mode: 'cors'` e `credentials: 'include'`
- Logging para debug
- Tipagem TypeScript adequada

### 3. Atualização da Função `fetchWithTimeout`

```typescript
private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await this.fetchWithCors(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}
```

Agora usa `fetchWithCors` internamente, garantindo CORS em todas as requisições com timeout.

### 4. Atualização de Chamadas Fetch Diretas

**Antes:**
```typescript
const localResponse = await fetch('/api/dashboard/metrics/realtime');
```

**Depois:**
```typescript
const localResponse = await this.fetchWithCors('/api/dashboard/metrics/realtime', {
  method: 'GET'
});
```

### 5. Headers CORS Incluídos

Os seguintes headers são automaticamente incluídos em todas as requisições:

```typescript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, ...',
  'Access-Control-Allow-Credentials': 'false',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': '...',
  'Allow': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD'
}
```

## Melhorias Implementadas

### 1. **Configuração Centralizada**
- Uma única função `fetchWithCors` para todas as requisições
- Reutilização da configuração CORS do projeto
- Consistência em todas as chamadas

### 2. **Autenticação Automática**
- Token incluído automaticamente quando disponível
- Sincronização com o sistema de autenticação existente

### 3. **Logging Melhorado**
- Logs específicos para requisições CORS
- Facilita debug de problemas de conectividade

### 4. **Compatibilidade Mantida**
- Todas as funções existentes continuam funcionando
- Apenas mudanças internas na implementação

### 5. **Tipagem TypeScript**
- Headers tipados corretamente
- Evita erros de compilação

## Arquivo de Teste

Foi criado o arquivo `src/scripts/test-system-admin-cors.ts` para testar a configuração de CORS:

```typescript
// Para executar no console do browser:
testSystemAdminCors()    // Testa todas as funções do SystemAdminService
testManualFetchCors()    // Testa uma requisição fetch manual
```

## Funções Afetadas

Todas as funções que fazem requisições HTTP foram atualizadas para usar CORS:

1. **`fetchWithTimeout`** - Função base para requisições com timeout
2. **`fetchWithRetry`** - Função para requisições com retry (usa fetchWithTimeout)
3. **`getRealTimeMetrics`** - Requisição para métricas em tempo real
4. **Todas as funções que usam `apiClient`** - Indiretamente beneficiadas

## Benefícios

### 1. **Resolução de Erros CORS**
- Elimina erros "CORS policy: No 'Access-Control-Allow-Origin' header"
- Permite requisições cross-origin

### 2. **Melhor Compatibilidade**
- Funciona em diferentes browsers
- Suporte adequado para credenciais

### 3. **Manutenibilidade**
- Código centralizado e reutilizável
- Fácil manutenção e atualização

### 4. **Debug Facilitado**
- Logs específicos para CORS
- Identificação rápida de problemas

## Como Testar

1. **Teste Automático:**
   ```javascript
   // No console do browser
   testSystemAdminCors()
   ```

2. **Teste Manual:**
   ```javascript
   // No console do browser
   testManualFetchCors()
   ```

3. **Verificação Visual:**
   - Abra as ferramentas de desenvolvedor (F12)
   - Vá para a aba Network
   - Execute funções do SystemAdminService
   - Verifique se as requisições incluem headers CORS
   - Confirme ausência de erros CORS no console

## Arquivos Modificados

- `src/services/systemAdminService.ts` - Implementação principal das correções CORS
- `src/scripts/test-system-admin-cors.ts` - Script de teste CORS (novo arquivo)
- `SYSTEM_ADMIN_CORS_FIX.md` - Este documento de documentação (novo arquivo)

## Configuração CORS Utilizada

A configuração CORS é importada de `src/config/cors.ts` e inclui:

- **Origin:** `*` (permite todas as origens)
- **Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
- **Headers:** Content-Type, Authorization, e outros necessários
- **Credentials:** Configurado adequadamente para cada ambiente
- **Max-Age:** 24 horas para cache de preflight

Esta implementação garante que todas as requisições do SystemAdminService agora funcionem corretamente com CORS, eliminando os erros "CORS MISSING ALLOW ORIGIN" e melhorando a compatibilidade cross-origin. 