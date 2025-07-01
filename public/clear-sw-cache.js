// Script para limpar cache do Service Worker e resolver problemas de carregamento

async function clearServiceWorkerCache() {
  console.log('🧹 Iniciando limpeza do cache do Service Worker...');
  
  try {
    // 1. Limpar todos os caches
    const cacheNames = await caches.keys();
    console.log('📦 Caches encontrados:', cacheNames);
    
    await Promise.all(
      cacheNames.map(cacheName => {
        console.log('🗑️ Removendo cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
    
    // 2. Desregistrar service workers existentes
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('🔧 Service Workers encontrados:', registrations.length);
      
      await Promise.all(
        registrations.map(registration => {
          console.log('🗑️ Desregistrando SW:', registration.scope);
          return registration.unregister();
        })
      );
    }
    
    console.log('✅ Limpeza concluída com sucesso!');
    console.log('🔄 Recarregue a página para aplicar as mudanças.');
    
    return true;
  } catch (error) {
    console.log('❌ Erro durante a limpeza:', error);
    return false;
  }
}

// Função para recarregar assets problemáticos
async function reloadProblematicAssets() {
  console.log('🔄 Recarregando assets problemáticos...');
  
  const problematicUrls = [
    '/_next/static/css/vendors-node_modules_g.css',
    // Adicione outros URLs problemáticos aqui
  ];
  
  for (const url of problematicUrls) {
    try {
      console.log('🔄 Recarregando:', url);
      const response = await fetch(url, { 
        cache: 'no-cache',
        mode: 'cors'
      });
      
      if (response.ok) {
        console.log('✅ Asset recarregado com sucesso:', url);
      } else {
        console.warn('⚠️ Falha ao recarregar asset:', url, response.status);
      }
    } catch (error) {
      console.log('❌ Erro ao recarregar asset:', url, error);
    }
  }
}

// Função para diagnosticar problemas do Service Worker
async function diagnoseSWProblems() {
  console.log('🔍 Diagnosticando problemas do Service Worker...');
  
  const diagnosis = {
    swSupported: 'serviceWorker' in navigator,
    swRegistered: false,
    swActive: false,
    cacheCount: 0,
    problematicUrls: []
  };
  
  try {
    if (diagnosis.swSupported) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      diagnosis.swRegistered = registrations.length > 0;
      
      if (registrations.length > 0) {
        diagnosis.swActive = registrations.some(reg => reg.active);
      }
    }
    
    const cacheNames = await caches.keys();
    diagnosis.cacheCount = cacheNames.length;
    
    // Testar URLs problemáticos
    const testUrls = [
      '/_next/static/css/vendors-node_modules_g.css'
    ];
    
    for (const url of testUrls) {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) {
          diagnosis.problematicUrls.push({ url, status: response.status });
        }
      } catch (error) {
        diagnosis.problematicUrls.push({ url, error: error.message });
      }
    }
    
    console.log('📊 Diagnóstico completo:', diagnosis);
    return diagnosis;
  } catch (error) {
    console.log('❌ Erro no diagnóstico:', error);
    return diagnosis;
  }
}

// Executar automaticamente se este script for carregado diretamente
if (typeof window !== 'undefined') {
  window.clearServiceWorkerCache = clearServiceWorkerCache;
  window.reloadProblematicAssets = reloadProblematicAssets;
  window.diagnoseSWProblems = diagnoseSWProblems;
  
  console.log('🛠️ Ferramentas de diagnóstico do Service Worker carregadas!');
  console.log('💡 Use: clearServiceWorkerCache(), reloadProblematicAssets(), ou diagnoseSWProblems()');
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    clearServiceWorkerCache,
    reloadProblematicAssets,
    diagnoseSWProblems
  };
} 