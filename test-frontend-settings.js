const https = require('https');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'portal.sabercon.com.br',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Node.js Test Client'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = jsonData.length;
    }

    console.log(`\n🔍 Testando: ${method} https://${options.hostname}${path}`);

    const req = https.request(options, (res) => {
      let responseData = '';
      
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 Raw Response (${responseData.length} bytes):`, responseData);
        
        if (responseData.trim() === '') {
          console.log('⚠️  Resposta vazia detectada!');
          resolve({ 
            status: res.statusCode, 
            data: null, 
            error: 'Empty response',
            raw: responseData 
          });
          return;
        }
        
        try {
          const json = JSON.parse(responseData);
          console.log('✅ JSON válido:', json);
          resolve({ status: res.statusCode, data: json, raw: responseData });
        } catch (parseError) {
          console.log('❌ Erro de parsing JSON:', parseError.message);
          console.log('📝 Conteúdo que causou erro:', JSON.stringify(responseData));
          resolve({ 
            status: res.statusCode, 
            data: responseData, 
            error: parseError.message,
            raw: responseData 
          });
        }
      });
    });

    req.on('error', (error) => {
      console.log('🚨 Erro de requisição:', error.message);
      reject(error);
    });

    req.on('timeout', () => {
      console.log('⏰ Timeout da requisição');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    // Timeout de 10 segundos
    req.setTimeout(10000);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runDiagnosticTests() {
  console.log('🧪 Executando testes de diagnóstico para erro JSON...\n');

  const tests = [
    // Teste 1: Health check básico
    { name: 'Health Check', path: '/health' },
    
    // Teste 2: API Health check
    { name: 'API Health Check', path: '/api/health' },
    
    // Teste 3: Settings públicas (rota que pode estar causando problema)
    { name: 'Settings Públicas', path: '/api/settings' },
    
    // Teste 4: Settings públicas específicas
    { name: 'Settings Públicas Específicas', path: '/api/settings/public' },
    
    // Teste 5: Endpoint que não existe (para testar 404)
    { name: 'Endpoint Inexistente', path: '/api/nonexistent' },
    
    // Teste 6: Rota do frontend que pode estar fazendo proxy
    { name: 'Frontend Settings Route', path: '/api/settings' }
  ];

  for (const test of tests) {
    try {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🧪 TESTE: ${test.name}`);
      console.log(`${'='.repeat(50)}`);
      
      const result = await testEndpoint(test.path);
      
      console.log(`\n📊 RESULTADO:`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Erro: ${result.error || 'Nenhum'}`);
      console.log(`   Dados válidos: ${result.data !== null && typeof result.data === 'object'}`);
      
      if (result.error) {
        console.log(`\n🚨 PROBLEMA DETECTADO:`);
        console.log(`   Erro: ${result.error}`);
        console.log(`   Raw Response: "${result.raw}"`);
        console.log(`   Tamanho: ${result.raw?.length || 0} bytes`);
      }
      
    } catch (error) {
      console.log(`❌ Falha no teste ${test.name}:`, error.message);
    }
    
    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('✅ Diagnóstico concluído!');
  console.log(`${'='.repeat(50)}`);
}

// Executar testes
runDiagnosticTests().catch(console.log);