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
        // Verificar se já está carregado
        if (window.swUtils) {
          console.log('sw-utils.js já está carregado');
          resolve();
          return;
        }

        const maxRetries = 3;
        let retryCount = 0;

        const tryLoadScript = () => {
          const script = document.createElement('script');
          script.src = `/sw-utils.js?v=${Date.now()}`; // Adicionar parâmetro de cache-busting
          
          script.onload = () => {
console.log('Tentando carregar sw-utils.js...');
            console.log('sw-utils.js carregado com sucesso');
            resolve();
          };
          
          script.onerror = (error) => {
            console.error(`Erro ao carregar sw-utils.js (tentativa ${retryCount + 1}/${maxRetries}):`, error);
            
            if (retryCount < maxRetries - 1) {
              retryCount++;
              setTimeout(() => {
                console.log(`Tentando carregar sw-utils.js novamente (${retryCount}/${maxRetries})...`);
                tryLoadScript();
              }, 1000); // Esperar 1 segundo antes de tentar novamente
            } else {
              console.error('Falha ao carregar sw-utils.js após várias tentativas');
              // Continuar mesmo com erro
              resolve();
            }
          };
          
          document.head.appendChild(script);
        };

        tryLoadScript();
      });
    };

    // Verificar se um arquivo existe
    const checkFileExists = async (url: string) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        console.error(`Erro ao verificar arquivo ${url}:`, error);
        return false;
      }
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

        // Verificar se os arquivos existem antes de tentar registrá-los
        const workerExists = await checkFileExists('/worker.js');
        const basicWorkerExists = await checkFileExists('/sw-basic.js');
        
        // Tentar registrar a versão principal do service worker
        if (workerExists) {
          try {
            const registration = await navigator.serviceWorker.register('/worker.js', {
              scope: '/',
              updateViaCache: 'none'
            });
            
            console.log('Service Worker principal registrado com sucesso');
            handleRegistration(registration);
            return;
          } catch (mainError) {
            console.error('Erro ao registrar Service Worker principal:', mainError);
          }
        } else {
          console.error('Arquivo worker.js não encontrado');
        }
        
        // Tentar registrar a versão básica como fallback
        if (basicWorkerExists) {
          try {
            console.log('Tentando registrar versão básica do Service Worker...');
            const basicRegistration = await navigator.serviceWorker.register('/sw-basic.js', {
              scope: '/',
              updateViaCache: 'none'
            });
            
            console.log('Service Worker básico registrado com sucesso');
            handleRegistration(basicRegistration);
          } catch (basicError) {
            console.error('Erro ao registrar Service Worker básico:', basicError);
          }
        } else {
          console.error('Arquivo sw-basic.js não encontrado');
          
          // Tentar usar o sw.js existente como último recurso
          const oldSwExists = await checkFileExists('/sw.js');
          if (oldSwExists) {
            try {
              console.log('Tentando usar o Service Worker existente (sw.js)...');
              const oldRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
              });
              
              console.log('Service Worker antigo (sw.js) registrado com sucesso');
              handleRegistration(oldRegistration);
            } catch (oldError) {
              console.error('Erro ao registrar Service Worker antigo:', oldError);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao registrar o service worker:', error);
      }
    };

    const handleRegistration = (registration: ServiceWorkerRegistration) => {
      // Marcar que o SW foi registrado pelo componente
      window.swRegisteredByComponent = true;
      
      // Verificar se há uma atualização disponível
      if (registration.waiting) {
        console.log('Atualização do Service Worker disponível');
      }

      // Configurar atualizações automáticas - SEM RECARREGAMENTO AUTOMÁTICO
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Apenas registrar que há uma nova versão disponível
            console.log('Nova versão do Service Worker instalada e pronta para ativar');
          }
        });
      });

      // Verificar atualizações periodicamente (a cada 24 horas em vez de 6)
      setInterval(() => {
        registration.update().catch(error => {
          console.error('Erro ao verificar atualizações do SW:', error);
        });
      }, 24 * 60 * 60 * 1000); // 24 horas

      // Detectar quando o usuário está offline/online
      window.addEventListener('offline', () => {
        console.log('Usuário está offline');
      });

      window.addEventListener('online', () => {
        console.log('Usuário está online novamente');
      });
    };

    // Registrar o service worker quando a página terminar de carregar
    // Usar um timeout para evitar que o registro aconteça imediatamente
    const timer = setTimeout(() => {
      registerSW();
    }, 5000); // Esperar 5 segundos antes de registrar

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Este componente não renderiza nada visível
  return null;
}

// Adicionar declaração para TypeScript
declare global {
  interface Window {
    swRegisteredByComponent?: boolean;
    swUtils?: any;
    swStatus?: any;
  }
} 