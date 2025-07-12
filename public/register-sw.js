// Script de registro do Service Worker para o Portal Sabercon
// Versão: 2.0.0

(function() {
  // Verificar se o navegador suporta Service Worker
  if ('serviceWorker' in navigator) {
    // Registrar o Service Worker apenas quando a página estiver totalmente carregada
    window.addEventListener('load', async () => {
      try {
        // Registrar o Service Worker com escopo raiz
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none' // Não usar cache para atualizações
        });
        
        console.log('Service Worker registrado com sucesso:', registration.scope);
        
        // Verificar se há atualização disponível
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Novo Service Worker em instalação');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Novo Service Worker instalado e pronto para ativação');
              // Mostrar notificação de atualização (opcional)
              showUpdateNotification();
            }
          });
        });
        
        // Verificar se há uma atualização pendente
        if (registration.waiting) {
          console.log('Atualização do Service Worker pendente');
          // Mostrar notificação de atualização (opcional)
          showUpdateNotification();
        }
        
        // Lidar com mensagens do Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { type, payload } = event.data || {};
          
          switch (type) {
            case 'CACHE_UPDATED':
              console.log('Cache atualizado:', payload);
              break;
            case 'OFFLINE_READY':
              console.log('Aplicação pronta para uso offline');
              break;
          }
        });
        
        // Verificar conexão e notificar o Service Worker
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
        
      } catch (error) {
        console.error('Falha ao registrar o Service Worker:', error);
      }
    });
  } else {
    console.log('Service Worker não é suportado neste navegador');
  }
  
  // Função para atualizar status de conexão
  function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    console.log('Status de conexão:', isOnline ? 'Online' : 'Offline');
    
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CONNECTION_STATUS',
        payload: { isOnline }
      });
    }
  }
  
  // Função para mostrar notificação de atualização
  function showUpdateNotification() {
    // Implementação básica - pode ser personalizada conforme necessário
    if (window.updateNotificationShown) return;
    window.updateNotificationShown = true;
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#2563eb';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.justifyContent = 'space-between';
    
    // Adicionar texto
    const text = document.createElement('span');
    text.textContent = 'Nova versão disponível!';
    notification.appendChild(text);
    
    // Adicionar botão de atualização
    const button = document.createElement('button');
    button.textContent = 'Atualizar';
    button.style.marginLeft = '15px';
    button.style.backgroundColor = 'white';
    button.style.color = '#2563eb';
    button.style.border = 'none';
    button.style.padding = '6px 12px';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    
    // Adicionar evento de clique para atualizar
    button.addEventListener('click', () => {
      // Remover notificação
      document.body.removeChild(notification);
      
      // Enviar mensagem para o Service Worker atualizar
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // Recarregar a página
      window.location.reload();
    });
    
    notification.appendChild(button);
    
    // Adicionar ao corpo do documento
    document.body.appendChild(notification);
  }
  
  // Função para atualizar o Service Worker
  window.updateServiceWorker = function() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };
})(); 