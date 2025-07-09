# Refatoração do Service Worker

## Visão Geral

O Service Worker foi completamente refatorado para oferecer uma experiência mais robusta e compatível com diferentes user agents, incluindo dispositivos móveis e navegadores desktop. As principais melhorias incluem:

1. **Detecção de User Agent**: Tratamento específico para diferentes navegadores e dispositivos
2. **Estratégias de Cache Adaptativas**: Diferentes estratégias para mobile e desktop
3. **Tratamento de Erros Robusto**: Prevenção de falhas com respostas parciais e tipos de conteúdo problemáticos
4. **Suporte Offline Aprimorado**: Página offline dedicada e sincronização em segundo plano
5. **Gerenciamento de Ciclo de Vida**: Atualizações automáticas e limpeza de caches antigos
6. **Ferramentas de Diagnóstico**: Interface de administração para debug e manutenção

## Arquivos Principais

### 1. Service Worker (`worker.js`)

O arquivo principal do Service Worker com todas as estratégias de cache e tratamento de rotas.

### 2. Componente de Registro (`src/components/ServiceWorkerRegistration.tsx`)

Componente React para registrar o Service Worker com detecção de compatibilidade e gerenciamento do ciclo de vida.

### 3. Utilitários do Service Worker (`public/sw-utils.js`)

Funções auxiliares para gerenciar o Service Worker, incluindo limpeza de cache e verificação de status.

### 4. Página Offline (`public/offline.html`)

Página exibida quando o usuário está sem conexão, com funcionalidade para tentar reconectar.

### 5. Interface de Administração (`src/app/debug-sw/page.tsx`)

Painel de controle para administradores gerenciarem e diagnosticarem o Service Worker.

## Melhorias Técnicas

### Detecção de User Agent

```javascript
function getUserAgentInfo() {
  const userAgent = self.navigator?.userAgent || '';
  
  return {
    isMobile: /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent),
    isSafari: /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(userAgent),
    isOldBrowser: /MSIE|Trident|Edge\/1[0-5]/i.test(userAgent)
  };
}
```

### Validação de Respostas Cacheáveis

```javascript
function isCacheableResponse(response) {
  // Não cachear respostas parciais (206), redirecionamentos (3xx), ou erros (4xx, 5xx)
  if (!response || response.status === 206 || response.status >= 300) {
    return false;
  }
  
  // Não cachear se contém headers de range
  if (response.headers.get('content-range')) {
    return false;
  }
  
  // Não cachear se é uma resposta de streaming
  if (response.headers.get('content-type')?.includes('text/event-stream')) {
    return false;
  }
  
  return true;
}
```

### Estratégias Adaptativas

```javascript
// Para dispositivos móveis com conexões potencialmente instáveis, usar StaleWhileRevalidate
if (uaInfo.isMobile) {
  return new StaleWhileRevalidate({
    cacheName: 'api-responses-mobile',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 5 * 60, // 5 minutos
      }),
      new SafeCachePlugin(),
    ],
  }).handle({ request, url });
}
```

### Background Sync para Operações Offline

```javascript
// Background Sync para operações offline (POST/PUT/DELETE)
const bgSyncPlugin = new BackgroundSyncPlugin('offline-operations', {
  maxRetentionTime: 24 * 60, // Reter por 24 horas (em minutos)
});

// Registrar rota para operações que modificam dados
registerRoute(
  ({ url, request }) => 
    (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') && 
    url.pathname.startsWith('/api/'),
  new NetworkFirst({
    plugins: [bgSyncPlugin],
  })
);
```

## Compatibilidade

O Service Worker refatorado é compatível com:

| Plataforma | Navegadores Suportados |
|------------|------------------------|
| Desktop    | Chrome 40+, Firefox 44+, Edge 17+, Safari 11.1+, Opera 27+ |
| Android    | Chrome, Firefox, Samsung Internet, Opera |
| iOS        | Safari 11.3+, Chrome para iOS* |

\* *Com limitações devido às restrições da WebKit no iOS*

## Recursos Offline

Os seguintes recursos estão disponíveis offline:

1. **Página Inicial**: Versão básica da página inicial
2. **Dados em Cache**: Conteúdo visualizado anteriormente
3. **Imagens**: Imagens visualizadas anteriormente
4. **Página Offline**: Indicador de status offline com opção de reconexão
5. **Operações Pendentes**: Sincronização em segundo plano quando a conexão for restaurada

## Gerenciamento de Atualizações

O Service Worker implementa um sistema de atualização que:

1. Verifica atualizações a cada 6 horas
2. Notifica o usuário quando uma nova versão está disponível
3. Permite atualização manual através da página de debug
4. Limpa caches antigos automaticamente

## Diagnóstico e Solução de Problemas

### Interface de Administração

A interface em `/debug-sw` permite:

- Verificar o status do Service Worker
- Listar todos os caches
- Limpar caches
- Desregistrar o Service Worker
- Forçar atualizações

### Comandos de Emergência

Para problemas graves, os seguintes comandos podem ser executados no console:

```javascript
// Limpar todos os caches
await window.swUtils.clearServiceWorkerCache();

// Desregistrar todos os Service Workers
await window.swUtils.unregisterServiceWorkers();

// Verificar status
await window.swUtils.checkServiceWorkerStatus();

// Forçar atualização
await window.swUtils.updateServiceWorker();
```

## Considerações de Segurança

1. **HTTPS Obrigatório**: O Service Worker só funciona em contextos seguros (HTTPS)
2. **Escopo Limitado**: O Service Worker está limitado ao escopo raiz (`/`)
3. **Validação de Origem**: Apenas recursos da mesma origem ou com CORS apropriado são cacheados
4. **Limpeza de Dados Sensíveis**: Dados de API com autenticação têm tempo de expiração curto

## Monitoramento e Métricas

Para monitoramento em produção, o Service Worker envia eventos para análise:

1. **Instalação/Ativação**: Rastreamento de novas instalações e atualizações
2. **Falhas de Cache**: Erros ao tentar cachear recursos
3. **Uso Offline**: Métricas de uso offline
4. **Performance**: Tempos de resposta com e sem cache

## Próximos Passos

1. **Notificações Push**: Implementar suporte a notificações push
2. **Sincronização Periódica**: Adicionar sincronização periódica em segundo plano
3. **Precache Seletivo**: Melhorar a estratégia de pré-cache baseada no comportamento do usuário
4. **Métricas Avançadas**: Implementar telemetria mais detalhada 