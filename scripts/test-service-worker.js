const puppeteer = require('puppeteer');
const chalk = require('chalk');

async function testServiceWorker() {
  console.log(chalk.blue.bold('\n🔧 Testando Service Worker - Correção do Erro de Instalação\n'));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--window-size=1280,720',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Capturar logs do console
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('SW:') || text.includes('Service Worker')) {
        console.log(chalk.cyan('Browser Log:'), text);
      }
    });

    // Capturar erros
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(chalk.red('Page Error:'), error.message);
    });

    // Navegar para a página
    console.log(chalk.yellow('📱 Navegando para https://portal.sabercon.com.br...'));
    
    try {
      await page.goto('https://portal.sabercon.com.br', { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });
    } catch (error) {
      console.log(chalk.red('❌ Erro ao carregar página:'), error.message);
      console.log(chalk.yellow('💡 Certifique-se de que o servidor está rodando em portal.sabercon.com.br'));
      return;
    }

    // Aguardar um pouco para o service worker ser registrado
    await page.waitForTimeout(3000);

    // Testar registro do service worker
    console.log(chalk.yellow('\n🔍 Testando registro do Service Worker...'));
    
    const swTest = await page.evaluate(async () => {
      const results = {
        supported: 'serviceWorker' in navigator,
        registrations: 0,
        controller: null,
        state: null,
        errors: []
      };

      if (results.supported) {
        try {
          // Verificar registrations existentes
          const registrations = await navigator.serviceWorker.getRegistrations();
          results.registrations = registrations.length;
          
          if (registrations.length > 0) {
            const reg = registrations[0];
            results.state = reg.active ? reg.active.state : 'none';
          }
          
          // Verificar controller
          if (navigator.serviceWorker.controller) {
            results.controller = {
              scriptURL: navigator.serviceWorker.controller.scriptURL,
              state: navigator.serviceWorker.controller.state
            };
          }
          
          // Tentar registrar se não há registrations
          if (registrations.length === 0) {
            try {
              const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
              });
              results.registrations = 1;
              results.state = registration.installing ? 'installing' : 'registered';
            } catch (error) {
              results.errors.push(`Registration failed: ${error.message}`);
            }
          }
          
        } catch (error) {
          results.errors.push(`Service Worker test failed: ${error.message}`);
        }
      }

      return results;
    });

    // Exibir resultados
    console.log(chalk.green('\n📊 Resultados do Teste:'));
    console.log(`${swTest.supported ? '✅' : '❌'} Service Worker suportado: ${swTest.supported}`);
    console.log(`${swTest.registrations > 0 ? '✅' : '❌'} Service Workers registrados: ${swTest.registrations}`);
    console.log(`${swTest.controller ? '✅' : '⚠️'} Controller ativo: ${swTest.controller ? 'Sim' : 'Não'}`);
    
    if (swTest.controller) {
      console.log(`   📄 Script URL: ${swTest.controller.scriptURL}`);
      console.log(`   🔄 Estado: ${swTest.controller.state}`);
    }
    
    if (swTest.state) {
      console.log(`🔄 Estado do SW: ${swTest.state}`);
    }

    // Verificar erros específicos
    const hasSwError = errors.some(error => 
      error.includes('ServiceWorker') || 
      error.includes('workbox') ||
      error.includes('sw.js')
    );

    const hasSwLog = logs.some(log => 
      log.includes('SW: Service Worker Portal Sabercon carregado') ||
      log.includes('SW: Instalando service worker')
    );

    console.log(`${!hasSwError ? '✅' : '❌'} Sem erros de Service Worker: ${!hasSwError}`);
    console.log(`${hasSwLog ? '✅' : '⚠️'} Logs de inicialização encontrados: ${hasSwLog}`);

    if (swTest.errors.length > 0) {
      console.log(chalk.red('\n❌ Erros encontrados:'));
      swTest.errors.forEach(error => console.log(`   - ${error}`));
    }

    if (errors.length > 0) {
      console.log(chalk.red('\n❌ Erros da página:'));
      errors.forEach(error => console.log(`   - ${error}`));
    }

    // Teste de cache
    console.log(chalk.yellow('\n💾 Testando funcionalidade de cache...'));
    
    const cacheTest = await page.evaluate(async () => {
      try {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          return {
            supported: true,
            cacheNames: cacheNames,
            count: cacheNames.length
          };
        }
        return { supported: false, cacheNames: [], count: 0 };
      } catch (error) {
        return { supported: false, error: error.message, cacheNames: [], count: 0 };
      }
    });

    console.log(`${cacheTest.supported ? '✅' : '❌'} Cache API suportada: ${cacheTest.supported}`);
    console.log(`📦 Caches encontrados: ${cacheTest.count}`);
    
    if (cacheTest.cacheNames.length > 0) {
      console.log('   Nomes dos caches:');
      cacheTest.cacheNames.forEach(name => console.log(`     - ${name}`));
    }

    // Resultado final
    const allGood = swTest.supported && 
                   swTest.registrations > 0 && 
                   !hasSwError && 
                   swTest.errors.length === 0;

    console.log(chalk.bold('\n🎯 RESULTADO FINAL:'));
    if (allGood) {
      console.log(chalk.green('✅ Service Worker funcionando corretamente!'));
      console.log(chalk.green('✅ Erro de instalação corrigido!'));
    } else {
      console.log(chalk.red('❌ Ainda há problemas com o Service Worker'));
      console.log(chalk.yellow('💡 Verifique os logs acima para mais detalhes'));
    }

    // Aguardar um pouco para visualizar
    await page.waitForTimeout(2000);

  } catch (error) {
    console.log(chalk.red('❌ Erro durante o teste:'), error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testServiceWorker().catch(console.log);
}

module.exports = { testServiceWorker }; 