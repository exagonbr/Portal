#!/usr/bin/env node

/**
 * Script de Teste de Validação de Autenticação
 * Testa o fluxo completo de autenticação do Portal Sabercon
 */

const https = require('https');
const http = require('http');

// Configurações
const BASE_URL = 'https://portal.sabercon.com.br';
const LOCAL_URL = 'https://portal.sabercon.com.br';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Portal-Auth-Test/1.0',
        ...options.headers
      },
      timeout: 10000
    };

    const req = client.request(url, requestOptions, (res) => {
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

    req.on('error', (error) => {
      reject(error);
    });

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

// Teste 1: Obter token de autenticação
async function testGetAuthToken() {
  logInfo('Teste 1: Obtendo token de autenticação...');
  
  const credentials = [
    { email: 'admin@sabercon.edu.br', password: 'admin123' },
    { email: 'admin@sabercon.com.br', password: 'admin123' },
    { email: 'estevao@programmer.net', password: 'admin123' }
  ];

  for (const cred of credentials) {
    try {
      logInfo(`Tentando login com ${cred.email}...`);
      
      const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: cred
      });

      if (response.status === 200 && response.data.success && response.data.token) {
        logSuccess(`Token obtido com sucesso usando ${cred.email}`);
        logInfo(`Token length: ${response.data.token.length}`);
        logInfo(`Token preview: ${response.data.token.substring(0, 20)}...`);
        return response.data.token;
      } else {
        logWarning(`Falha no login com ${cred.email}: ${response.status} - ${response.data.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      logWarning(`Erro na requisição para ${cred.email}: ${error.message}`);
    }
  }

  logError('Não foi possível obter token de nenhuma credencial');
  return null;
}

// Teste 2: Validar token com API
async function testValidateToken(token) {
  logInfo('Teste 2: Validando token com API...');
  
  if (!token) {
    logError('Nenhum token fornecido para validação');
    return false;
  }

  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200 && response.data.valid) {
      logSuccess('Token validado com sucesso');
      logInfo(`Usuário: ${response.data.user?.name || 'N/A'}`);
      logInfo(`Role: ${response.data.user?.role || 'N/A'}`);
      return true;
    } else {
      logError(`Falha na validação: ${response.status} - ${response.data.message || 'Token inválido'}`);
      return false;
    }
  } catch (error) {
    logError(`Erro na validação do token: ${error.message}`);
    return false;
  }
}

// Teste 3: Testar API protegida (settings)
async function testProtectedAPI(token) {
  logInfo('Teste 3: Testando API protegida (/api/settings)...');
  
  if (!token) {
    logError('Nenhum token fornecido para teste da API protegida');
    return false;
  }

  try {
    const response = await makeRequest(`${BASE_URL}/api/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      logSuccess('API /api/settings respondeu com sucesso');
      logInfo(`Dados recebidos: ${response.data.success ? 'Sucesso' : 'Fallback'}`);
      return true;
    } else {
      logError(`API /api/settings falhou: ${response.status}`);
      logError(`Resposta: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    logError(`Erro na API protegida: ${error.message}`);
    return false;
  }
}

// Teste 4: Verificar estrutura do token
function testTokenStructure(token) {
  logInfo('Teste 4: Verificando estrutura do token...');
  
  if (!token) {
    logError('Nenhum token fornecido para verificação de estrutura');
    return false;
  }

  // Verificar se é string "null"
  if (token === 'null' || token === 'undefined') {
    logError('Token é string "null" ou "undefined"');
    return false;
  }

  // Verificar tamanho
  if (token.length < 10) {
    logError(`Token muito curto: ${token.length} caracteres`);
    return false;
  }

  // Verificar se é JWT
  const parts = token.split('.');
  if (parts.length === 3) {
    try {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      logSuccess('Token é um JWT válido');
      logInfo(`Algoritmo: ${header.alg || 'N/A'}`);
      logInfo(`Tipo: ${header.typ || 'N/A'}`);
      logInfo(`Usuário: ${payload.userId || payload.sub || 'N/A'}`);
      logInfo(`Email: ${payload.email || 'N/A'}`);
      logInfo(`Role: ${payload.role || 'N/A'}`);
      
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const isExpired = payload.exp < Math.floor(Date.now() / 1000);
        logInfo(`Expira em: ${expDate.toISOString()}`);
        logInfo(`Expirado: ${isExpired ? 'Sim' : 'Não'}`);
        
        if (isExpired) {
          logWarning('Token JWT está expirado');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logError(`Erro ao decodificar JWT: ${error.message}`);
      return false;
    }
  } else {
    // Verificar se é base64
    try {
      const decoded = atob(token);
      const parsed = JSON.parse(decoded);
      
      if (parsed.userId && parsed.email) {
        logSuccess('Token é base64 válido');
        logInfo(`Usuário: ${parsed.userId}`);
        logInfo(`Email: ${parsed.email}`);
        logInfo(`Role: ${parsed.role || 'N/A'}`);
        return true;
      } else {
        logError('Token base64 não contém campos obrigatórios');
        return false;
      }
    } catch (error) {
      logError(`Token não é JWT nem base64 válido: ${error.message}`);
      return false;
    }
  }
}

// Teste 5: Testar ambiente local (se disponível)
async function testLocalEnvironment(token) {
  logInfo('Teste 5: Testando ambiente local...');
  
  if (!token) {
    logWarning('Nenhum token disponível para teste local');
    return false;
  }

  try {
    const response = await makeRequest(`${LOCAL_URL}/api/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      logSuccess('Ambiente local respondeu com sucesso');
      return true;
    } else {
      logWarning(`Ambiente local falhou: ${response.status}`);
      return false;
    }
  } catch (error) {
    logWarning(`Ambiente local não disponível: ${error.message}`);
    return false;
  }
}

// Função principal
async function runAuthValidationTests() {
  log('🧪 INICIANDO TESTES DE VALIDAÇÃO DE AUTENTICAÇÃO', 'cyan');
  log('=' .repeat(60), 'cyan');
  
  const results = {
    tokenObtained: false,
    tokenValid: false,
    tokenStructureValid: false,
    protectedAPIWorking: false,
    localEnvironmentWorking: false
  };

  try {
    // Teste 1: Obter token
    const token = await testGetAuthToken();
    results.tokenObtained = !!token;
    
    if (token) {
      // Teste 4: Verificar estrutura (antes da validação)
      results.tokenStructureValid = testTokenStructure(token);
      
      // Teste 2: Validar token
      results.tokenValid = await testValidateToken(token);
      
      // Teste 3: API protegida
      results.protectedAPIWorking = await testProtectedAPI(token);
      
      // Teste 5: Ambiente local
      results.localEnvironmentWorking = await testLocalEnvironment(token);
    }

    // Relatório final
    log('\n📊 RELATÓRIO FINAL', 'cyan');
    log('=' .repeat(60), 'cyan');
    
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅ PASSOU' : '❌ FALHOU';
      const color = passed ? 'green' : 'red';
      log(`${test.padEnd(25)}: ${status}`, color);
    });

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    const successRate = Math.round((passedTests / totalTests) * 100);

    log(`\nTaxa de sucesso: ${passedTests}/${totalTests} (${successRate}%)`, 
         successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');

    if (successRate >= 80) {
      logSuccess('Autenticação funcionando corretamente!');
    } else if (successRate >= 60) {
      logWarning('Autenticação com problemas menores');
    } else {
      logError('Autenticação com problemas graves');
    }

    // Recomendações
    log('\n💡 RECOMENDAÇÕES', 'cyan');
    log('=' .repeat(60), 'cyan');
    
    if (!results.tokenObtained) {
      log('• Verificar credenciais de login', 'yellow');
      log('• Verificar conectividade com o servidor', 'yellow');
    }
    
    if (!results.tokenStructureValid) {
      log('• Verificar se tokens não estão corrompidos', 'yellow');
      log('• Limpar storage e fazer novo login', 'yellow');
    }
    
    if (!results.protectedAPIWorking) {
      log('• Verificar middleware de autenticação no backend', 'yellow');
      log('• Verificar logs do servidor', 'yellow');
    }
    
    if (!results.localEnvironmentWorking) {
      log('• Iniciar ambiente de desenvolvimento local', 'yellow');
      log('• Verificar se portas estão corretas', 'yellow');
    }

  } catch (error) {
    logError(`Erro geral nos testes: ${error.message}`);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runAuthValidationTests().catch(console.log);
}

module.exports = {
  runAuthValidationTests,
  testGetAuthToken,
  testValidateToken,
  testProtectedAPI,
  testTokenStructure,
  testLocalEnvironment
};
