#!/usr/bin/env node

/**
 * Script final para mapear e testar todas as rotas de API
 * Versão simplificada e funcional
 * Autor: Kilo Code
 * Data: 2025-01-07
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configurações
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  credentials: {
    email: 'admin@sabercon.edu.br',
    password: 'password123'
  },
  timeout: 15000,
  delay: 200
};

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Route-Mapper/1.0',
        ...options.headers
      },
      timeout: CONFIG.timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            raw: data
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data,
            parseError: error.message
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

// Função para descobrir rotas recursivamente
function discoverRoutes(dir, basePath = '') {
  const routes = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const routePath = path.join(basePath, item.name);
      
      if (item.isDirectory()) {
        if (item.name.startsWith('[') && item.name.endsWith(']')) {
          const paramName = item.name.slice(1, -1);
          let dynamicPath;
          
          if (paramName.startsWith('...')) {
            dynamicPath = routePath.replace(`[${paramName}]`, '*');
          } else {
            dynamicPath = routePath.replace(`[${paramName}]`, `:${paramName}`);
          }
          
          routes.push(...discoverRoutes(fullPath, dynamicPath));
        } else {
          routes.push(...discoverRoutes(fullPath, routePath));
        }
      } else if (item.name === 'route.ts' || item.name === 'route.js') {
        const routeInfo = analyzeRouteFile(fullPath);
        const cleanPath = basePath.replace(/\\/g, '/') || '/';
        
        routes.push({
          path: cleanPath,
          file: fullPath,
          methods: routeInfo.methods,
          hasAuth: routeInfo.hasAuth,
          description: routeInfo.description
        });
      }
    }
  } catch (error) {
    log(`Erro ao ler diretório ${dir}: ${error.message}`, 'red');
  }
  
  return routes;
}

// Função para analisar arquivo de rota
function analyzeRouteFile(filePath) {
  const methods = [];
  let hasAuth = false;
  let description = '';
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
    for (const method of httpMethods) {
      if (content.includes(`export async function ${method}`) || 
          content.includes(`export function ${method}`)) {
        methods.push(method);
      }
    }
    
    const authKeywords = [
      'auth', 'token', 'jwt', 'session', 'Authorization',
      'Bearer', 'authenticate', 'validateToken', 'checkAuth'
    ];
    
    hasAuth = authKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const commentMatches = content.match(/\/\*\*([\s\S]*?)\*\//g);
    if (commentMatches && commentMatches.length > 0) {
      description = commentMatches[0]
        .replace(/\/\*\*|\*\//g, '')
        .replace(/\*/g, '')
        .replace(/\n/g, ' ')
        .trim()
        .substring(0, 100);
    }
    
  } catch (error) {
    log(`Erro ao analisar arquivo ${filePath}: ${error.message}`, 'yellow');
  }
  
  return { methods, hasAuth, description };
}

// Função para fazer login
async function authenticate() {
  log('\n🔐 Fazendo login...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/auth/login`, {
      method: 'POST',
      body: CONFIG.credentials
    });
    
    if (response.status === 200 && response.data?.success) {
      log('✅ Login realizado com sucesso!', 'green');
      log(`👤 Usuário: ${response.data.data?.user?.email || 'N/A'}`, 'gray');
      log(`🎭 Papel: ${response.data.data?.user?.role || 'N/A'}`, 'gray');
      
      return {
        token: response.data.data?.token,
        refreshToken: response.data.data?.refreshToken,
        user: response.data.data?.user,
        success: true
      };
    } else {
      log(`❌ Falha no login: ${response.data?.message || 'Erro desconhecido'}`, 'red');
      log(`📊 Status: ${response.status}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log(`❌ Erro ao fazer login: ${error.message}`, 'red');
    return { success: false };
  }
}

// Função para testar uma rota
async function testRoute(route, authToken) {
  const results = [];
  
  for (const method of route.methods) {
    const startTime = Date.now();
    
    try {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      // Sempre usar autenticação se disponível e a rota requer
      if (authToken && route.hasAuth) {
        headers['Authorization'] = `Bearer ${authToken}`;
        headers['Cookie'] = `token=${authToken}`;
      }
      
      let testPath = route.path;
      if (testPath.includes(':')) {
        testPath = testPath
          .replace(/:id/g, '1')
          .replace(/:userId/g, '1')
          .replace(/:roleId/g, '1')
          .replace(/:videoId/g, '1')
          .replace(/:bookId/g, '1')
          .replace(/:courseId/g, '1')
          .replace(/:classId/g, '1')
          .replace(/:assignmentId/g, '1')
          .replace(/:\w+/g, 'test');
      }
      
      testPath = testPath.replace('/*', '/test');
      
      const url = `${CONFIG.baseUrl}/api${testPath}`;
      
      const requestOptions = {
        method,
        headers
      };
      
      // Adicionar body para métodos que precisam
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        requestOptions.body = getTestBodyForRoute(route.path, method);
      }
      
      const response = await makeRequest(url, requestOptions);
      const responseTime = Date.now() - startTime;
      
      // Determinar se foi sucesso baseado no status e contexto
      const isSuccess = determineSuccess(response.status, method, route.hasAuth, !!authToken);
      
      results.push({
        method,
        status: response.status,
        statusText: getStatusMessage(response.status),
        success: isSuccess,
        message: response.data?.message || response.data?.error || getStatusMessage(response.status),
        hasData: !!response.data,
        responseTime,
        authUsed: route.hasAuth && !!authToken,
        url: url,
        dataSize: response.raw ? response.raw.length : 0
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      results.push({
        method,
        status: 0,
        statusText: 'Connection Error',
        success: false,
        message: error.message,
        hasData: false,
        responseTime,
        authUsed: route.hasAuth && !!authToken,
        url: `${CONFIG.baseUrl}/api${route.path}`,
        error: error.message,
        dataSize: 0
      });
    }
    
    if (CONFIG.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delay));
    }
  }
  
  return results;
}

// Função para determinar se a resposta foi bem-sucedida
function determineSuccess(status, method, requiresAuth, hasAuth) {
  // Se requer autenticação mas não tem, 401 é esperado
  if (requiresAuth && !hasAuth && status === 401) {
    return false; // Falha esperada
  }
  
  // Status de sucesso por método
  const successStatuses = {
    'GET': [200, 304],
    'POST': [200, 201],
    'PUT': [200, 204],
    'PATCH': [200, 204],
    'DELETE': [200, 204],
    'OPTIONS': [200, 204],
    'HEAD': [200, 204]
  };
  
  const validStatuses = successStatuses[method] || [200];
  return validStatuses.includes(status) || (status >= 200 && status < 300);
}

// Função para gerar body de teste baseado na rota
function getTestBodyForRoute(routePath, method) {
  const basePath = routePath.split('/')[1] || '';
  
  // Bodies específicos por tipo de rota
  const testBodies = {
    'auth': {
      email: CONFIG.credentials.email,
      password: CONFIG.credentials.password
    },
    'users': {
      name: 'Test User',
      email: 'test@example.com',
      role: 'STUDENT'
    },
    'courses': {
      title: 'Test Course',
      description: 'Test Description'
    },
    'assignments': {
      title: 'Test Assignment',
      description: 'Test Description',
      dueDate: new Date().toISOString()
    },
    'books': {
      title: 'Test Book',
      author: 'Test Author'
    },
    'activity': {
      type: 'VIEW',
      resourceId: '1',
      duration: 100
    }
  };
  
  return testBodies[basePath] || { test: true, timestamp: Date.now() };
}

function getStatusMessage(status) {
  const statusMessages = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };
  
  return statusMessages[status] || `Status ${status}`;
}

// Função principal
async function main() {
  log('🚀 Iniciando mapeamento completo de rotas de API...', 'bright');
  log(`📍 Base URL: ${CONFIG.baseUrl}`, 'blue');
  log(`👤 Usuário: ${CONFIG.credentials.email}`, 'blue');
  
  // Descobrir todas as rotas
  log('\n📂 Descobrindo rotas...', 'cyan');
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  
  if (!fs.existsSync(apiDir)) {
    log('❌ Diretório de API não encontrado!', 'red');
    log(`📁 Procurando em: ${apiDir}`, 'gray');
    process.exit(1);
  }
  
  const routes = discoverRoutes(apiDir);
  log(`✅ Encontradas ${routes.length} rotas`, 'green');
  
  if (routes.length > 0) {
    log('\n📋 Primeiras rotas encontradas:', 'gray');
    routes.slice(0, 10).forEach(route => {
      log(`  ${route.path} [${route.methods.join(', ')}]${route.hasAuth ? ' 🔒' : ''}`, 'gray');
    });
    if (routes.length > 10) {
      log(`  ... e mais ${routes.length - 10} rotas`, 'gray');
    }
  }
  
  // Fazer autenticação
  const auth = await authenticate();
  
  // Criar relatório
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: CONFIG.baseUrl,
    totalRoutes: routes.length,
    authSuccess: auth.success,
    routes: [],
    summary: {
      total: 0,
      success: 0,
      failed: 0,
      authRequired: 0,
      byStatus: {}
    }
  };
  
  // Testar cada rota
  log('\n🧪 Testando rotas...', 'cyan');
  log('═'.repeat(80), 'blue');
  
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const progress = `[${String(i + 1).padStart(3)}/${routes.length}]`;
    
    log(`${progress} ${route.path}`, 'yellow');
    
    const testResults = await testRoute(route, auth.token);
    
    const routeReport = {
      ...route,
      tests: testResults
    };
    
    report.routes.push(routeReport);
    
    // Atualizar estatísticas
    for (const test of testResults) {
      report.summary.total++;
      if (test.success) {
        report.summary.success++;
      } else {
        report.summary.failed++;
      }
      
      report.summary.byStatus[test.status] = (report.summary.byStatus[test.status] || 0) + 1;
    }
    
    if (route.hasAuth) {
      report.summary.authRequired++;
    }
    
    // Mostrar resultado detalhado com status codes
    const successCount = testResults.filter(t => t.success).length;
    const totalTests = testResults.length;
    const status = successCount === totalTests ? '✅' : successCount > 0 ? '⚠️' : '❌';
    const avgTime = Math.round(testResults.reduce((sum, t) => sum + t.responseTime, 0) / totalTests);
    
    log(`      ${status} ${successCount}/${totalTests} OK (${avgTime}ms avg)`,
        successCount === totalTests ? 'green' : successCount > 0 ? 'yellow' : 'red');
    
    // Mostrar detalhes de cada método testado
    testResults.forEach(test => {
      const statusColor = test.status >= 200 && test.status < 300 ? 'green' :
                         test.status >= 300 && test.status < 400 ? 'yellow' : 'red';
      const authIcon = test.authUsed ? '🔒' : '🔓';
      const statusDisplay = test.status === 0 ? 'ERR' : test.status;
      
      log(`        ${test.method.padEnd(6)} ${authIcon} ${statusDisplay} ${test.statusText} (${test.responseTime}ms)`, statusColor);
    });
  }
  
  // Salvar relatório
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const reportDir = path.join(process.cwd(), 'reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const jsonReportPath = path.join(reportDir, `api-test-report-${timestamp}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  
  // Mostrar resumo final
  log('\n📊 RESUMO FINAL', 'bright');
  log('═'.repeat(80), 'blue');
  log(`📍 Base URL: ${CONFIG.baseUrl}`, 'blue');
  log(`🔐 Autenticação: ${auth.success ? '✅ Sucesso' : '❌ Falhou'}`, auth.success ? 'green' : 'red');
  log(`📂 Total de rotas: ${report.totalRoutes}`, 'cyan');
  log(`🧪 Total de testes: ${report.summary.total}`, 'cyan');
  log(`✅ Sucessos: ${report.summary.success}`, 'green');
  log(`❌ Falhas: ${report.summary.failed}`, 'red');
  log(`🔒 Requer autenticação: ${report.summary.authRequired}`, 'magenta');
  
  const successRate = report.summary.total > 0 
    ? ((report.summary.success / report.summary.total) * 100).toFixed(1)
    : '0';
  log(`📈 Taxa de sucesso: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
  
  log(`\n📄 Relatório JSON salvo: ${jsonReportPath}`, 'blue');
  
  // Mostrar distribuição por status
  if (Object.keys(report.summary.byStatus).length > 0) {
    log('\n📊 Distribuição por Status HTTP:', 'cyan');
    Object.entries(report.summary.byStatus)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([status, count]) => {
        const statusNum = parseInt(status);
        const color = statusNum < 300 ? 'green' : statusNum < 400 ? 'yellow' : 'red';
        log(`  ${status}: ${count} (${getStatusMessage(statusNum)})`, color);
      });
  }
  
  // Mostrar algumas rotas com falha
  const failedRoutes = report.routes.filter(r => r.tests.some(t => !t.success));
  if (failedRoutes.length > 0) {
    log('\n❌ ALGUMAS ROTAS COM FALHA:', 'red');
    failedRoutes.slice(0, 10).forEach(route => {
      const failedTests = route.tests.filter(t => !t.success);
      if (failedTests.length > 0) {
        log(`  ${route.path}:`, 'yellow');
        failedTests.slice(0, 2).forEach(test => {
          log(`    ${test.method}: ${test.message} (${test.status})`, 'red');
        });
      }
    });
    if (failedRoutes.length > 10) {
      log(`  ... e mais ${failedRoutes.length - 10} rotas com falha`, 'gray');
    }
  }
  
  log('\n🎉 Mapeamento completo concluído!', 'bright');
  log(`📋 Total de ${report.totalRoutes} rotas mapeadas e testadas`, 'cyan');
}

// Executar script
if (require.main === module) {
  main().catch(error => {
    log(`💥 Erro fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { discoverRoutes, analyzeRouteFile, makeRequest, authenticate, testRoute };