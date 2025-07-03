// Script para testar se as correções do Service Worker estão funcionando

async function testServiceWorkerFix() {
  console.log('🧪 Testando correções do Service Worker...');
  
  const results = {
    swStatus: false,
    apiTests: [],
    assetTests: [],
    duplicateApiCheck: false
  };
  
  // 1. Verificar status do Service Worker
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    results.swStatus = registrations.length > 0 && registrations.some(reg => reg.active);
    console.log('✅ Service Worker status:', results.swStatus ? 'Ativo' : 'Inativo');
  }
  
  // 2. Testar APIs que estavam com URLs duplicadas
  const apiEndpoints = [
    '/api/dashboard/system',
    '/api/users/stats',
    '/api/dashboard/analytics',
    '/api/dashboard/engagement'
  ];
  
  console.log('🔬 Testando APIs...');
  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(endpoint, {
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' }
      });
      
      const status = response.ok ? 'OK' : `Erro ${response.status}`;
      results.apiTests.push({ endpoint, status, success: response.ok });
      console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${status}`);
    } catch (error) {
      results.apiTests.push({ endpoint, status: `Erro: ${error.message}`, success: false });
      console.log(`❌ ${endpoint}: Erro - ${error.message}`);
    }
  }
  
  // 3. Testar assets CSS problemáticos
  const assetUrls = [
    '/_next/static/css/vendors-node_modules_g.css',
    '/_next/static/chunks/webpack.js'
  ];
  
  console.log('🎨 Testando assets...');
  for (const url of assetUrls) {
    try {
      const response = await fetch(url, { cache: 'no-cache' });
      const status = response.ok ? 'OK' : `Erro ${response.status}`;
      results.assetTests.push({ url, status, success: response.ok });
      console.log(`${response.ok ? '✅' : '❌'} ${url}: ${status}`);
    } catch (error) {
      results.assetTests.push({ url, status: `Erro: ${error.message}`, success: false });
      console.log(`❌ ${url}: Erro - ${error.message}`);
    }
  }
  
  // 4. Verificar se não há mais URLs duplicadas sendo chamadas
  console.log('🔍 Verificando logs de rede...');
  if (window.performance && window.performance.getEntriesByType) {
    const networkEntries = window.performance.getEntriesByType('navigation');
    const resourceEntries = window.performance.getEntriesByType('resource');
    
    const duplicateApiUrls = resourceEntries.filter(entry => 
      entry.name.includes('/api/api/')
    );
    
    results.duplicateApiCheck = duplicateApiUrls.length === 0;
    
    if (duplicateApiUrls.length > 0) {
      console.warn('⚠️ URLs duplicadas ainda encontradas:');
      duplicateApiUrls.forEach(entry => console.warn('  -', entry.name));
    } else {
      console.log('✅ Nenhuma URL duplicada encontrada');
    }
  }
  
  // 5. Resumo dos resultados
  console.log('\n📊 Resumo dos testes:');
  console.log('Service Worker:', results.swStatus ? '✅ Funcionando' : '❌ Problema');
  console.log('APIs funcionando:', results.apiTests.filter(t => t.success).length, '/', results.apiTests.length);
  console.log('Assets funcionando:', results.assetTests.filter(t => t.success).length, '/', results.assetTests.length);
  console.log('URLs duplicadas:', results.duplicateApiCheck ? '✅ Corrigido' : '⚠️ Ainda há problemas');
  
  return results;
}

// Função para limpar cache e testar novamente
async function clearCacheAndTest() {
  console.log('🧹 Limpando cache e testando novamente...');
  
  try {
    // Limpar caches
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('✅ Cache limpo');
    
    // Aguardar um pouco e testar
    setTimeout(() => {
      testServiceWorkerFix();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
  }
}

// Função para monitorar requisições em tempo real
function monitorNetworkRequests() {
  console.log('👀 Monitorando requisições de rede...');
  
  // Interceptar fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('/api/')) {
      if (url.includes('/api/api/')) {
        console.warn('⚠️ URL duplicada detectada:', url);
      } else {
        console.log('✅ API call normal:', url);
      }
    }
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Monitor de rede ativo');
}

// Executar automaticamente se carregado no navegador
if (typeof window !== 'undefined') {
  window.testServiceWorkerFix = testServiceWorkerFix;
  window.clearCacheAndTest = clearCacheAndTest;
  window.monitorNetworkRequests = monitorNetworkRequests;
  
  console.log('🛠️ Ferramentas de teste do Service Worker carregadas!');
  console.log('💡 Use: testServiceWorkerFix(), clearCacheAndTest(), ou monitorNetworkRequests()');
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testServiceWorkerFix,
    clearCacheAndTest,
    monitorNetworkRequests
  };
} 