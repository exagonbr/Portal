
try {
  // Verificar se todas as dependências estão disponíveis
  const workboxAvailable = 'workbox' in self || importScripts('/workbox-v6.5.4/workbox-sw.js');

  // Importar módulos do Workbox
  importScripts(
    '/workbox-v6.5.4/workbox-core.js',
    '/workbox-v6.5.4/workbox-precaching.js',
    '/workbox-v6.5.4/workbox-routing.js',
    '/workbox-v6.5.4/workbox-strategies.js',
    '/workbox-v6.5.4/workbox-expiration.js',
    '/workbox-v6.5.4/workbox-cacheable-response.js',
    '/workbox-v6.5.4/workbox-background-sync.js'
  );

  const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching;
  const { registerRoute, NavigationRoute, setDefaultHandler } = workbox.routing;
  const { NetworkFirst, CacheFirst, StaleWhileRevalidate } = workbox.strategies;
  const { ExpirationPlugin } = workbox.expiration;
  const { CacheableResponsePlugin } = workbox.cacheable_response;
  const { BackgroundSyncPlugin } = workbox.backgroundSync;
  const { clientsClaim } = workbox.core;

  // Habilitar clientsClaim para tomar controle imediatamente
  self.skipWaiting();
  clientsClaim();

  // Configuração do manifesto de pré-cache
  const PRECACHE_MANIFEST = self.__WB_MANIFEST || [];
  precacheAndRoute(PRECACHE_MANIFEST);
  cleanupOutdatedCaches();

  // Função para verificar se uma resposta pode ser cacheada
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

  // Detecção de navegador/dispositivo para tratamento específico
  function getUserAgentInfo() {
    const userAgent = self.navigator?.userAgent || '';
    
    return {
      isMobile: /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent),
      isSafari: /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent),
      isIOS: /iPhone|iPad|iPod/i.test(userAgent),
      isOldBrowser: /MSIE|Trident|Edge\/1[0-5]/i.test(userAgent)
    };
  }

  // Plugin personalizado para verificar se a resposta pode ser cacheada
  class SafeCachePlugin {
    async cacheWillUpdate({ response }) {
      return isCacheableResponse(response) ? response : null;
    }
  }

  // Estratégia para assets do Next.js
  const nextJsAssetsStrategy = new StaleWhileRevalidate({
    cacheName: 'next-js-assets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
      }),
      new SafeCachePlugin(),
    ],
  });

  // Verificar se é um asset do Next.js
  function isNextJSAsset(url) {
    return url.pathname.includes('/_next/static/') && 
           (url.pathname.endsWith('.css') || url.pathname.endsWith('.js'));
  }

  // Cache para imagens com tratamento específico para dispositivos móveis
  registerRoute(
    ({ request, url }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'images',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: getUserAgentInfo().isMobile ? 30 : 60, // Menos entradas para mobile
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
        }),
        new SafeCachePlugin(),
      ],
    })
  );

  // Cache para fontes
  registerRoute(
    ({ request }) => request.destination === 'font',
    new CacheFirst({
      cacheName: 'fonts',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 dias
        }),
        new SafeCachePlugin(),
      ],
    })
  );

  // Cache para scripts e estilos (não Next.js)
  registerRoute(
    ({ request, url }) => 
      (request.destination === 'script' || request.destination === 'style') && 
      !isNextJSAsset(url),
    new StaleWhileRevalidate({
      cacheName: 'static-resources',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
        }),
        new SafeCachePlugin(),
      ],
    })
  );

  // Tratamento específico para assets do Next.js
  registerRoute(
    ({ url }) => isNextJSAsset(url),
    nextJsAssetsStrategy
  );

  // Cache para API com diferentes estratégias baseadas no dispositivo
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    ({ url, request }) => {
      const uaInfo = getUserAgentInfo();
      
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
      
      // Para desktop, usar NetworkFirst
      return new NetworkFirst({
        cacheName: 'api-responses',
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 10 * 60, // 10 minutos
          }),
          new SafeCachePlugin(),
        ],
        networkTimeoutSeconds: 3, // Timeout para fallback para cache
      }).handle({ request, url });
    }
  );

  // Estratégia para navegação
  const navigationStrategy = new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: getUserAgentInfo().isMobile ? 10 * 60 : 5 * 60, // Mais tempo para mobile
      }),
      new SafeCachePlugin(),
    ],
    networkTimeoutSeconds: 3, // Timeout para fallback para cache
  });

  // Registrar rota para navegação
  const navigationRoute = new NavigationRoute(navigationStrategy, {
    // Excluir rotas de debug e admin
    denylist: [
      new RegExp('/debug-sw'),
      new RegExp('/admin'),
    ],
  });
  registerRoute(navigationRoute);

  // Background Sync para operações offline (POST/PUT/DELETE)
  try {
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
  } catch (error) {
    console.error('Background Sync não suportado:', error);
    
    // Fallback para navegadores que não suportam Background Sync
    registerRoute(
      ({ url, request }) => 
        (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') && 
        url.pathname.startsWith('/api/'),
      new NetworkFirst()
    );
  }

  // Handler padrão para outras requisições
  setDefaultHandler(
    new NetworkFirst({
      cacheName: 'default-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 dia
        }),
        new SafeCachePlugin(),
      ],
    })
  );

  // Evento de instalação
  self.addEventListener('install', (event) => {
    self.skipWaiting();
    
    // Pré-cachear recursos críticos
    const preCacheUrls = [
      '/',
      '/offline.html',
      '/sw-utils.js',
      '/images/offline.svg',
    ];
    
    event.waitUntil(
      caches.open('critical-assets').then((cache) => {
        return cache.addAll(preCacheUrls).catch(error => {
          console.error('Erro ao pré-cachear recursos:', error);
          // Continuar mesmo se falhar para não bloquear a instalação
          return Promise.resolve();
        });
      })
    );
  });

  // Evento de ativação - limpar caches antigos
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Remover caches antigos que não estão na lista atual
              return cacheName.startsWith('workbox-') && 
                    !cacheName.includes('workbox-precache') && 
                    !cacheName.includes('images') && 
                    !cacheName.includes('fonts') && 
                    !cacheName.includes('static-resources') && 
                    !cacheName.includes('api-responses') && 
                    !cacheName.includes('pages') &&
                    !cacheName.includes('next-js-assets') &&
                    !cacheName.includes('critical-assets') &&
                    !cacheName.includes('default-cache') &&
                    !cacheName.includes('api-responses-mobile');
            })
            .map((cacheName) => {
              return caches.delete(cacheName);
            })
        );
      })
    );
    
    // Reivindicar o controle de todos os clientes
    self.clients.claim();
  });

  // Evento de fetch para tratamento de erros
  self.addEventListener('fetch', (event) => {
    // Não interceptar requisições para o próprio service worker ou para debug
    if (event.request.url.includes('worker.js') || 
        event.request.url.includes('debug-sw')) {
      return;
    }
    
    // Apenas para requisições que não são tratadas por rotas registradas
    if (!event.respondWith) {
      event.respondWith(
        fetch(event.request)
          .catch((error) => {
            console.error('Fetch error:', error);
            
            // Se for uma página HTML, redirecionar para página offline
            if (event.request.destination === 'document') {
              return caches.match('/offline.html').then(response => {
                return response || fetch('/offline.html');
              }).catch(() => {
                // Se não conseguir buscar a página offline, retornar uma resposta básica
                return new Response('Você está offline. Por favor, verifique sua conexão.', {
                  headers: { 'Content-Type': 'text/html' }
                });
              });
            }
            
            // Para outros recursos, tentar buscar do cache
            return caches.match(event.request);
          })
      );
    }
  });

  // Evento de mensagem para comunicação com a página
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              return caches.delete(cacheName);
            })
          );
        })
      );
    }
  });

  console.log('Service Worker instalado com sucesso!');
} catch (error) {
  console.error('Erro ao inicializar o Service Worker:', error);
  
  // Fallback para navegadores incompatíveis
  self.addEventListener('fetch', (event) => {
    // Não fazer nada, deixar o navegador lidar com as requisições normalmente
  });
} 