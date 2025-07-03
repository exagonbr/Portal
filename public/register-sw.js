// Script para registrar o Service Worker personalizado
// Deve ser carregado no HTML principal

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso:', registration.scope);
        
        // Escutar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nova versão do Service Worker disponível');
                // Opcionalmente, notificar o usuário sobre a atualização
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar Service Worker:', error);
      });
  });

  // Escutar mensagens do Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
      case 'CACHE_CLEARED':
        console.log('✅ Cache limpo pelo Service Worker:', data);
        break;
        
      case 'CACHE_ERROR':
        console.error('❌ Erro no cache do Service Worker:', data);
        break;
        
      default:
        console.log('📨 Mensagem do Service Worker:', event.data);
    }
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
          if (event.data.success) {
            resolve(event.data);
          } else {
            reject(new Error(event.data.error || 'Erro desconhecido'));
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
      console.error('❌ Erro ao limpar cache via Service Worker:', error);
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
      console.error('❌ Erro ao obter informações do cache:', error);
      throw error;
    }
  } else {
    throw new Error('Service Worker não disponível');
  }
};

console.log('🚀 Script de registro do Service Worker carregado'); 