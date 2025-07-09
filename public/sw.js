// Portal Sabercon Service Worker
// Versão compatível com Next.js 15 com versionamento dinâmico

// Versão dinâmica baseada no build (injetada durante o build)
const CACHE_VERSION = self.__CACHE_VERSION__ || 'dev-' + Date.now();
const CACHE_NAME = `portal-sabercon-runtime-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `portal-sabercon-static-${CACHE_VERSION}`;

console.log(`🚀 Service Worker iniciado - Versão: ${CACHE_VERSION}`);

// Assets para cache estático
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Lista de URLs para ignorar no cache
const IGNORE_URLS = [
  '/_next/webpack-hmr',
  '/__nextjs_original-stack-frame',
  '/_next/static/chunks/main-app.js',
  '/_next/static/chunks/app-pages-internals.js',
  '/_next/static/chunks/app/admin/institutions/page.js',
  '/_next/static/chunks/app/admin/layout.js',
  '/_next/static/chunks/app/template.js',
  '/_next/static/chunks/app/layout.js',
  '/_next/static/chunks/app/loading.js',
  '/_next/static/chunks/_app-pages-browser_node_modules_framer-motion_dist_es_index_mjs.js',
  '/_next/static/css/app/layout.css'
];

// Função para limpar caches antigos
async function deleteOldCaches() {
  const cacheWhitelist = [CACHE_NAME, STATIC_CACHE_NAME];
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames
    .filter(cacheName => !cacheWhitelist.includes(cacheName))
    .map(cacheName => {
      console.log('Service Worker: Deletando cache antigo', cacheName);
      return caches.delete(cacheName);
    });
  return Promise.all(deletePromises);
}

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(async (cache) => {
        console.log('Service Worker: Caching static assets');
        // Tentar fazer cache de cada asset individualmente
        const cachePromises = STATIC_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response.ok) {
              await cache.put(url, response);
              console.log(`✅ Cached: ${url}`);
            } else {
              console.warn(`⚠️ Failed to cache ${url}: ${response.status}`);
            }
          } catch (error) {
            console.warn(`⚠️ Failed to fetch ${url}:`, error);
          }
        });
        
        await Promise.all(cachePromises);
        console.log('Service Worker: Installation complete');
      })
      .catch((error) => {
        console.error('Service Worker: Installation error:', error);
      })
  );
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    deleteOldCaches()
      .then(() => {
        console.log('Service Worker: Old caches deleted');
        return self.clients.claim();
      })
  );
});

// Escutar mensagens do cliente
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEAR_CACHE':
      event.waitUntil(
        deleteOldCaches()
          .then(() => caches.delete(CACHE_NAME))
          .then(() => caches.delete(STATIC_CACHE_NAME))
          .then(() => {
            if (event.ports && event.ports[0]) {
              event.ports[0].postMessage({ success: true });
            }
          })
          .catch((error) => {
            if (event.ports && event.ports[0]) {
              event.ports[0].postMessage({ success: false, error: error.message });
            }
          })
      );
      break;
    case 'GET_VERSION':
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ version: CACHE_VERSION });
      }
      break;
  }
});

// Função para verificar se uma resposta é cacheable
function isCacheableResponse(response) {
  if (!response || response.status !== 200 || response.type === 'error') {
    return false;
  }
  // Não cachear respostas opacas (CORS)
  if (response.type === 'opaque') {
    return false;
  }
  return true;
}

// Função para verificar se é um erro de chunk
function isChunkError(error) {
  return error && (
    error.message.includes('Loading chunk') ||
    error.message.includes('ChunkLoadError') ||
    error.message.includes('originalFactory')
  );
}

// Função para verificar se uma URL deve ser ignorada
function shouldIgnoreUrl(url) {
  return IGNORE_URLS.some(ignorePattern => url.includes(ignorePattern));
}

// Função para retry de requisições
async function fetchWithRetry(request, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(request.clone(), {
        cache: 'no-cache',
        credentials: 'same-origin'
      });
      if (response.ok) return response;
      
      // Se não for ok e for a última tentativa, retornar a resposta de erro
      if (i === retries - 1) return response;
      
      // Aguardar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições de extensões e não-http
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorar requisições problemáticas
  if (shouldIgnoreUrl(url.pathname)) {
    // Passar diretamente para a rede sem interceptação
    return;
  }

  // Estratégia para API: Sempre buscar da rede
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Estratégia para documentos de navegação: Network First com fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithCacheFallback(request));
    return;
  }

  // Estratégia para assets do Next.js: Network First sem cache para evitar problemas
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Estratégia para assets estáticos: Cache First com revalidação
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(cacheFirstWithRevalidation(request));
    return;
  }

  // Estratégia padrão: Network First
  event.respondWith(networkFirstWithCacheFallback(request));
});

// --- ESTRATÉGIAS DE CACHE ---

// Network First com fallback para cache
async function networkFirstWithCacheFallback(request) {
  try {
    const networkResponse = await fetchWithRetry(request, 2);
    
    // Se a resposta for boa, cachear
    if (isCacheableResponse(networkResponse)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network request failed, trying cache', request.url);
    
    // Tentar buscar do cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Serving from cache', request.url);
      return cachedResponse;
    }
    
    // Se não houver cache, passar para a rede diretamente
    return fetch(request);
  }
}

// Network First (sem cache)
async function networkFirstStrategy(request) {
  try {
    return await fetch(request, {
      cache: 'no-cache',
      credentials: 'same-origin'
    });
  } catch (error) {
    console.log('Service Worker: Network request failed, bypassing SW', request.url);
    // Retornar um erro que não será interceptado pelo SW
    throw error;
  }
}

// Cache First com revalidação em background
async function cacheFirstWithRevalidation(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Buscar da rede em background para atualizar o cache
  const fetchPromise = fetch(request, {
    cache: 'no-cache',
    credentials: 'same-origin'
  }).then((networkResponse) => {
    if (isCacheableResponse(networkResponse)) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.log('Service Worker: Background fetch failed', request.url);
    return null;
  });

  // Retornar do cache imediatamente se disponível
  if (cachedResponse) {
    console.log('Service Worker: Serving from cache', request.url);
    return cachedResponse;
  }

  // Se não houver cache, aguardar a rede
  try {
    const networkResponse = await fetchPromise;
    return networkResponse || fetch(request);
  } catch (error) {
    // Falha na rede, tentar requisição direta
    return fetch(request);
  }
}
