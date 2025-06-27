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
  
  try {
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
    
    // Para arquivos CSS do Next.js com parâmetros de versão, usar estratégia especial
    if (isNextJSAsset(url)) {
      event.respondWith(handleNextJSAsset(request));
      return;
    }
    
    event.respondWith(
      handleRequest(request).catch((error) => {
        console.warn('⚠️ Service Worker: Erro ao processar requisição:', request.url, error);
        
        // Fallback: tentar fetch direto sem cache
        return fetch(request, { 
          cache: 'no-cache',
          mode: 'cors'
        }).catch((fetchError) => {
          console.error('⚠️ Service Worker: Fetch direto também falhou:', request.url, fetchError);
          
          // Se tudo falhar, retornar resposta de erro apropriada
          if (request.destination === 'style' || request.url.includes('.css')) {
            return new Response('/* CSS loading failed */', {
              status: 200,
              headers: { 'Content-Type': 'text/css' }
            });
          }
          
          return new Response('Network error', {
            status: 408,
            statusText: 'Request Timeout'
          });
        });
      })
    );
  } catch (error) {
    console.error('⚠️ Service Worker: Erro crítico no fetch listener:', error);
    // Não interceptar se houver erro crítico
    return;
  }
});

// Verificar se é um asset do Next.js
function isNextJSAsset(url) {
  return url.pathname.startsWith('/_next/static/') && 
         (url.pathname.endsWith('.css') || url.pathname.endsWith('.js'));
}

// Tratar assets do Next.js de forma especial
async function handleNextJSAsset(request) {
  try {
    // Para assets do Next.js, sempre tentar buscar da rede primeiro
    // pois eles têm versionamento próprio
    const networkResponse = await fetch(request, {
      cache: 'no-cache',
      mode: 'cors'
    });
    
    if (networkResponse.ok) {
      // Cachear apenas se a resposta for bem-sucedida
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn('⚠️ Falha ao cachear asset do Next.js:', cacheError);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('⚠️ Falha ao buscar asset do Next.js:', request.url, error);
    
    // Tentar buscar do cache como fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('✅ Usando versão cacheada do asset Next.js:', request.url);
      return cachedResponse;
    }
    
    // Se não há cache, retornar erro apropriado
    if (request.url.includes('.css')) {
      return new Response('/* CSS loading failed from service worker */', {
        status: 200,
        headers: { 'Content-Type': 'text/css' }
      });
    }
    
    throw error;
  }
}

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
    console.warn('⚠️ Service Worker: Erro na estratégia de cache:', request.url, error);
    
    // Fallback para fetch direto
    return fetch(request, { 
      cache: 'no-cache',
      mode: 'cors'
    });
  }
}

// Verificar se é um recurso estático
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) && 
         !url.pathname.startsWith('/_next/static/'); // Next.js assets são tratados separadamente
}

// Verificar se é uma requisição de API
function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Estratégia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request, {
      mode: 'cors'
    });
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('⚠️ Cache First falhou:', request.url, error);
    throw error;
  }
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request, {
      mode: 'cors'
    });
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('⚠️ Network falhou, tentando cache:', request.url, error);
    
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
  
  const fetchPromise = fetch(request, {
    mode: 'cors'
  }).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.warn('⚠️ Revalidação falhou:', request.url, error);
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