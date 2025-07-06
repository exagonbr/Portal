// Script para registrar o Service Worker com Workbox
// Deve ser carregado no HTML principal

// Função para registrar o Service Worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      if (registration.installing) {
        console.log('Service worker instalando');
      } else if (registration.waiting) {
        console.log('Service worker instalado');
      } else if (registration.active) {
        console.log('Service worker ativo');
      }

      // Atualizar o service worker imediatamente se houver uma nova versão
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Recarregar a página para usar o novo service worker
            window.location.reload();
          }
        });
      });

    } catch (error) {
      console.error('Erro ao registrar service worker:', error);
    }
  }
}

// Registrar o service worker quando a página carregar
if (document.readyState === 'complete') {
  registerServiceWorker();
} else {
  window.addEventListener('load', registerServiceWorker);
}

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
      console.log('❌ Erro ao limpar cache via Service Worker:', error);
      throw error;
    }
  } else {
    console.warn('⚠️ Service Worker não disponível para limpeza de cache');
    throw new Error('Service Worker não disponível');
  }
};

// Função global para obter informações do cache
window.getServiceWorkerCacheInfo = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
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
      console.log('❌ Erro ao obter informações do cache:', error);
      throw error;
    }
  } else {
    throw new Error('Service Worker não disponível');
  }
};

console.log('🚀 Script de registro do Service Worker carregado'); 