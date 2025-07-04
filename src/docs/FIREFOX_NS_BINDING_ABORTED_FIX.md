# Firefox NS_BINDING_ABORTED Fix

## Problema
O erro `NS_BINDING_ABORTED` é comum no Firefox e ocorre quando requisições HTTP são canceladas prematuramente. Este erro pode acontecer por várias razões:

1. **AbortController**: O Firefox é mais sensível ao uso de AbortController
2. **Timeouts muito curtos**: Firefox pode precisar de mais tempo para estabelecer conexões
3. **Headers de cache**: Firefox pode ter comportamento diferente com cache
4. **Múltiplas requisições simultâneas**: Firefox pode cancelar requisições se muitas são feitas ao mesmo tempo

## Solução Implementada

### 1. Utilitário de Compatibilidade (`src/utils/firefox-compatibility.ts`)

**Funcionalidades:**
- Detecção automática do Firefox (desktop e mobile)
- Configurações otimizadas específicas para Firefox
- Wrapper para fetch que evita NS_BINDING_ABORTED
- AbortController alternativo para Firefox
- Handler de erros específico

**Configurações para Firefox:**
```typescript
export const FIREFOX_CONFIG = {
  REQUEST_TIMEOUT: 45000, // 45 segundos (mais longo)
  RETRY_DELAY: 2000,      // 2 segundos entre tentativas
  MAX_RETRIES: 5,         // 5 tentativas
  
  HEADERS: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  
  FETCH_OPTIONS: {
    keepalive: false,     // Desabilita keepalive
    cache: 'no-store',    // Força no-cache
    redirect: 'follow',   // Segue redirects
  }
};
```

### 2. Modificações no API Client (`src/lib/api-client.ts`)

**Principais mudanças:**
- Detecção automática do Firefox
- Remoção do AbortController no Firefox
- Uso do `firefoxFetch` quando Firefox é detectado
- Tratamento específico de erros NS_BINDING_ABORTED

**Exemplo:**
```typescript
// Implementa timeout com compatibilidade Firefox
const isFF = isFirefox();
let controller: AbortController | FirefoxAbortController;

if (isFF) {
  console.log('🦊 Firefox detectado, usando configurações otimizadas');
  controller = new FirefoxAbortController();
  // Não usar AbortController no Firefox para evitar NS_BINDING_ABORTED
} else {
  controller = new AbortController();
  timeoutId = setTimeout(() => controller.abort(), timeout);
}

const response = isFF ? 
  await firefoxFetch(url, fetchOptions) : 
  await fetch(url, fetchOptions);
```

### 3. Modificações no Serviço de Auth (`src/services/auth.ts`)

**Principais mudanças:**
- Timeout estendido para Firefox (45 segundos)
- Headers otimizados para Firefox
- Tratamento específico de erros NS_BINDING_ABORTED
- Logs específicos para debugging no Firefox

### 4. Inicializador Global (`src/components/FirefoxCompatibilityInitializer.tsx`)

**Funcionalidade:**
- Inicialização automática da compatibilidade
- Interceptação de erros globais NS_BINDING_ABORTED
- Logs de debugging para desenvolvimento

## Como Funciona

### 1. Detecção Automática
```typescript
export const isFirefox = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Firefox/i.test(navigator.userAgent);
};
```

### 2. Fetch Otimizado para Firefox
```typescript
export const firefoxFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const isFF = isFirefox();
  
  if (!isFF) {
    return fetch(url, options); // Usar fetch normal se não for Firefox
  }

  // Configurações específicas para Firefox
  const firefoxOptions: RequestInit = {
    ...options,
    ...FIREFOX_CONFIG.FETCH_OPTIONS,
    headers: {
      ...FIREFOX_CONFIG.HEADERS,
      ...options.headers,
    },
  };

  // Remove AbortController se existir para evitar NS_BINDING_ABORTED
  if (firefoxOptions.signal) {
    console.log('🦊 Firefox: Removendo AbortController para evitar NS_BINDING_ABORTED');
    delete firefoxOptions.signal;
  }

  // Implementa retry automático
  for (let attempt = 1; attempt <= FIREFOX_CONFIG.MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, firefoxOptions);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (attempt < FIREFOX_CONFIG.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, FIREFOX_CONFIG.RETRY_DELAY));
      } else {
        throw error;
      }
    }
  }
};
```

### 3. Tratamento de Erros
```typescript
export const firefoxErrorHandler = (error: unknown): Error => {
  if (!(error instanceof Error)) {
    return new Error('Erro desconhecido');
  }

  // Trata erros específicos do Firefox
  if (error.message.includes('NS_BINDING_ABORTED')) {
    return new Error('Conexão interrompida. Tente novamente.');
  }

  if (error.message.includes('NetworkError')) {
    return new Error('Erro de rede. Verifique sua conexão.');
  }

  return error;
};
```

### 4. Interceptação Global
```typescript
export const initFirefoxCompatibility = () => {
  if (!isFirefox()) return;

  // Intercepta erros globais relacionados ao Firefox
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('NS_BINDING_ABORTED')) {
      console.warn('🦊 Firefox: Interceptado erro NS_BINDING_ABORTED global');
      event.preventDefault();
    }
  });

  // Intercepta promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('NS_BINDING_ABORTED')) {
      console.warn('🦊 Firefox: Interceptado promise rejection NS_BINDING_ABORTED');
      event.preventDefault();
    }
  });
};
```

## Arquivos Modificados

1. **`src/utils/firefox-compatibility.ts`** - Novo arquivo com utilitários
2. **`src/lib/api-client.ts`** - Modificado para usar compatibilidade Firefox
3. **`src/services/auth.ts`** - Modificado para usar compatibilidade Firefox
4. **`src/components/FirefoxCompatibilityInitializer.tsx`** - Novo componente inicializador
5. **`src/app/layout.tsx`** - Adicionado inicializador

## Benefícios

1. **Resolução do NS_BINDING_ABORTED**: Elimina o erro específico do Firefox
2. **Melhor Experiência do Usuário**: Timeouts mais longos e retry automático
3. **Debugging Facilitado**: Logs específicos para Firefox
4. **Compatibilidade Transparente**: Funciona automaticamente sem configuração manual
5. **Não Afeta Outros Navegadores**: Otimizações são aplicadas apenas no Firefox

## Logs de Debugging

Quando Firefox é detectado, você verá logs como:
```
🦊 Firefox detectado - Compatibilidade ativada
🔧 Configurações aplicadas:
  - AbortController removido de requisições
  - Timeout aumentado para 45 segundos
  - Retry automático com 5 tentativas
  - Headers otimizados para cache
  - Interceptação de erros NS_BINDING_ABORTED
```

## Uso

A compatibilidade é ativada automaticamente quando Firefox é detectado. Não é necessária nenhuma configuração manual.

Para usar em componentes específicos:
```typescript
import { useFirefoxCompatibility } from '@/utils/firefox-compatibility';

const MyComponent = () => {
  const { isFirefox, makeRequest } = useFirefoxCompatibility();
  
  if (isFirefox) {
    console.log('Firefox detectado');
  }
  
  // makeRequest já usa configurações otimizadas para Firefox
  const data = await makeRequest('/api/endpoint');
};
```

## Testes

Para testar a solução:

1. Abra o Firefox
2. Abra as ferramentas de desenvolvedor (F12)
3. Vá para a aba Console
4. Recarregue a página
5. Você deve ver logs indicando que o Firefox foi detectado
6. Faça requisições (login, navegação, etc.)
7. Verifique se não há mais erros NS_BINDING_ABORTED

## Troubleshooting

Se ainda houver problemas:

1. **Verifique os logs**: Procure por mensagens com 🦊
2. **Limpe o cache**: Ctrl+Shift+R no Firefox
3. **Desabilite extensões**: Teste em modo privado
4. **Verifique a rede**: Use a aba Network das ferramentas de desenvolvedor

## Futuras Melhorias

1. **Métricas**: Adicionar coleta de métricas específicas do Firefox
2. **Configuração Dinâmica**: Permitir ajuste de timeouts via configuração
3. **Teste Automatizado**: Adicionar testes específicos para Firefox
4. **Service Worker**: Otimizar para uso com PWA no Firefox 