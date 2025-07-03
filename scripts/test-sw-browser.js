// Teste do Service Worker para executar no console do navegador
// Cole este código no console do navegador (F12) para testar o SW

async function testServiceWorker() {
  console.log('🔧 Testando Service Worker - Correção do Erro de Instalação\n');
  
  const results = {
    supported: false,
    registrations: 0,
    controller: null,
    state: null,
    errors: [],
    cacheSupported: false,
    cacheNames: [],
    logs: []
  };

  // 1. Verificar suporte
  results.supported = 'serviceWorker' in navigator;
  console.log(`${results.supported ? '✅' : '❌'} Service Worker suportado: ${results.supported}`);
  
  if (!results.supported) {
    console.log('❌ Service Worker não suportado neste navegador');
    return results;
  }

  try {
    // 2. Verificar registrations existentes
    const registrations = await navigator.serviceWorker.getRegistrations();
    results.registrations = registrations.length;
    console.log(`${results.registrations > 0 ? '✅' : '⚠️'} Service Workers registrados: ${results.registrations}`);
    
    if (registrations.length > 0) {
      const reg = registrations[0];
      results.state = reg.active ? reg.active.state : 'none';
      console.log(`🔄 Estado do SW: ${results.state}`);
      
      if (reg.active) {
        console.log(`📄 Script URL: ${reg.active.scriptURL}`);
      }
    }
    
    // 3. Verificar controller
    if (navigator.serviceWorker.controller) {
      results.controller = {
        scriptURL: navigator.serviceWorker.controller.scriptURL,
        state: navigator.serviceWorker.controller.state
      };
      console.log(`✅ Controller ativo: Sim`);
      console.log(`   📄 Script URL: ${results.controller.scriptURL}`);
      console.log(`   🔄 Estado: ${results.controller.state}`);
    } else {
      console.log(`⚠️ Controller ativo: Não`);
    }
    
    // 4. Tentar registrar se não há registrations
    if (results.registrations === 0) {
      console.log('🔄 Tentando registrar Service Worker...');
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        results.registrations = 1;
        results.state = registration.installing ? 'installing' : 'registered';
        console.log('✅ Service Worker registrado com sucesso!');
        
        // Aguardar ativação
        if (registration.installing) {
          console.log('⏳ Aguardando ativação...');
          await new Promise((resolve) => {
            registration.installing.addEventListener('statechange', () => {
              if (registration.installing.state === 'activated') {
                resolve();
              }
            });
          });
          console.log('✅ Service Worker ativado!');
        }
      } catch (error) {
        results.errors.push(`Registration failed: ${error.message}`);
        console.log(`❌ Erro ao registrar: ${error.message}`);
      }
    }
    
  } catch (error) {
    results.errors.push(`Service Worker test failed: ${error.message}`);
    console.log(`❌ Erro no teste: ${error.message}`);
  }

  // 5. Testar Cache API
  console.log('\n💾 Testando Cache API...');
  try {
    if ('caches' in window) {
      results.cacheSupported = true;
      const cacheNames = await caches.keys();
      results.cacheNames = cacheNames;
      console.log(`✅ Cache API suportada: ${results.cacheSupported}`);
      console.log(`📦 Caches encontrados: ${cacheNames.length}`);
      
      if (cacheNames.length > 0) {
        console.log('   Nomes dos caches:');
        cacheNames.forEach(name => console.log(`     - ${name}`));
      }
    } else {
      console.log(`❌ Cache API suportada: false`);
    }
  } catch (error) {
    console.log(`❌ Erro ao testar cache: ${error.message}`);
  }

  // 6. Resultado final
  const allGood = results.supported && 
                 results.registrations > 0 && 
                 results.errors.length === 0;

  console.log('\n🎯 RESULTADO FINAL:');
  if (allGood) {
    console.log('✅ Service Worker funcionando corretamente!');
    console.log('✅ Erro de instalação corrigido!');
  } else {
    console.log('❌ Ainda há problemas com o Service Worker');
    console.log('💡 Verifique os logs acima para mais detalhes');
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Erros encontrados:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  }

  return results;
}

// Função para limpar service workers e caches
async function clearServiceWorkerAndCache() {
  console.log('🧹 Limpando Service Workers e Caches...');
  
  try {
    // Limpar service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('🗑️ Service Worker removido');
    }
    
    // Limpar caches
    const cacheNames = await caches.keys();
    for (const name of cacheNames) {
      await caches.delete(name);
      console.log(`🗑️ Cache removido: ${name}`);
    }
    
    console.log('✅ Limpeza concluída!');
    console.log('🔄 Recarregue a página para testar novamente');
    
  } catch (error) {
    console.log(`❌ Erro na limpeza: ${error.message}`);
  }
}

// Função para forçar atualização do SW
async function updateServiceWorker() {
  console.log('🔄 Forçando atualização do Service Worker...');
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.update();
      console.log('🔄 Service Worker atualizado');
    }
    
    console.log('✅ Atualização concluída!');
    
  } catch (error) {
    console.log(`❌ Erro na atualização: ${error.message}`);
  }
}

// Executar teste automaticamente
console.log('📋 Funções disponíveis:');
console.log('- testServiceWorker() - Executar teste completo');
console.log('- clearServiceWorkerAndCache() - Limpar SW e caches');
console.log('- updateServiceWorker() - Forçar atualização do SW');
console.log('\n🚀 Executando teste automático...\n');

testServiceWorker(); 