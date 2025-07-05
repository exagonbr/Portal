# Correção de Problemas do Service Worker

## Problema Identificado

O erro `"Falha ao carregar 'https://portal.sabercon.com.br/_next/static/css/vendors-node_modules_g.css?v=1750984371970'. Um ServiceWorker interceptou a requisição e encontrou um erro não esperado. sw-improved.js:76:9"` estava ocorrendo devido a problemas na interceptação de recursos CSS do Next.js pelo Service Worker.

## Causa Raiz

1. **Tratamento inadequado de assets do Next.js**: O Service Worker estava tratando arquivos CSS do Next.js (que têm versionamento automático) da mesma forma que outros recursos estáticos.

2. **Falta de tratamento específico para CORS**: Recursos do Next.js precisam de configurações específicas de CORS.

3. **Estratégia de cache inadequada**: A estratégia `cacheFirst` não era apropriada para assets versionados do Next.js.

4. **Tratamento de erro insuficiente**: Quando uma requisição falhava, não havia fallbacks adequados.

## Soluções Implementadas

### 1. Melhorias no Service Worker (`public/sw-improved.js`)

#### Tratamento específico para assets do Next.js:
```javascript
// Verificar se é um asset do Next.js
function isNextJSAsset(url) {
  return url.pathname.startsWith('/_next/static/') && 
         (url.pathname.endsWith('.css') || url.pathname.endsWith('.js'));
}

// Tratar assets do Next.js de forma especial
async function handleNextJSAsset(request) {
  // Sempre buscar da rede primeiro para assets versionados
  // Com fallback para cache em caso de falha
}
```

#### Melhor tratamento de erros:
- Try-catch em todos os pontos críticos
- Fallbacks específicos para diferentes tipos de recursos
- Logs detalhados para diagnóstico

#### Configurações de CORS melhoradas:
- Adição de `mode: 'cors'` em todas as requisições fetch
- Tratamento específico para recursos CSS

### 2. Ferramenta de Diagnóstico (`src/components/ServiceWorkerDebug.tsx`)

Componente React para:
- Verificar status do Service Worker em tempo real
- Limpar cache corrompido
- Recarregar assets problemáticos
- Diagnosticar URLs com falha

### 3. Script de Limpeza (`public/clear-sw-cache.js`)

Script standalone para:
- Limpar todos os caches do Service Worker
- Desregistrar Service Workers problemáticos
- Recarregar assets específicos

### 4. Página de Debug (`src/app/debug-sw/page.tsx`)

Interface web para acessar as ferramentas de diagnóstico em `/debug-sw`.

## Como Usar as Soluções

### Para Usuários Finais:

1. **Acesse a página de debug**: `https://portal.sabercon.com.br/debug-sw`
2. **Clique em "Verificar Status"** para ver o estado atual
3. **Se houver problemas**:
   - Clique em "Limpar Cache"
   - Depois em "Recarregar Assets"
   - Por fim, "Recarregar Página"

### Para Desenvolvedores:

1. **Via Console do Navegador**:
```javascript
// Carregar script de limpeza
const script = document.createElement('script');
script.src = '/clear-sw-cache.js';
document.head.appendChild(script);

// Após carregar, usar as funções
clearServiceWorkerCache();
reloadProblematicAssets();
diagnoseSWProblems();
```

2. **Via DevTools**:
- Abrir DevTools → Application → Service Workers
- Clicar em "Unregister" para desregistrar
- Ir para Storage → Clear Storage → Clear site data

## Prevenção de Problemas Futuros

### 1. Monitoramento
- Implementar logs de erro do Service Worker
- Alertas para falhas de carregamento de CSS

### 2. Testes
- Testar Service Worker em diferentes navegadores
- Verificar carregamento de assets em diferentes condições de rede

### 3. Configuração do Next.js
O `next.config.js` foi otimizado com:
- Headers específicos para assets CSS
- Configurações de cache apropriadas
- CORS configurado corretamente

## Arquivos Modificados

1. `public/sw-improved.js` - Service Worker melhorado
2. `src/components/ServiceWorkerDebug.tsx` - Componente de diagnóstico
3. `public/clear-sw-cache.js` - Script de limpeza
4. `src/app/debug-sw/page.tsx` - Página de debug
5. `docs/SERVICE_WORKER_FIX.md` - Esta documentação

## Comandos de Emergência

Se o problema persistir, use estes comandos no console:

```javascript
// Limpar tudo e recarregar
(async () => {
  const caches = await window.caches.keys();
  await Promise.all(caches.map(c => window.caches.delete(c)));
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(r => r.unregister()));
  window.location.reload();
})();
```

## Suporte

Para problemas persistentes:
1. Acesse `/debug-sw` e capture os logs
2. Verifique o console do navegador para erros específicos
3. Teste em modo incógnito para verificar se é problema de cache 