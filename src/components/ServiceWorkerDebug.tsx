'use client';

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [swStatus, setSwStatus] = useState<string>('');
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Verificar se o navegador suporta Service Workers
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    } else {
      setSwStatus('Seu navegador não suporta Service Workers');
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Detectar se é um navegador antigo ou incompatível
      const userAgent = navigator.userAgent;
      const isIE = /MSIE|Trident/.test(userAgent);
      const isOldEdge = /Edge\/\d./i.test(userAgent);
      const isOldSafari = /Version\/[0-8]\..*Safari/.test(userAgent);
      
      if (isIE || isOldEdge || isOldSafari) {
        setSwStatus('Navegador incompatível com Service Workers');
        return;
      }

      // Registrar o service worker com diferentes opções dependendo do navegador
      const reg = await navigator.serviceWorker.register('/worker.js', {
        scope: '/',
        // Usar updateViaCache: 'none' para garantir que o SW sempre seja atualizado da rede
        updateViaCache: 'none'
      });
      
      setRegistration(reg);
      
      // Verificar se há uma atualização disponível
      if (reg.waiting) {
        setIsUpdateAvailable(true);
        setSwStatus('Atualização disponível');
      } else {
        setSwStatus('Service Worker registrado com sucesso');
      }

      // Ouvir por atualizações
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setIsUpdateAvailable(true);
            setSwStatus('Atualização disponível');
          }
        });
      });

      // Ouvir por mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_STATUS') {
          setSwStatus(event.data.message);
        }
      });

      // Verificar atualizações periodicamente (a cada 2 horas)
      setInterval(() => {
        reg.update().catch(error => {
          console.error('Erro ao verificar atualizações do SW:', error);
        });
      }, 2 * 60 * 60 * 1000);

    } catch (error) {
      console.error('Erro ao registrar o service worker:', error);
      setSwStatus(`Falha ao registrar Service Worker: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      // Enviar mensagem para o SW atualizar
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recarregar a página após um pequeno atraso
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const clearCache = async () => {
    try {
      if (registration) {
        // Enviar mensagem para o SW limpar o cache
        registration.active?.postMessage({ type: 'CLEAR_CACHE' });
        setSwStatus('Cache limpo com sucesso');
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      setSwStatus(`Falha ao limpar cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Este componente não renderiza nada visível, apenas registra o SW
  return null;
}