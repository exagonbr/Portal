#!/usr/bin/env node

/**
 * Script para testar a correção do problema de JWT "invalid signature"
 */

const https = require('https');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisições HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'JWT-Fix-Test/1.0',
        ...options.headers
      },
      timeout: 10000
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Teste 1: Obter token atual
async function getCurrentToken() {
  log('🔍 Teste 1: Obtendo token atual...', 'blue');
  
  const credentials = [
    { email: 'admin@sabercon.edu.br', password: 'admin123' },
    { email: 'admin@sabercon.com.br', password: 'admin123' }
  ];

  for (const cred of credentials) {
    try {
      log(`   Tentando login com ${cred.email}...`, 'cyan');
      
      const response = await makeRequest('https://portal.sabercon.com.br/api/auth/login', {
        method: 'POST',
        body: cred
      });

      if (response.status === 200 && response.data.success && response.data.token) {
        log(`✅ Token obtido: ${response.data.token.substring(0, 20)}...`, 'green');
        log(`   Tamanho: ${response.data.token.length} caracteres`, 'cyan');
        
        // Analisar estrutura do JWT
        const parts = response.data.token.split('.');
        if (parts.length === 3) {
          try {
            const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            
            log(`   Header: ${JSON.stringify(header)}`, 'cyan');
            log(`   Payload: userId=${payload.userId}, email=${payload.email}, role=${payload.role}`, 'cyan');
            log(`   Expira: ${new Date(payload.exp * 1000).toISOString()}`, 'cyan');
            
            return response.data.token;
          } catch (decodeError) {
            log(`⚠️  Erro ao decodificar JWT: ${decodeError.message}`, 'yellow');
          }
        }
        
        return response.data.token;
      } else {
        log(`❌ Falha no login: ${response.status} - ${response.data.message || 'Erro desconhecido'}`, 'red');
      }
    } catch (error) {
      log(`❌ Erro na requisição: ${error.message}`, 'red');
    }
  }

  return null;
}

// Teste 2: Testar token com diferentes APIs
async function testTokenWithAPIs(token) {
  log('\n🧪 Teste 2: Testando token com diferentes APIs...', 'blue');
  
  if (!token) {
    log('❌ Nenhum token disponível para teste', 'red');
    return;
  }

  const apis = [
    { name: 'Auth Validate', url: 'https://portal.sabercon.com.br/api/auth/validate' },
    { name: 'Settings', url: 'https://portal.sabercon.com.br/api/settings' },
    { name: 'Users Stats', url: 'https://portal.sabercon.com.br/api/users/stats' },
    { name: 'Roles Stats', url: 'https://portal.sabercon.com.br/api/roles/stats' }
  ];

  for (const api of apis) {
    try {
      log(`   Testando ${api.name}...`, 'cyan');
      
      const response = await makeRequest(api.url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        log(`   ✅ ${api.name}: 200 OK`, 'green');
      } else if (response.status === 401) {
        log(`   ❌ ${api.name}: 401 Unauthorized - ${response.data.message || 'Token inválido'}`, 'red');
      } else {
        log(`   ⚠️  ${api.name}: ${response.status} - ${response.data.message || 'Erro'}`, 'yellow');
      }
    } catch (error) {
      log(`   ❌ ${api.name}: Erro de rede - ${error.message}`, 'red');
    }
  }
}

// Teste 3: Verificar possíveis secrets
function testJWTSecrets(token) {
  log('\n🔑 Teste 3: Testando possíveis secrets JWT...', 'blue');
  
  if (!token) {
    log('❌ Nenhum token disponível para teste', 'red');
    return;
  }

  const jwt = require('jsonwebtoken');
  const possibleSecrets = [
    'ExagonTech',
    'ExagonTech2024',
    'portal-sabercon-secret',
    'sabercon-jwt-secret',
    'default-secret'
  ];

  for (const secret of possibleSecrets) {
    try {
      log(`   Testando secret: ${secret}...`, 'cyan');
      const decoded = jwt.verify(token, secret);
      
      if (typeof decoded === 'object' && (decoded.userId || decoded.sub)) {
        log(`   ✅ SECRET FUNCIONOU: ${secret}`, 'green');
        log(`   Usuário: ${decoded.email || decoded.userId || decoded.sub}`, 'green');
        log(`   Role: ${decoded.role || 'N/A'}`, 'green');
        return secret;
      }
    } catch (error) {
      log(`   ❌ ${secret}: ${error.message}`, 'red');
    }
  }

  log('   ❌ Nenhum secret funcionou', 'red');
  return null;
}

// Teste 4: Simular correção automática
async function simulateAutoFix() {
  log('\n🔧 Teste 4: Simulando correção automática...', 'blue');
  
  // Obter novo token
  const newToken = await getCurrentToken();
  if (!newToken) {
    log('❌ Não foi possível obter novo token', 'red');
    return false;
  }

  // Verificar se o novo token funciona
  log('   Verificando se novo token resolve o problema...', 'cyan');
  await testTokenWithAPIs(newToken);
  
  return true;
}

// Função principal
async function runJWTFixTest() {
  log('🧪 TESTE DE CORREÇÃO JWT - Portal Sabercon', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  try {
    // Teste 1: Obter token
    const token = await getCurrentToken();
    
    if (token) {
      // Teste 2: Testar APIs
      await testTokenWithAPIs(token);
      
      // Teste 3: Testar secrets
      const workingSecret = testJWTSecrets(token);
      
      if (workingSecret) {
        log(`\n✅ SOLUÇÃO ENCONTRADA: Use o secret "${workingSecret}" no backend`, 'green');
        log('   Configure JWT_SECRET no arquivo .env do backend:', 'green');
        log(`   JWT_SECRET=${workingSecret}`, 'green');
      } else {
        log('\n⚠️  Nenhum secret funcionou - pode ser necessário gerar novo token', 'yellow');
        
        // Teste 4: Simular correção
        await simulateAutoFix();
      }
    }

    log('\n📋 RESUMO:', 'cyan');
    log('1. Se um secret funcionou, configure-o no backend', 'cyan');
    log('2. Se nenhum secret funcionou, implemente a correção automática', 'cyan');
    log('3. A correção automática obtém novo token válido', 'cyan');
    log('4. Teste novamente após aplicar as correções', 'cyan');

  } catch (error) {
    log(`❌ Erro geral: ${error.message}`, 'red');
  }
}

// Executar teste
if (require.main === module) {
  runJWTFixTest().catch(console.log);
}

module.exports = { runJWTFixTest, getCurrentToken, testTokenWithAPIs, testJWTSecrets };
