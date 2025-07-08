# Solução para Erro 504 - Gateway Timeout

## Problema Identificado

O erro 504 (Gateway Timeout) estava ocorrendo na página de certificados devido a:

1. **Ausência de timeout configurável** nas requisições fetch
2. **Falta de retry automático** para requisições que falhavam
3. **Tratamento inadequado** de erros de timeout
4. **Mensagens de erro pouco informativas** para o usuário

## Solução Implementada

### 1. Melhorias no `apiService.ts`

#### Configurações de Timeout e Retry
```typescript
const API_CONFIG = {
  DEFAULT_TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504], // Códigos que devem ser retentados
};
```

#### Função `fetchWithTimeout`
- Implementa timeout configurável usando `AbortController`
- Mensagens de erro mais específicas para timeouts
- Limpeza automática de timers

#### Função `fetchWithRetry`
- Sistema de retry automático com backoff exponencial
- Retry apenas para códigos de status apropriados (5xx, 408, 429)
- Logging detalhado de tentativas
- Diferentes estratégias para diferentes tipos de erro

#### Melhor Tratamento de Erros
- Mensagens específicas para erro 504: "Servidor demorou muito para responder"
- Tratamento diferenciado para erros 5xx
- Função `getErrorMessage` com mensagens amigáveis

### 2. Componentes de UI Melhorados

#### `ApiLoadingIndicator`
```typescript
// Mostra progresso de retry em tempo real
<ApiLoadingIndicator showDetails={true} />
```

#### `ErrorToast`
- Análise inteligente do tipo de erro
- Sugestões de ação específicas para cada tipo
- Botão de retry integrado
- Design responsivo com cores temáticas

### 3. Melhorias na Página de Certificados

```typescript
// Tratamento específico por tipo de erro
if (error.message.includes('Timeout') || error.message.includes('504')) {
  showError("O servidor está demorando para responder. Tente novamente em alguns momentos.");
} else if (error.message.includes('Servidor demorou muito')) {
  showError("Servidor demorou muito para responder. Tente novamente.");
}
```

## Benefícios da Solução

### Para o Usuário
- **Mensagens mais claras**: Explicações específicas sobre o que está acontecendo
- **Feedback visual**: Indicador de progresso durante retries
- **Ação sugerida**: Botões de retry e sugestões de próximos passos
- **Experiência melhorada**: Menos frustração com timeouts

### Para o Sistema
- **Maior resilência**: Retry automático para falhas temporárias
- **Menos carga no servidor**: Backoff exponencial evita sobrecarga
- **Melhor observabilidade**: Logging detalhado de tentativas e falhas
- **Configurabilidade**: Timeouts e tentativas configuráveis

## Como Usar

### Para Requisições Simples
```typescript
// O sistema de retry é automático
const data = await apiGet('/certificates', params);
```

### Para Componentes com Loading
```typescript
import { useApiLoading, ApiLoadingIndicator } from '@/utils/api-loading-handler';

const MyComponent = () => {
  const { startLoading, finishLoading } = useApiLoading();
  
  return (
    <div>
      <ApiLoadingIndicator showDetails={true} />
      {/* seu conteúdo */}
    </div>
  );
};
```

### Para Tratamento de Erros
```typescript
import { useErrorToast } from '@/components/ui/error-toast';

const MyComponent = () => {
  const { showError, ErrorToasts } = useErrorToast();
  
  const handleError = (error: Error) => {
    showError(error, () => {
      // função de retry personalizada
      refetchData();
    });
  };
  
  return (
    <div>
      {ErrorToasts}
      {/* seu conteúdo */}
    </div>
  );
};
```

## Configurações Recomendadas

### Para Diferentes Tipos de Endpoint

```typescript
// Endpoints rápidos (autenticação, validação)
const quickConfig = {
  timeout: 10000,
  retries: 2,
  delay: 500
};

// Endpoints de dados (listagens, pesquisas)
const dataConfig = {
  timeout: 30000,
  retries: 3,
  delay: 1000
};

// Endpoints pesados (relatórios, uploads)
const heavyConfig = {
  timeout: 60000,
  retries: 2,
  delay: 2000
};
```

## Monitoramento

O sistema agora fornece logs detalhados:

```
🔄 [API] Tentativa 1/3 para /api/certificates
⚠️ [API] Erro 504 na tentativa 1, tentando novamente...
🔄 [API] Tentativa 2/3 para /api/certificates
✅ [API] Sucesso na tentativa 2 para /api/certificates
```

## Próximos Passos

1. **Monitorar métricas** de retry para identificar padrões
2. **Ajustar timeouts** baseado no desempenho real
3. **Implementar circuit breaker** para falhas persistentes
4. **Adicionar cache** para reduzir requisições desnecessárias

## Testes

Para testar a solução:

1. **Simular timeout**: Usar DevTools para throttling de rede
2. **Simular 504**: Interceptar requisições e retornar 504
3. **Verificar retry**: Observar logs no console
4. **Testar UX**: Verificar mensagens e indicadores visuais

A solução foi projetada para ser robusta, configurável e amigável ao usuário, resolvendo definitivamente os problemas de timeout que estavam ocorrendo na aplicação. 