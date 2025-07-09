'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Carregar o script de utilidades do SW
    const loadSwUtils = () => {
      return new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = '/sw-utils.js';
        script.onload = () => resolve();
        script.onerror = () => {
          console.error('Erro ao carregar sw-utils.js');
          resolve();
        };
        document.head.appendChild(script);
      });
    };

    const registerSW = async () => {
      try {
        // Carregar utilitários primeiro
        await loadSwUtils();

        // Verificar se é um navegador compatível
        const userAgent = navigator.userAgent;
        const isIE = /MSIE|Trident/.test(userAgent);
        const isOldEdge = /Edge\/\d./i.test(userAgent);
        const isOldSafari = /Version\/[0-8]\..*Safari/.test(userAgent);
        
        if (isIE || isOldEdge || isOldSafari) {
          console.log('Navegador incompatível com Service Workers');
          return;
        }

        // Salvar o caminho atual para redirecionamento após reconexão
        localStorage.setItem('lastPath', window.location.pathname + window.location.search);

        // Registrar o service worker
        const registration = await navigator.serviceWorker.register('/worker.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        // Verificar se há uma atualização disponível
        if (registration.waiting) {
          console.log('Atualização do Service Worker disponível');
        }

        // Configurar atualizações automáticas
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Perguntar ao usuário se deseja atualizar
              if (window.confirm('Nova versão disponível! Deseja atualizar agora?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });

        // Verificar atualizações periodicamente (a cada 6 horas)
        setInterval(() => {
          registration.update().catch(error => {
            console.error('Erro ao verificar atualizações do SW:', error);
          });
        }, 6 * 60 * 60 * 1000);

        // Detectar quando o usuário está offline/online
        window.addEventListener('offline', () => {
          console.log('Usuário está offline');
        });

        window.addEventListener('online', () => {
          console.log('Usuário está online novamente');
        });

      } catch (error) {
        console.error('Erro ao registrar o service worker:', error);
      }
    };

    // Registrar o service worker quando a página terminar de carregar
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => {
        window.removeEventListener('load', registerSW);
      };
    }
  }, []);

  // Este componente não renderiza nada visível
  return null;
} 