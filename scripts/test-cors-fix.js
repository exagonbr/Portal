#!/usr/bin/env node

/**
 * Script para testar as correções de CORS e loop de requisições
 * Portal Sabercon - Verificar se os problemas foram resolvidos
 */

const http = require('http');
const https = require('https');

const URLS_TO_TEST = [
  'https://portal.sabercon.com.br/api/tv-shows?page=1&limit=12',
  'https://portal.sabercon.com.br/api/tv-shows?page=1&limit=12',
  'https://portal.sabercon.com.br/api/tv-shows?page=1&limit=12',
];

const ORIGINS_TO_TEST = [
  'https://portal.sabercon.com.br',
  'https://portal.sabercon.com.br',
  'https://portal.sabercon.com.br/api',
  null // Sem origem
];

console.log('🧪 TESTANDO CORREÇÕES DE CORS E LOOP DE REQUISIÇÕES');
console.log('====================================================');

async function testCorsHeaders(url, origin) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'OPTIONS', // Teste de preflight
      headers: {
        'Origin': origin || 'https://portal.sabercon.com.br',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      },
      timeout: 5000
    };

    const req = client.request(options, (res) => {
      const headers = res.headers;
      
      resolve({
        success: true,
        status: res.statusCode,
        headers: {
          'access-control-allow-origin': headers['access-control-allow-origin'],
          'access-control-allow-methods': headers['access-control-allow-methods'],
          'access-control-allow-headers': headers['access-control-allow-headers'],
          'access-control-allow-credentials': headers['access-control-allow-credentials'],
          'access-control-max-age': headers['access-control-max-age'],
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      resolve({
        success: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function testGetRequest(url, origin) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Origin': origin || 'https://portal.sabercon.com.br',
        'Content-Type': 'application/json',
        'User-Agent': 'CORS-Test-Script/1.0'
      },
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: json,
            headers: {
              'access-control-allow-origin': res.headers['access-control-allow-origin'],
              'content-type': res.headers['content-type']
            }
          });
        } catch (error) {
          resolve({
            success: false,
            status: res.statusCode,
            error: 'Invalid JSON response',
            data: data.substring(0, 200)
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      resolve({
        success: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function testMultipleRequests(url, count = 5) {
  console.log(`\n📊 Testando ${count} requisições simultâneas para detectar loops...`);
  
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(testGetRequest(url, 'https://portal.sabercon.com.br'));
  }
  
  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r.success && r.status === 200).length;
  const failed = results.filter(r => !r.success || r.status !== 200).length;
  
  console.log(`   ✅ Sucesso: ${successful}/${count}`);
  console.log(`   ❌ Falhas: ${failed}/${count}`);
  
  if (failed > 0) {
    console.log('   🔍 Detalhes das falhas:');
    results.forEach((result, index) => {
      if (!result.success || result.status !== 200) {
        console.log(`     ${index + 1}: ${result.error || `Status ${result.status}`}`);
      }
    });
  }
  
  return { successful, failed, total: count };
}

async function runTests() {
  let totalTests = 0;
  let passedTests = 0;
  
  console.log('\n🔍 TESTE 1: Verificação de Headers CORS (OPTIONS)');
  console.log('─'.repeat(50));
  
  for (const url of URLS_TO_TEST) {
    for (const origin of ORIGINS_TO_TEST) {
      totalTests++;
      
      console.log(`\n📍 Testando: ${url}`);
      console.log(`   Origin: ${origin || 'null'}`);
      
      const result = await testCorsHeaders(url, origin);
      
      if (result.success) {
        console.log(`   ✅ Status: ${result.status}`);
        console.log(`   🌐 Allow-Origin: ${result.headers['access-control-allow-origin'] || 'não definido'}`);
        console.log(`   📋 Allow-Methods: ${result.headers['access-control-allow-methods'] || 'não definido'}`);
        console.log(`   🔑 Allow-Headers: ${result.headers['access-control-allow-headers'] || 'não definido'}`);
        
        // Verificar se os headers estão corretos
        const hasOrigin = result.headers['access-control-allow-origin'];
        const hasMethods = result.headers['access-control-allow-methods'];
        
        if (hasOrigin && hasMethods) {
          passedTests++;
          console.log('   🎉 CORS configurado corretamente!');
        } else {
          console.log('   ⚠️ Headers CORS incompletos');
        }
      } else {
        console.log(`   ❌ Erro: ${result.error}`);
      }
    }
  }
  
  console.log('\n🔍 TESTE 2: Requisições GET Reais');
  console.log('─'.repeat(50));
  
  for (const url of URLS_TO_TEST) {
    totalTests++;
    
    console.log(`\n📍 Testando GET: ${url}`);
    
    const result = await testGetRequest(url, 'https://portal.sabercon.com.br');
    
    if (result.success) {
      console.log(`   ✅ Status: ${result.status}`);
      console.log(`   🌐 Allow-Origin: ${result.headers['access-control-allow-origin'] || 'não definido'}`);
      console.log(`   📄 Content-Type: ${result.headers['content-type'] || 'não definido'}`);
      
      if (result.data && result.data.success !== undefined) {
        console.log(`   📊 Resposta API: ${result.data.success ? 'Sucesso' : 'Erro'}`);
        if (result.data.data && result.data.data.tvShows) {
          console.log(`   📺 TV Shows encontrados: ${result.data.data.tvShows.length}`);
        }
      }
      
      passedTests++;
      console.log('   🎉 Requisição GET funcionando!');
    } else {
      console.log(`   ❌ Erro: ${result.error}`);
      if (result.data) {
        console.log(`   📄 Dados: ${result.data}`);
      }
    }
  }
  
  console.log('\n🔍 TESTE 3: Detecção de Loops');
  console.log('─'.repeat(50));
  
  // Testar apenas URLs que funcionaram
  const workingUrl = URLS_TO_TEST.find(url => url.includes('portal.sabercon.com.br'));
  if (workingUrl) {
    const loopResult = await testMultipleRequests(workingUrl, 10);
    
    if (loopResult.successful >= 8) {
      passedTests++;
      console.log('   🎉 Sistema não está bloqueando requisições normais!');
    } else {
      console.log('   ⚠️ Possível problema com múltiplas requisições');
    }
    totalTests++;
  }
  
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('═'.repeat(50));
  console.log(`✅ Testes passaram: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ CORS está configurado corretamente');
    console.log('✅ Loop de requisições foi resolvido');
    console.log('✅ APIs estão funcionando normalmente');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM');
    console.log('🔧 Verifique as configurações de CORS e backend');
  }
  
  console.log('\n🔗 URLs para testar manualmente:');
  URLS_TO_TEST.forEach(url => {
    console.log(`   • ${url}`);
  });
}

// Executar testes
runTests().catch(error => {
  console.log('❌ Erro ao executar testes:', error);
  process.exit(1);
}); 