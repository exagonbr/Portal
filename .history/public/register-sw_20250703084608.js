// Script para registrar o Service Worker com Workbox
// Deve ser carregado no HTML principal

if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso:', registration.scope);
        
        // Escutar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nova versão do Service Worker disponível');
                // Forçar ativação imediata da nova versão
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
        
        // Escutar mudanças de controller (nova versão ativada)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service Worker atualizado, recarregando página...');
          // Pequeno delay para garantir que o novo SW está pronto
          setTimeout(() => {
            window.location.reload();
          }, 100);
        });
      })
      .catch((error) => {
        console.log('❌ Erro ao registrar Service Worker:', error);
      });
  });

  // Escutar mensagens do Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (!event.data) return;
    
    const { type, data } = event.data;
    
    switch (type) {
      case 'CACHE_CLEARED':
        console.log('✅ Cache limpo pelo Service Worker:', data);
        break;
        
      case 'CACHE_ERROR':
        console.log('❌ Erro no cache do Service Worker:', data);
        break;
        
      default:
        console.log('📨 Mensagem do Service Worker:', event.data);
    }
  });
} else {
  console.warn('⚠️ Service Worker não suportado ou desabilitado em desenvolvimento');
}

// Função para mostrar notificação de atualização
function showUpdateNotification() {
  // Verificar se já existe notificação
  if (document.getElementById('sw-update-notification')) return;
  
  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#0f3460';
  notification.style.color = 'white';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  notification.style.zIndex = '9999';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.justifyContent = 'space-between';
  notification.style.maxWidth = '400px';
  
  notification.innerHTML = `
    <div>
      <strong style="display: block; margin-bottom: 4px;">Nova versão disponível</strong>
      <span>Atualize para obter as últimas melhorias</span>
    </div>
    <button id="sw-update-button" style="background: white; color: #0f3460; border: none; padding: 6px 12px; border-radius: 4px; margin-left: 16px; cursor: pointer; font-weight: 500;">Atualizar</button>
  `;
  
  document.body.appendChild(notification);
  
  // Adicionar evento ao botão
  document.getElementById('sw-update-button')?.addEventListener('click', () => {
    notification.innerHTML = `
      <div>
        <strong style="display: block; margin-bottom: 4px;">Atualizando...</strong>
        <span>A página será recarregada</span>
      </div>
    `;
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });
}

// Função global para limpar cache via Service Worker
window.clearServiceWorkerCache = async (reason = 'manual') => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      // Criar um MessageChannel para comunicação bidirecional
      const messageChannel = new MessageChannel();
      
      // Prometer resposta
      const response = new Promise((resolve, reject) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data && event.data.success) {
            resolve(event.data);
          } else {
            reject(new Error((event.data && event.data.error) || 'Erro desconhecido'));
          }
        };
        
        // Timeout de 10 segundos
        setTimeout(() => {
          reject(new Error('Timeout na limpeza de cache'));
        }, 10000);
      });
      
      // Enviar mensagem para o Service Worker
      navigator.serviceWorker.controller.postMessage(
        {
          type: 'CLEAR_CACHE',
          payload: { reason }
        },
        [messageChannel.port2]
      );
      
      const result = await response;
      console.log('✅ Cache limpo com sucesso:', result);
      return result;
      
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }

  // Função para desregistrar Service Workers antigos
  async function unregisterOldWorkers() {
    try {
      const messageChannel = new MessageChannel();
      
      const response = new Promise((resolve, reject) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve(event.data);
          } else {
            reject(new Error(event.data.error || 'Erro desconhecido'));
          }
        };
        
        setTimeout(() => {
          reject(new Error('Timeout ao obter informações do cache'));
        }, 5000);
      });
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_INFO' },
        [messageChannel.port2]
      );
      
      const result = await response;
      console.log('📊 Informações do cache:', result);
      return result;
      
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