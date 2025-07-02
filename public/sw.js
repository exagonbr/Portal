// Portal Sabercon Service Worker
// Versão compatível com Next.js 15 com versionamento dinâmico

// Versão dinâmica baseada no build (injetada durante o build)
const CACHE_VERSION = self.__CACHE_VERSION__ || 'dev-' + Date.now();
const CACHE_NAME = `portal-sabercon-${CACHE_VERSION}`;
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
  
  // Força a ativação imediata
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Assume controle de todas as páginas
  self.clients.claim();
});

// Escutar mensagens do cliente
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('🔄 Forçando ativação do novo Service Worker');
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      handleClearCache(event, payload);
      break;
      
    case 'GET_CACHE_INFO':
      handleGetCacheInfo(event);
      break;
      
    default:
      console.log('📨 Mensagem recebida:', event.data);
  }
});

// Função para verificar se uma resposta é cacheable
function isCacheableResponse(response) {
  // Não cachear respostas parciais (206), redirecionamentos (3xx), ou erros (4xx, 5xx)
  if (response.status === 206 || response.status >= 300) {
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

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições de extensões do Chrome
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Ignorar requisições não HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Estratégia para diferentes tipos de recursos
  if (request.destination === 'document') {
    // Páginas HTML - Network First
    event.respondWith(networkFirstStrategy(request));
  } else if (request.url.includes('/_next/static/')) {
    // Assets estáticos do Next.js - Stale While Revalidate para atualizações rápidas
    event.respondWith(staleWhileRevalidateStrategy(request, STATIC_CACHE_NAME));
  } else if (request.url.includes('/api/')) {
    // APIs - Network Only (sem cache para dados dinâmicos)
    event.respondWith(networkOnlyStrategy(request));
  } else {
    // Outros recursos - Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request, CACHE_NAME));
  }
});

// Estratégia Network First
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Verifica se o método é cacheable (GET, HEAD) antes de armazenar
      if (request.method === 'GET' || request.method === 'HEAD') {
        // Verifica se a resposta é cacheable
        if (isCacheableResponse(networkResponse)) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone()).catch((error) => {
            console.log(`❌ Erro ao cachear ${request.url}:`, error);
          });
        }
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para página offline se houver
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

// Estratégia Cache First
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Verifica se o método é cacheable (GET, HEAD) antes de armazenar
      if (request.method === 'GET' || request.method === 'HEAD') {
        // Verifica se a resposta é cacheable
        if (isCacheableResponse(networkResponse)) {
          const cache = await caches.open(STATIC_CACHE_NAME);
          cache.put(request, networkResponse.clone()).catch((error) => {
            console.log(`❌ Erro ao cachear ${request.url}:`, error);
          });
        }
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch and cache', error);
    throw error;
  }
}

// Estratégia Network Only (para APIs)
async function networkOnlyStrategy(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('Service Worker: API request failed', error);
    // Retornar uma Response válida em caso de erro
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Network error', 
        error: error.message 
      }), 
      { 
        status: 503, 
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estratégia Stale While Revalidate melhorada
async function staleWhileRevalidateStrategy(request, cacheName = CACHE_NAME) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Busca em background (não bloqueia retorno do cache)
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.ok) {
      // Verifica se o método é cacheable (GET, HEAD) antes de armazenar
      if (request.method === 'GET' || request.method === 'HEAD') {
        // Verifica se a resposta é cacheable (não é partial content ou range request)
        if (isCacheableResponse(networkResponse)) {
          // Clona antes de armazenar para evitar problemas de stream
          cache.put(request, networkResponse.clone()).catch((error) => {
            console.log(`❌ Erro ao cachear ${request.url}:`, error);
          });
          console.log(`🔄 Cache atualizado: ${request.url}`);
        } else {
          console.log(`⚠️ Resposta não cacheable (status ${networkResponse.status}): ${request.url}`);
        }
      } else {
        console.log(`⚠️ Método ${request.method} não cacheable: ${request.url}`);
      }
    }
    return networkResponse;
  }).catch((error) => {
    console.log('Service Worker: Background fetch failed', error);
    return null;
  });
  
  // Se tem cache, retorna imediatamente e atualiza em background
  if (cachedResponse) {
    console.log(`📦 Servindo do cache: ${request.url}`);
    // Não aguarda o fetchPromise - atualização em background
    fetchPromise.catch(() => {}); // Evita unhandled promise rejection
    return cachedResponse;
  }
  
  // Se não tem cache, aguarda a rede
  console.log(`🌐 Buscando da rede: ${request.url}`);
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  // Fallback final
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: 'Resource unavailable', 
      cached: false,
      timestamp: new Date().toISOString()
    }), 
    { 
      status: 503, 
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Handler para limpeza de cache
async function handleClearCache(event, payload) {
  try {
    const cacheNames = await caches.keys();
    const deletedCaches = [];
    
    for (const cacheName of cacheNames) {
      if (cacheName.startsWith('portal-sabercon-')) {
        await caches.delete(cacheName);
        deletedCaches.push(cacheName);
      }
    }
    
    const response = {
      success: true,
      message: 'Cache limpo com sucesso',
      deletedCaches,
      reason: payload?.reason || 'manual'
    };
    
    // Responder via MessageChannel se disponível
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(response);
    }
    
    console.log('✅ Cache limpo:', response);
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.message
    };
    
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(errorResponse);
    }
    
    console.log('❌ Erro ao limpar cache:', error);
  }
}

// Handler para informações do cache
async function handleGetCacheInfo(event) {
  try {
    const cacheNames = await caches.keys();
    const portalCaches = cacheNames.filter(name => name.startsWith('portal-sabercon-'));
    
    const cacheInfo = {
      success: true,
      currentVersion: CACHE_VERSION,
      activeCaches: portalCaches,
      totalCaches: cacheNames.length
    };
    
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(cacheInfo);
    }
    
    console.log('📊 Informações do cache:', cacheInfo);
  } catch (error) {
    const errorResponse = {
      success: false,
      error: error.message
    };
    
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(errorResponse);
    }
    
    console.log('❌ Erro ao obter informações do cache:', error);
  }
}

// Gerenciar notificações push (se necessário)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver no Portal',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Portal Sabercon', options)
  );
});

// Gerenciar cliques em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});
