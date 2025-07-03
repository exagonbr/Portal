// register-sw.js - Registrar Service Worker com NO-CACHE absoluto
(function() {
  'use strict';

  // Verificar suporte para Service Worker
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker não é suportado neste navegador');
    return;
  }

  // Função para limpar todos os caches
  async function clearAllCaches() {
    try {
      // Limpar caches do Service Worker
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('Removendo cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }

      // Limpar localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }

      // Limpar sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }

      // Limpar IndexedDB (se necessário)
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            console.log('Removendo IndexedDB:', db.name);
            return indexedDB.deleteDatabase(db.name);
          })
        );
      }
    } catch (error) {
      console.error('Erro ao limpar caches:', error);
    }
  }

  // Função para registrar o Service Worker
  async function registerServiceWorker() {
    try {
      // Limpar todos os caches antes de registrar
      await clearAllCaches();

      // Adicionar timestamp para forçar atualização
      const swUrl = `/sw.js?v=${Date.now()}`;
      
      // Registrar com opções de atualização agressivas
      const registration = await navigator.serviceWorker.register(swUrl, {
        updateViaCache: 'none', // Nunca usar cache para o SW
        scope: '/'
      });

      console.log('Service Worker registrado com sucesso:', registration);

      // Forçar atualização imediata
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('Nova versão do Service Worker encontrada');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.log('Nova versão do Service Worker ativada');
            // Recarregar a página para aplicar mudanças
            window.location.reload(true);
          }
        });
      });

      // Verificar atualizações a cada 30 segundos
      setInterval(() => {
        registration.update();
      }, 30000);

      // Comunicação com o Service Worker
      if (navigator.serviceWorker.controller) {
        // Enviar mensagem para limpar cache
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_ALL_CACHE'
        });
      }

      // Listener para mensagens do Service Worker
      navigator.serviceWorker.addEventListener('message', event => {
        console.log('Mensagem do Service Worker:', event.data);
        
        if (event.data.type === 'RELOAD_PAGE') {
          window.location.reload(true);
        }
        
        if (event.data.type === 'CLEAR_BROWSER_CACHE') {
          clearAllCaches();
        }
      });

    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }

  // Função para desregistrar Service Workers antigos
  async function unregisterOldWorkers() {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        console.log('Desregistrando Service Worker antigo:', registration);
        await registration.unregister();
      }
    } catch (error) {
      console.error('Erro ao desregistrar Service Workers:', error);
    }
  }

  // Executar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      await unregisterOldWorkers();
      await registerServiceWorker();
    });
  } else {
    // DOM já está pronto
    (async () => {
      await unregisterOldWorkers();
      await registerServiceWorker();
    })();
  }

  // Adicionar listeners para garantir no-cache
  window.addEventListener('load', () => {
    // Desabilitar BFCache
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        console.log('Página carregada do cache, recarregando...');
        window.location.reload(true);
      }
    });

    // Adicionar meta tags de no-cache via JavaScript
    const metaTags = [
      { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate, private' },
      { 'http-equiv': 'Pragma', content: 'no-cache' },
      { 'http-equiv': 'Expires', content: '0' },
      { name: 'robots', content: 'noarchive, nosnippet' }
    ];

    metaTags.forEach(attrs => {
      const existing = document.querySelector(`meta[http-equiv="${attrs['http-equiv']}"], meta[name="${attrs.name}"]`);
      if (!existing) {
        const meta = document.createElement('meta');
        Object.entries(attrs).forEach(([key, value]) => {
          meta.setAttribute(key, value);
        });
        document.head.appendChild(meta);
      }
    });
  });

  // Interceptar navegação para adicionar cache busting
  if (window.history && window.history.pushState) {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function() {
      const url = arguments[2];
      if (url) {
        const newUrl = new URL(url, window.location.origin);
        newUrl.searchParams.set('_cb', Date.now().toString());
        arguments[2] = newUrl.toString();
      }
      return originalPushState.apply(window.history, arguments);
    };

    window.history.replaceState = function() {
      const url = arguments[2];
      if (url) {
        const newUrl = new URL(url, window.location.origin);
        newUrl.searchParams.set('_cb', Date.now().toString());
        arguments[2] = newUrl.toString();
      }
      return originalReplaceState.apply(window.history, arguments);
    };
  }

  // Log para debug
  console.log('Sistema de Service Worker com NO-CACHE iniciado');

})();