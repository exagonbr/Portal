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

// Interceptar TODAS as requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Headers agressivos de no-cache
  const noCacheHeaders = new Headers({
    'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'X-Accel-Expires': '0',
    'Clear-Site-Data': '"cache"'
  });

  // Adicionar timestamp para forçar bypass de cache
  const urlWithTimestamp = new URL(request.url);
  urlWithTimestamp.searchParams.set('_t', Date.now().toString());

  // SEMPRE buscar da rede, NUNCA do cache
  event.respondWith(
    fetch(urlWithTimestamp.toString(), {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        ...Object.fromEntries(noCacheHeaders.entries())
      },
      body: request.body,
      // Corrigir o modo para evitar erro com 'navigate' no service worker
      mode: request.mode === 'navigate' ? 'cors' : request.mode,
      credentials: request.credentials,
      cache: 'no-store',
      redirect: 'follow',
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
      integrity: request.integrity,
      keepalive: request.keepalive,
      signal: request.signal
    }).then(response => {
      // Clonar resposta para modificar headers
      const modifiedHeaders = new Headers(response.headers);
      
      // Forçar headers de no-cache na resposta
      modifiedHeaders.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate, private');
      modifiedHeaders.set('Pragma', 'no-cache');
      modifiedHeaders.set('Expires', '0');
      modifiedHeaders.set('X-Content-Type-Options', 'nosniff');
      modifiedHeaders.set('X-Frame-Options', 'DENY');
      modifiedHeaders.set('X-XSS-Protection', '1; mode=block');
      
      // Retornar resposta modificada
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: modifiedHeaders
      });
    }).catch(error => {
      console.error('Service Worker: Erro na requisição:', error);
      
      // Resposta de erro sem cache
      return new Response(
        JSON.stringify({ 
          error: 'Network error', 
          message: error.message,
          timestamp: Date.now()
        }), 
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'X-Error': 'true'
          }
        }
      );
    })
  );
});

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
