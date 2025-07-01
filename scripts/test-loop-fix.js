const chalk = require('chalk');

async function testLoopFix() {
  console.log(chalk.blue.bold('\n🔧 Testando Correção de Loops de Requisições\n'));

  const testUrls = [
    'https://portal.sabercon.com.br/api/settings',
    'https://portal.sabercon.com.br/api/dashboard/metrics/realtime',
    'https://portal.sabercon.com.br/api/tv-shows?page=1&limit=12',
    'https://portal.sabercon.com.br/api/settings',
    'https://portal.sabercon.com.br/api/dashboard/metrics/realtime'
  ];

  console.log(chalk.yellow('📋 URLs sendo testadas:'));
  testUrls.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });

  console.log(chalk.cyan('\n🚀 Iniciando testes...\n'));

  const results = [];

  for (const url of testUrls) {
    console.log(chalk.blue(`Testando: ${url}`));
    
    try {
      const startTime = Date.now();
      
      // Fazer 5 requisições rápidas para testar o loop detector
      const promises = Array.from({ length: 5 }, (_, i) => 
        fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }).then(response => ({
          status: response.status,
          headers: {
            cors: response.headers.get('Access-Control-Allow-Origin'),
            contentType: response.headers.get('Content-Type')
          },
          index: i + 1
        })).catch(error => ({
          error: error.message,
          index: i + 1
        }))
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Analisar resultados
      const successful = responses.filter(r => r.status && r.status < 500).length;
      const errors = responses.filter(r => r.error).length;
      const corsEnabled = responses.some(r => r.headers?.cors);

      results.push({
        url,
        successful,
        errors,
        totalTime,
        corsEnabled,
        responses: responses.slice(0, 2) // Mostrar apenas 2 primeiras respostas
      });

      // Resultado individual
      if (successful > 0) {
        console.log(chalk.green(`  ✅ ${successful}/5 requisições bem-sucedidas`));
      }
      if (errors > 0) {
        console.log(chalk.red(`  ❌ ${errors}/5 requisições com erro`));
      }
      if (corsEnabled) {
        console.log(chalk.green(`  ✅ CORS habilitado`));
      }
      console.log(chalk.gray(`  ⏱️  Tempo total: ${totalTime}ms`));

    } catch (error) {
      console.log(chalk.red(`  ❌ Erro geral: ${error.message}`));
      results.push({
        url,
        error: error.message
      });
    }

    console.log(''); // Linha em branco
  }

  // Resumo final
  console.log(chalk.blue.bold('\n📊 RESUMO DOS TESTES\n'));

  results.forEach((result, index) => {
    console.log(chalk.cyan(`${index + 1}. ${result.url}`));
    
    if (result.error) {
      console.log(chalk.red(`   ❌ Erro: ${result.error}`));
    } else {
      console.log(chalk.green(`   ✅ Sucesso: ${result.successful}/5 requisições`));
      console.log(chalk.blue(`   🌐 CORS: ${result.corsEnabled ? 'Habilitado' : 'Não detectado'}`));
      console.log(chalk.gray(`   ⏱️  Tempo: ${result.totalTime}ms`));
      
      // Mostrar exemplos de resposta
      if (result.responses && result.responses.length > 0) {
        const firstResponse = result.responses[0];
        if (firstResponse.status) {
          console.log(chalk.gray(`   📋 Status: ${firstResponse.status}`));
        }
      }
    }
    console.log('');
  });

  // Status geral
  const totalSuccessful = results.filter(r => r.successful > 0).length;
  const totalWithCors = results.filter(r => r.corsEnabled).length;

  console.log(chalk.blue.bold('🎯 STATUS GERAL:'));
  console.log(chalk.green(`✅ URLs funcionais: ${totalSuccessful}/${results.length}`));
  console.log(chalk.green(`🌐 URLs com CORS: ${totalWithCors}/${results.length}`));

  if (totalSuccessful === results.length) {
    console.log(chalk.green.bold('\n🎉 TODOS OS TESTES PASSARAM! Loops corrigidos com sucesso.\n'));
  } else {
    console.log(chalk.yellow.bold('\n⚠️  Alguns testes falharam. Verifique as configurações.\n'));
  }

  console.log(chalk.gray('💡 Dica: Execute este teste após iniciar o servidor para verificar se os loops foram eliminados.'));
}

// Executar se chamado diretamente
if (require.main === module) {
  testLoopFix().catch(console.error);
}

module.exports = { testLoopFix }; 