// Portal Sabercon Service Worker
// Versão compatível com Next.js 15 com versionamento dinâmico

// Versão dinâmica baseada no build (injetada durante o build)
const CACHE_VERSION = self.__CACHE_VERSION__ || 'dev-' + Date.now();
const CACHE_NAME = `portal-sabercon-runtime-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `portal-sabercon-static-${CACHE_VERSION}`;

console.log(`🚀 Service Worker iniciado - Versão: ${CACHE_VERSION}`);

// Assets para cache estático
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.log('Service Worker: Failed to cache static assets', error);
      })
  );
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Deleta todos os caches que não são os atuais
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Escutar mensagens do cliente
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    // Outros cases podem ser adicionados aqui
  }
});

// Função para verificar se uma resposta é cacheable
function isCacheableResponse(response) {
  if (!response || !response.ok || response.status === 206 || response.type === 'opaque' || response.type === 'error') {
    return false;
  }
  return true;
}

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições de extensões e não-http
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Estratégia para API: Sempre buscar da rede
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkOnlyStrategy(request));
    return;
  }

  // Estratégia para documentos de navegação: Sempre buscar da rede para garantir conteúdo fresco
  if (request.mode === 'navigate') {
    event.respondWith(networkOnlyStrategy(request));
    return;
  }

  // Estratégia para assets estáticos: Cache, depois rede (Stale-While-Revalidate)
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image') {
    event.respondWith(staleWhileRevalidateStrategy(request, STATIC_CACHE_NAME));
    return;
  }

  // Estratégia padrão para outros recursos: Stale-While-Revalidate
  event.respondWith(staleWhileRevalidateStrategy(request, CACHE_NAME));
});


// --- ESTRATÉGIAS DE CACHE ---

// Estratégia Network Only (para APIs e navegação)
async function networkOnlyStrategy(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Service Worker: Network request failed', { url: request.url, error });
    // Retornar uma resposta de erro genérica
    return new Response(
      JSON.stringify({ success: false, message: 'Falha na conexão de rede.' }), 
      { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Estratégia Stale While Revalidate (para assets)
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (isCacheableResponse(networkResponse)) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.error('Service Worker: Background fetch failed', { url: request.url, error });
  });

  // Retorna do cache se disponível, senão aguarda a rede
  return cachedResponse || fetchPromise;
}
