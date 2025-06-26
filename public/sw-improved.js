// Service Worker melhorado com tratamento de CORS e erros

const CACHE_NAME = 'portal-sabercon-v1';
const STATIC_CACHE = 'static-assets-v1';
const API_CACHE = 'api-cache-v1';

// URLs que devem ser ignoradas pelo service worker
const IGNORE_URLS = [
  'https://plugin.handtalk.me/',
  'https://www.google-analytics.com/',
  'https://fonts.googleapis.com/',
  'chrome-extension://',
  'moz-extension://'
];

// Verificar se uma URL deve ser ignorada
function shouldIgnoreUrl(url) {
  return IGNORE_URLS.some(ignoreUrl => url.startsWith(ignoreUrl));
}

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Service Worker: Cache estático criado');
      // Não pre-cachear recursos para evitar problemas
      return Promise.resolve();
    })
  );
  
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar URLs específicas
  if (shouldIgnoreUrl(request.url)) {
    return;
  }
  
  // Ignorar requisições não-GET para evitar problemas
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requisições para o próprio service worker
  if (url.pathname.endsWith('sw.js') || url.pathname.endsWith('sw-improved.js')) {
    return;
  }
  
  event.respondWith(
    handleRequest(request).catch((error) => {
      console.warn('⚠️ Service Worker: Erro ao processar requisição:', error);
      
      // Fallback: tentar fetch direto
      return fetch(request).catch(() => {
        // Se tudo falhar, retornar resposta de erro
        return new Response('Network error', {
          status: 408,
          statusText: 'Request Timeout'
        });
      });
    })
  );
});

// Lidar com requisições
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Para recursos estáticos, usar cache first
    if (isStaticAsset(url)) {
      return await cacheFirst(request);
    }
    
    // Para APIs, usar network first
    if (isApiRequest(url)) {
      return await networkFirst(request);
    }
    
    // Para páginas, usar stale while revalidate
    return await staleWhileRevalidate(request);
    
  } catch (error) {
    console.warn('⚠️ Service Worker: Erro na estratégia de cache:', error);
    
    // Fallback para fetch direto
    return fetch(request);
  }
}

// Verificar se é um recurso estático
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Verificar se é uma requisição de API
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/');
}

// Estratégia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('⚠️ Cache First falhou:', error);
    throw error;
  }
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('⚠️ Network falhou, tentando cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.warn('⚠️ Revalidação falhou:', error);
    return null;
  });
  
  // Retornar cache imediatamente se disponível, senão aguardar network
  return cachedResponse || fetchPromise;
}

// Lidar com mensagens
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Lidar com push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push notification recebida');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nova notificação',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Portal Sabercon', options)
    );
  }
});

// Lidar com cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Clique em notificação');
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

console.log('🚀 Service Worker melhorado carregado'); 