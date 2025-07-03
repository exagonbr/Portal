// register-sw.js - Service Worker para controle de cache
(function() {
  'use strict';

  // Verificar se o navegador suporta Service Workers
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker não é suportado neste navegador');
    return;
  }

  // Função para limpar todos os caches
  async function clearAllCaches() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('Removendo cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
      console.log('Todos os caches foram limpos');
    } catch (error) {
      console.error('Erro ao limpar caches:', error);
    }
  }

  // Função para registrar o Service Worker
  async function registerServiceWorker() {
    try {
      // Primeiro, limpar todos os caches existentes
      await clearAllCaches();

      // Desregistrar qualquer Service Worker existente
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
        console.log('Service Worker desregistrado:', registration.scope);
      }

      // Registrar novo Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Forçar sempre buscar a versão mais recente
      });

      console.log('Service Worker registrado com sucesso:', registration.scope);

      // Forçar atualização imediata
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              // Limpar caches quando um novo worker é ativado
              clearAllCaches();
              // Recarregar a página para garantir conteúdo fresco
              if (confirm('Nova versão disponível! Deseja atualizar agora?')) {
                window.location.reload(true);
              }
            }
          });
        }
      });

      // Verificar por atualizações a cada 30 segundos
      setInterval(() => {
        registration.update();
      }, 30000);

    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }

  // Limpar caches ao carregar a página
  window.addEventListener('load', () => {
    // Limpar caches do navegador
    clearAllCaches();
    
    // Registrar Service Worker
    registerServiceWorker();

    // Adicionar listener para limpar cache quando a página for fechada
    window.addEventListener('beforeunload', () => {
      clearAllCaches();
    });
  });

  // Interceptar navegação para forçar reload sem cache
  if ('navigation' in window.performance) {
    const navEntries = window.performance.getEntriesByType('navigation');
    if (navEntries.length > 0 && navEntries[0].type === 'back_forward') {
      // Se a navegação foi via botões voltar/avançar, recarregar
      window.location.reload(true);
    }
  }

  // Adicionar meta tag para forçar no-cache via JavaScript
  const metaNoCache = document.createElement('meta');
  metaNoCache.httpEquiv = 'Cache-Control';
  metaNoCache.content = 'no-cache, no-store, must-revalidate, max-age=0';
  document.head.appendChild(metaNoCache);

  // Adicionar timestamp único a todos os links para evitar cache
  document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    const timestamp = Date.now();
    
    links.forEach(link => {
      const url = new URL(link.href, window.location.origin);
      if (!url.searchParams.has('_t')) {
        url.searchParams.set('_t', timestamp.toString());
        link.href = url.toString();
      }
    });
  });

})();