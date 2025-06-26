# Correção do Erro ChunkLoadError

## Problema Identificado
```
ChunkLoadError: Loading chunk _app-pages-browser_src_lib_api-client_ts failed.
(error: https://portal.sabercon.com.br/_next/static/chunks/_app-pages-browser_src_lib_api-client_ts.js)
```

O erro ocorria durante o logout quando o sistema tentava importar dinamicamente o `api-client.ts` para limpar a autenticação.

## Soluções Implementadas

### 1. Melhorias no Serviço de Autenticação (`src/services/auth.ts`)

**Antes:**
```typescript
// Importação dinâmica simples que falhava
const { apiClient } = await import('../lib/api-client');
```

**Depois:**
```typescript
// Importação com retry robusto
const { importApiClient } = await import('../utils/chunk-retry');
const apiClientModule = await importApiClient();
```

### 2. Utilitário de Retry para Chunks (`src/utils/chunk-retry.ts`)

Criado um sistema completo de retry para importações dinâmicas:

- **Detecção de ChunkLoadError**: Identifica diferentes tipos de erros de chunk
- **Retry Automático**: Até 3 tentativas com delay progressivo
- **Fallback Robusto**: Limpeza manual de cookies se o apiClient não carregar
- **Handler Global**: Listener para recarregar página em caso de erro crítico

### 3. Configuração do Webpack (`next.config.js`)

Adicionadas configurações específicas para otimizar chunks:

```javascript
// Criar chunks específicos para api-client e auth
splitChunks: {
  cacheGroups: {
    apiClient: {
      test: /[\\/]src[\\/]lib[\\/]api-client/,
      name: 'api-client',
      chunks: 'all',
      priority: 20,
      enforce: true,
    },
    authServices: {
      test: /[\\/]src[\\/]services[\\/]auth/,
      name: 'auth-services',
      chunks: 'all',
      priority: 15,
      enforce: true,
    },
  },
},
```

### 4. Handler Global de Erros (`src/components/ChunkErrorHandler.tsx`)

Componente que configura listeners globais:
- Detecta ChunkLoadError em toda a aplicação
- Recarrega página automaticamente como último recurso
- Previne loops de erro

### 5. Sistema de Fallback Múltiplo

O logout agora tem várias camadas de proteção:

1. **Primeira tentativa**: Importação com retry do api-client
2. **Fallback**: Limpeza manual de cookies e localStorage
3. **Garantia**: Sessão sempre é limpa, mesmo com erros

## Benefícios das Correções

### ✅ Robustez
- O logout nunca falha completamente
- Múltiplas estratégias de limpeza

### ✅ User Experience
- Usuário não vê erros críticos
- Logout sempre funciona

### ✅ Debugging
- Logs detalhados para monitoramento
- Identificação clara de problemas

### ✅ Performance
- Chunks otimizados
- Carregamento mais eficiente

## Arquivos Modificados

1. `src/services/auth.ts` - Lógica de logout melhorada
2. `src/utils/chunk-retry.ts` - Novo utilitário de retry
3. `src/components/ChunkErrorHandler.tsx` - Handler global
4. `src/app/layout.tsx` - Integração do handler
5. `next.config.js` - Configuração de webpack
6. `src/utils/test-chunk-loading.ts` - Testes para validação

## Como Testar

1. **Em desenvolvimento**: Os testes executam automaticamente
2. **Logout**: Testar o logout em diferentes cenários
3. **Console**: Verificar logs de sucesso/erro
4. **Network**: Simular falhas de rede

## Monitoramento

Os logs no console mostram:
- `✅ Auth limpo do apiClient` - Sucesso normal
- `⚠️ Erro ao limpar auth do apiClient` - Usando fallback
- `✅ Cookies limpos manualmente como fallback` - Fallback funcionando
- `🔄 ChunkLoadError detectado` - Handler global ativo

## Próximos Passos

Se o problema persistir, considerar:
1. Análise de CDN/cache
2. Configurações de servidor
3. Otimizações adicionais de webpack
4. Preload de chunks críticos 