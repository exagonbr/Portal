
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';


// Pré-cache dos recursos gerados pelo Workbox
precacheAndRoute(self.__WB_MANIFEST);

// Cache para imagens
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
);

// Cache para fontes
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 dias
      }),
    ],
  })
);

// Cache para scripts e estilos
registerRoute(
  ({ request }) => 
    request.destination === 'script' || 
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Cache para API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 10 * 60, // 10 minutos
      }),
    ],
  })
);

// Cache para páginas HTML
registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 5 * 60, // 5 minutos
      }),
    ],
  })
);

// Evento de instalação
self.addEventListener('install', (event) => {
  self.skipWaiting();
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
                  !cacheName.includes('pages');
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