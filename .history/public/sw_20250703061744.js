// sw.js - Service Worker com Cache Seletivo
const CACHE_VERSION = `selective-cache-v1-${Date.now()}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const MENU_CACHE = `menus-${CACHE_VERSION}`;

// Itens que PODEM ser cacheados (básicos, imagens e menus)
const CACHEABLE_PATTERNS = [
  // Imagens
  /\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)$/i,
  // Recursos básicos estáticos
  /\.(woff|woff2|ttf|eot)$/i, // Fontes
  // APIs de menu e navegação
  /\/api\/menu/,
  /\/api\/navigation/,
  /\/api\/sidebar/,
  /\/api\/permissions\/menu/,
  // Manifests e configurações básicas
  /manifest\.json$/,
  /favicon\.ico$/
];

// Sempre buscar da rede (dados dinâmicos)
const ALWAYS_NETWORK = [
  /\/api\/(?!menu|navigation|sidebar|permissions\/menu)/,
  /\.(html|js|css|tsx|ts)$/,
  /\/_next\//,
  /\/dashboard/,
  /\/portal/,
  /\/admin/,
  /\/student/,
  /\/teacher/,
  /\/coordinator/,
  /\/guardian/
];

// Função para verificar se deve cachear
function shouldCache(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  
  // Verificar se é um padrão cacheável
  return CACHEABLE_PATTERNS.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(pathname) || pattern.test(url);
    }
    return pathname.includes(pattern);
  });
}

// Função para verificar se deve sempre buscar da rede
function shouldAlwaysNetwork(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  
  return ALWAYS_NETWORK.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(pathname) || pattern.test(url);
    }
    return pathname.includes(pattern);
  });
}

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando com cache seletivo...');
  self.skipWaiting();
  
  // Limpar caches antigos na instalação
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes('selective-cache-v1')) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando com cache seletivo...');
  
  event.waitUntil(
    Promise.all([
      // Limpar apenas caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes('selective-cache-v1')) {
              console.log('Deletando cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle imediato de todas as páginas
      self.clients.claim()
    ])
  );
});

// Interceptar requisições com cache seletivo
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Determinar estratégia de cache
  const isImage = /\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)$/i.test(url);
  const isMenu = /\/api\/(menu|navigation|sidebar|permissions\/menu)/.test(url);
  const isBasicResource = /\.(woff|woff2|ttf|eot|manifest\.json|favicon\.ico)$/i.test(url);
  
  const shouldCacheThis = shouldCache(url);
  const shouldNetworkFirst = shouldAlwaysNetwork(url);

  if (shouldNetworkFirst) {
    // Sempre buscar da rede para dados dinâmicos
    event.respondWith(handleNetworkFirst(request));
  } else if (shouldCacheThis) {
    if (isImage) {
      // Cache first para imagens
      event.respondWith(handleCacheFirst(request, IMAGE_CACHE));
    } else if (isMenu) {
      // Stale while revalidate para menus (cache com revalidação)
      event.respondWith(handleStaleWhileRevalidate(request, MENU_CACHE));
    } else if (isBasicResource) {
      // Cache first para recursos básicos
      event.respondWith(handleCacheFirst(request, STATIC_CACHE));
    } else {
      // Network first como fallback
      event.respondWith(handleNetworkFirst(request));
    }
  } else {
    // Network first para tudo que não deve ser cacheado
    event.respondWith(handleNetworkFirst(request));
  }
});

// Estratégia Network First (sempre rede primeiro)
async function handleNetworkFirst(request) {
  try {
    const response = await fetch(request, {
      cache: 'no-store',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
    // Adicionar headers de no-cache
    const modifiedHeaders = new Headers(response.headers);
    modifiedHeaders.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    modifiedHeaders.set('Pragma', 'no-cache');
    modifiedHeaders.set('Expires', '0');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: modifiedHeaders
    });
  } catch (error) {
    console.error('Network error:', error);
    return new Response(
      JSON.stringify({ error: 'Network error', message: error.message }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
}

// Estratégia Cache First (cache primeiro)
async function handleCacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log(`Cache hit: ${request.url}`);
      return cachedResponse;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      console.log(`Cached: ${request.url}`);
    }
    
    return response;
  } catch (error) {
    console.error('Cache first error:', error);
    return handleNetworkFirst(request);
  }
}

// Estratégia Stale While Revalidate (cache com revalidação em background)
async function handleStaleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Buscar da rede em background
    const networkPromise = fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
        console.log(`Revalidated: ${request.url}`);
      }
      return response;
    }).catch(error => {
      console.warn('Revalidation failed:', error);
      return null;
    });
    
    // Retornar cache se disponível, senão aguardar rede
    if (cachedResponse) {
      console.log(`Stale cache hit: ${request.url}`);
      return cachedResponse;
    }
    
    return await networkPromise || handleNetworkFirst(request);
  } catch (error) {
    console.error('Stale while revalidate error:', error);
    return handleNetworkFirst(request);
  }
}

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('Service Worker: Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_ALL_CACHE') {
    event.waitUntil(
      Promise.all([
        // Limpar cache do Service Worker
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              console.log('Limpando cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
        }),
        // Limpar cache do navegador se possível
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ 
              type: 'CLEAR_BROWSER_CACHE',
              timestamp: Date.now()
            });
          });
        })
      ]).then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ 
            type: 'ALL_CACHE_CLEARED',
            timestamp: Date.now()
          });
        }
      })
    );
  }
  
  // Forçar reload de todas as páginas
  if (event.data && event.data.type === 'FORCE_RELOAD_ALL') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'RELOAD_PAGE' });
      });
    });
  }
});

// Sincronização em background - limpar cache a cada minuto
self.addEventListener('sync', (event) => {
  if (event.tag === 'periodic-cache-clear') {
    console.log('Service Worker: Limpeza periódica de cache');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

// Periodic Background Sync (se disponível)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'clear-cache-periodic') {
    console.log('Service Worker: Sync periódico - limpando cache');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

// Push event para limpar cache
self.addEventListener('push', (event) => {
  if (event.data && event.data.text() === 'clear-cache') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('Service Worker: Script carregado com NO-CACHE ABSOLUTO');
