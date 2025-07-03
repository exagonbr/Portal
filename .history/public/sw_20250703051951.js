// sw.js - Service Worker principal para controle de cache
const CACHE_VERSION = 'v1-no-cache';
const NO_CACHE_URLS = [
  '/',
  '/dashboard',
  '/api/',
  '/_next/',
  '.html',
  '.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  // Forçar ativação imediata
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    // Limpar todos os caches existentes
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Service Worker: Removendo cache antigo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Tomar controle de todas as páginas imediatamente
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Verificar se a URL deve ser sem cache
  const shouldNoCache = NO_CACHE_URLS.some(pattern => {
    if (pattern.startsWith('.')) {
      return url.pathname.endsWith(pattern);
    }
    return url.pathname.includes(pattern);
  });

  if (shouldNoCache) {
    // Para URLs que não devem ter cache, sempre buscar da rede
    event.respondWith(
      fetch(request, {
        cache: 'no-store',
        headers: {
          ...request.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }).then(response => {
        // Clonar a resposta
        const responseToCache = response.clone();
        
        // Adicionar headers de no-cache na resposta
        const headers = new Headers(responseToCache.headers);
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');
        
        return new Response(responseToCache.body, {
          status: responseToCache.status,
          statusText: responseToCache.statusText,
          headers: headers
        });
      }).catch(error => {
        console.error('Service Worker: Erro ao buscar:', error);
        // Em caso de erro, tentar retornar uma resposta offline
        return new Response('Erro de conexão', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          })
        });
      })
    );
  } else {
    // Para outros recursos (imagens, fontes, etc), permitir cache com versionamento
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          // Verificar se o cache está expirado (1 hora)
          const cachedDate = new Date(cachedResponse.headers.get('date'));
          const now = new Date();
          const hourInMs = 60 * 60 * 1000;
          
          if (now - cachedDate > hourInMs) {
            // Cache expirado, buscar nova versão
            return fetchAndCache(request);
          }
          
          return cachedResponse;
        }
        
        return fetchAndCache(request);
      })
    );
  }
});

// Função auxiliar para buscar e cachear
function fetchAndCache(request) {
  return fetch(request).then(response => {
    // Não cachear respostas com erro
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }
    
    // Clonar a resposta
    const responseToCache = response.clone();
    
    // Abrir cache e armazenar
    caches.open(CACHE_VERSION).then(cache => {
      cache.put(request, responseToCache);
    });
    
    return response;
  });
}

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        // Notificar o cliente que o cache foi limpo
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      })
    );
  }
});

// Sincronização em background para limpar cache periodicamente
self.addEventListener('sync', (event) => {
  if (event.tag === 'clear-cache') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});
