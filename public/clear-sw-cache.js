// Script para limpar o cache do Service Worker
// Versão: 2.0.0

(function() {
  const STATUS_ELEMENT_ID = 'sw-status';
  const BUTTON_ELEMENT_ID = 'clear-sw-button';
  const RELOAD_BUTTON_ID = 'reload-page-button';
  const VERSION_ELEMENT_ID = 'sw-version';
  
  // Função para mostrar status
  function showStatus(message, isError = false) {
    const statusElement = document.getElementById(STATUS_ELEMENT_ID);
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = isError ? 'error' : 'success';
    } else {
      console.log(message);
    }
  }
  
  // Função para mostrar versão do SW
  function showVersion(version) {
    const versionElement = document.getElementById(VERSION_ELEMENT_ID);
    if (versionElement) {
      versionElement.textContent = version || 'N/A';
    }
  }
  
  // Função para verificar a versão do SW
  async function checkServiceWorkerVersion() {
    if (!('serviceWorker' in navigator)) {
      showVersion('Service Worker não suportado');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (!registration.active) {
        showVersion('Sem SW ativo');
        return;
      }
      
      // Usar MessageChannel para comunicação
      const messageChannel = new MessageChannel();
      
      // Criar uma Promise para aguardar a resposta
      const versionPromise = new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version);
        };
      });
      
      // Enviar mensagem para o SW
      registration.active.postMessage({
        type: 'GET_VERSION'
      }, [messageChannel.port2]);
      
      // Aguardar resposta com timeout
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve('Timeout'), 2000);
      });
      
      const version = await Promise.race([versionPromise, timeoutPromise]);
      showVersion(version);
    } catch (error) {
      showVersion('Erro ao verificar versão');
      console.error('Erro ao verificar versão do SW:', error);
    }
  }
  
  // Função para limpar todos os caches
  async function clearAllCaches() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      return true;
    } catch (error) {
      console.error('Erro ao limpar caches:', error);
      return false;
    }
  }
  
  // Função para desregistrar todos os Service Workers
  async function unregisterAllServiceWorkers() {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      return registrations.length > 0;
    } catch (error) {
      console.error('Erro ao desregistrar Service Workers:', error);
      return false;
    }
  }
  
  // Função para limpar o cache do Service Worker
  async function clearServiceWorkerCache() {
    if (!('serviceWorker' in navigator)) {
      showStatus('Service Worker não suportado neste navegador', true);
      return;
    }
    
    const button = document.getElementById(BUTTON_ELEMENT_ID);
    if (button) button.disabled = true;
    
    try {
      showStatus('Limpando caches...');
      await clearAllCaches();
      
      showStatus('Desregistrando Service Workers...');
      const hadServiceWorkers = await unregisterAllServiceWorkers();
      
      if (hadServiceWorkers) {
        showStatus('Service Worker desregistrado com sucesso! Recarregue a página para aplicar as mudanças.');
      } else {
        showStatus('Nenhum Service Worker encontrado para desregistrar. Caches limpos com sucesso.');
      }
      
      // Mostrar botão de recarregar
      const reloadButton = document.getElementById(RELOAD_BUTTON_ID);
      if (reloadButton) {
        reloadButton.style.display = 'inline-block';
      }
    } catch (error) {
      console.error('Erro ao limpar cache do Service Worker:', error);
      showStatus(`Erro: ${error.message}`, true);
    } finally {
      if (button) button.disabled = false;
    }
  }
  
  // Inicializar quando o documento estiver pronto
  function init() {
    // Verificar versão do SW
    checkServiceWorkerVersion();
    
    // Configurar botão de limpar cache
    const button = document.getElementById(BUTTON_ELEMENT_ID);
    if (button) {
      button.addEventListener('click', clearServiceWorkerCache);
    }
    
    // Configurar botão de recarregar
    const reloadButton = document.getElementById(RELOAD_BUTTON_ID);
    if (reloadButton) {
      reloadButton.addEventListener('click', () => {
        window.location.reload(true);
      });
    }
  }
  
  // Inicializar quando o documento estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 