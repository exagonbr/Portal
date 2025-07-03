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
const crypto = require('crypto');

// Configurações
const CONFIG = {
  baseUrl: 'http://localhost:3001',
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

// Função para decodificar JWT token (sem verificação de assinatura)
function decodeJWT(token) {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    return {
      header,
      payload,
      signature: parts[2]
    };
  } catch (error) {
    log(`❌ Erro ao decodificar JWT: ${error.message}`, 'red');
    return null;
  }
}

// Função para extrair cookies de headers
function extractCookies(headers) {
  const cookies = {};
  const setCookieHeader = headers['set-cookie'];
  
  if (setCookieHeader) {
    setCookieHeader.forEach(cookie => {
      const parts = cookie.split(';')[0].split('=');
      if (parts.length === 2) {
        cookies[parts[0].trim()] = parts[1].trim();
      }
    });
  }
  
  return cookies;
}

// Função para exibir informações detalhadas da sessão
function displaySessionInfo(authData, response) {
  if (!authData || !authData.success) return;
  
  log('\n📋 INFORMAÇÕES DA SESSÃO:', 'bright');
  log('═'.repeat(60), 'blue');
  
  // Informações básicas do usuário
  if (authData.user) {
    log('👤 Dados do Usuário:', 'cyan');
    log(`  📧 Email: ${authData.user.email || 'N/A'}`, 'gray');
    log(`  🎭 Papel: ${authData.user.role || 'N/A'}`, 'gray');
    log(`  🏢 Instituição: ${authData.user.institutionId || 'N/A'}`, 'gray');
    log(`  🆔 ID: ${authData.user.id || 'N/A'}`, 'gray');
    log(`  📅 Criado em: ${authData.user.createdAt || 'N/A'}`, 'gray');
  }
  
  // Informações da sessão
  if (authData.sessionId) {
    log('\n🔐 Dados da Sessão:', 'cyan');
    log(`  🎫 Session ID: ${authData.sessionId}`, 'gray');
  }
  
  // Cookies recebidos
  if (response && response.headers) {
    const cookies = extractCookies(response.headers);
    if (Object.keys(cookies).length > 0) {
      log('\n🍪 Cookies Recebidos:', 'cyan');
      Object.entries(cookies).forEach(([name, value]) => {
        const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
        log(`  ${name}: ${displayValue}`, 'gray');
      });
    }
  }
  
  // Token decodificado
  if (authData.token) {
    log('\n🔑 Token de Acesso:', 'cyan');
    log(`  📝 Token (primeiros 50 chars): ${authData.token.substring(0, 50)}...`, 'gray');
    
    const decoded = decodeJWT(authData.token);
    if (decoded) {
      log('\n🔍 Token Decodificado:', 'cyan');
      log('  📋 Header:', 'yellow');
      Object.entries(decoded.header).forEach(([key, value]) => {
        log(`    ${key}: ${value}`, 'gray');
      });
      
      log('  📋 Payload:', 'yellow');
      Object.entries(decoded.payload).forEach(([key, value]) => {
        if (key === 'exp' || key === 'iat') {
          const date = new Date(value * 1000).toLocaleString('pt-BR');
          log(`    ${key}: ${value} (${date})`, 'gray');
        } else {
          const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
          const truncated = displayValue.length > 100 ? displayValue.substring(0, 100) + '...' : displayValue;
          log(`    ${key}: ${truncated}`, 'gray');
        }
      });
      
      // Verificar expiração
      if (decoded.payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = decoded.payload.exp - now;
        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / 60);
          const hours = Math.floor(minutes / 60);
          log(`  ⏰ Expira em: ${hours}h ${minutes % 60}m`, 'green');
        } else {
          log(`  ⚠️  Token expirado há ${Math.abs(timeLeft)} segundos`, 'red');
        }
      }
    }
  }
  
  // Refresh Token
  if (authData.refreshToken) {
    log('\n🔄 Refresh Token:', 'cyan');
    log(`  📝 Token (primeiros 30 chars): ${authData.refreshToken.substring(0, 30)}...`, 'gray');
    
    const decodedRefresh = decodeJWT(authData.refreshToken);
    if (decodedRefresh && decodedRefresh.payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = decodedRefresh.payload.exp - now;
      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (24 * 60 * 60));
        const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
        log(`  ⏰ Expira em: ${days}d ${hours}h`, 'green');
      } else {
        log(`  ⚠️  Refresh token expirado`, 'red');
      }
    }
  }
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
      
      const authData = {
        token: response.data.data?.accessToken, // Campo correto é accessToken
        refreshToken: response.data.data?.refreshToken,
        sessionId: response.data.data?.sessionId,
        user: response.data.data?.user,
        success: true
      };
      
      // Exibir informações detalhadas da sessão
      displaySessionInfo(authData, response);
      
      return authData;
    } else {
      log(`❌ Falha no login: ${response.data?.message || 'Erro desconhecido'}`, 'red');
      log(`📊 Status: ${response.status}`, 'red');
      if (response.data?.details) {
        log(`🔍 Detalhes: ${JSON.stringify(response.data.details)}`, 'gray');
      }
      
      // Registrar stacktrace se for erro 500
      if (response.status === 500) {
        log('\n💥 STACKTRACE DO ERRO 500:', 'red');
        log('═'.repeat(60), 'red');
        if (response.data?.stack) {
          log(response.data.stack, 'gray');
        } else if (response.raw) {
          log('📄 Resposta completa do servidor:', 'yellow');
          log(response.raw, 'gray');
        } else {
          log('❌ Nenhum stacktrace disponível na resposta', 'yellow');
        }
      }
      
      return { success: false };
    }
  } catch (error) {
    log(`❌ Erro ao fazer login: ${error.message}`, 'red');
    if (error.stack) {
      log('\n💥 STACKTRACE DO ERRO:', 'red');
      log(error.stack, 'gray');
    }
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
        'Content-Type': 'application/json'
      };
      
      // Usar múltiplos métodos de autenticação baseado na análise do auth-utils
      if (authToken && route.hasAuth) {
        // Método principal: Bearer Token no Authorization header
        headers['Authorization'] = `Bearer ${authToken}`;
        
        // Método alternativo: X-Auth-Token header
        headers['X-Auth-Token'] = authToken;
        
        // Cookies para fallback (baseado no login route)
        headers['Cookie'] = `auth_token=${authToken}; token=${authToken}; authToken=${authToken}`;
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
      
      const url = `${CONFIG.baseUrl}/api${testPath.startsWith('/') ? testPath : '/' + testPath}`;
      
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
      
      // Registrar stacktrace para erros 500
      if (response.status === 500) {
        log(`\n💥 ERRO 500 em ${method} ${url}:`, 'red');
        log('═'.repeat(80), 'red');
        
        if (response.data?.stack) {
          log('📋 Stacktrace do servidor:', 'yellow');
          log(response.data.stack, 'gray');
        } else if (response.data?.error) {
          log('📋 Erro do servidor:', 'yellow');
          log(JSON.stringify(response.data.error, null, 2), 'gray');
        } else if (response.raw) {
          log('📄 Resposta completa do servidor:', 'yellow');
          log(response.raw, 'gray');
        } else {
          log('❌ Nenhuma informação de erro disponível', 'yellow');
        }
        
        // Informações adicionais do erro
        if (response.data) {
          log('\n📊 Dados da resposta:', 'cyan');
          Object.entries(response.data).forEach(([key, value]) => {
            if (key !== 'stack') {
              const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
              log(`  ${key}: ${displayValue}`, 'gray');
            }
          });
        }
        
        log('═'.repeat(80), 'red');
      }
      
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
        dataSize: response.raw ? response.raw.length : 0,
        stackTrace: response.status === 500 ? (response.data?.stack || response.raw) : null
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Registrar stacktrace para erros de conexão
      log(`\n💥 ERRO DE CONEXÃO em ${method} ${route.path}:`, 'red');
      log('═'.repeat(80), 'red');
      log(`📋 Mensagem: ${error.message}`, 'yellow');
      if (error.stack) {
        log('📋 Stacktrace:', 'yellow');
        log(error.stack, 'gray');
      }
      log('═'.repeat(80), 'red');
      
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
        dataSize: 0,
        stackTrace: error.stack
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
  // Se requer autenticação mas não tem, 401 é esperado mas não é sucesso
  if (requiresAuth && !hasAuth && status === 401) {
    return false; // Falha esperada por falta de auth
  }
  
  // Se tem autenticação mas ainda retorna 401, pode ser token inválido
  if (requiresAuth && hasAuth && status === 401) {
    return false; // Falha de autenticação mesmo com token
  }
  
  // 404 pode ser esperado para rotas dinâmicas com IDs de teste
  if (status === 404) {
    return false; // Não encontrado - pode ser esperado para alguns testes
  }
  
  // 405 Method Not Allowed é falha real
  if (status === 405) {
    return false;
  }
  
  // Status de sucesso por método HTTP
  const successStatuses = {
    'GET': [200, 304], // OK, Not Modified
    'POST': [200, 201], // OK, Created
    'PUT': [200, 204], // OK, No Content
    'PATCH': [200, 204], // OK, No Content
    'DELETE': [200, 204], // OK, No Content
    'OPTIONS': [200, 204], // OK, No Content
    'HEAD': [200, 204] // OK, No Content
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

// Função para testar diferentes métodos de autenticação em uma rota específica
async function testAuthMethods(route, authData) {
  if (!route.hasAuth || !authData.token) {
    return [];
  }
  
  const authMethods = [
    {
      name: 'Bearer Token',
      headers: { 'Authorization': `Bearer ${authData.token}` }
    },
    {
      name: 'X-Auth-Token',
      headers: { 'X-Auth-Token': authData.token }
    },
    {
      name: 'Cookie auth_token',
      headers: { 'Cookie': `auth_token=${authData.token}` }
    },
    {
      name: 'Cookie token',
      headers: { 'Cookie': `token=${authData.token}` }
    }
  ];
  
  const results = [];
  
  for (const authMethod of authMethods) {
    try {
      const testPath = route.path.replace(/:\w+/g, '1').replace('/*', '/test');
      const url = `${CONFIG.baseUrl}/api${testPath.startsWith('/') ? testPath : '/' + testPath}`;
      
      const response = await makeRequest(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...authMethod.headers
        }
      });
      
      results.push({
        method: authMethod.name,
        status: response.status,
        success: response.status >= 200 && response.status < 300,
        message: response.data?.message || getStatusMessage(response.status)
      });
      
    } catch (error) {
      results.push({
        method: authMethod.name,
        status: 0,
        success: false,
        message: error.message
      });
    }
    
    // Pequeno delay entre testes
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

// Função principal
async function main() {
  log('🚀 Iniciando mapeamento completo de rotas de API...', 'bright');
  log(`📍 Base URL: ${CONFIG.baseUrl}`, 'blue');
  log(`👤 Usuário: ${CONFIG.credentials.email}`, 'blue');
  log(`⏱️  Timeout: ${CONFIG.timeout}ms`, 'gray');
  log(`⏳ Delay entre requisições: ${CONFIG.delay}ms`, 'gray');
  
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
  
  // Se login foi bem-sucedido, testar métodos de autenticação
  if (auth.success && auth.token) {
    log('\n🔐 Testando métodos de autenticação...', 'cyan');
    
    // Encontrar uma rota que requer autenticação para testar
    const authRoute = routes.find(r => r.hasAuth && r.methods.includes('GET'));
    
    if (authRoute) {
      log(`📍 Testando autenticação na rota: ${authRoute.path}`, 'gray');
      const authResults = await testAuthMethods(authRoute, auth);
      
      if (authResults.length > 0) {
        log('📊 Resultados dos métodos de autenticação:', 'cyan');
        authResults.forEach(result => {
          const statusColor = result.success ? 'green' : 'red';
          const statusIcon = result.success ? '✅' : '❌';
          log(`  ${statusIcon} ${result.method.padEnd(20)} - ${result.status} ${result.message}`, statusColor);
        });
        
        const successfulMethods = authResults.filter(r => r.success);
        log(`\n🎯 Métodos de autenticação funcionais: ${successfulMethods.length}/${authResults.length}`,
            successfulMethods.length > 0 ? 'green' : 'red');
        
        if (successfulMethods.length > 0) {
          log('✅ Métodos funcionais:', 'green');
          successfulMethods.forEach(method => {
            log(`  • ${method.method}`, 'green');
          });
        }
      }
    } else {
      log('⚠️  Nenhuma rota GET com autenticação encontrada para teste', 'yellow');
    }
  }
  
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
    log('\n❌ ROTAS COM FALHA (Detalhadas):', 'red');
    failedRoutes.slice(0, 15).forEach(route => {
      const failedTests = route.tests.filter(t => !t.success);
      if (failedTests.length > 0) {
        log(`  📍 ${route.path} ${route.hasAuth ? '🔒' : '🔓'}:`, 'yellow');
        failedTests.forEach(test => {
          const statusColor = test.status === 401 ? 'yellow' : test.status === 404 ? 'magenta' : 'red';
          const authInfo = test.authUsed ? ' [AUTH]' : '';
          log(`    ${test.method.padEnd(6)} ➜ ${test.status} ${test.statusText}${authInfo} (${test.responseTime}ms)`, statusColor);
          if (test.message && test.message !== test.statusText) {
            log(`      💬 ${test.message}`, 'gray');
          }
          // Mostrar stacktrace resumido para erros 500
          if (test.status === 500 && test.stackTrace) {
            const firstLine = test.stackTrace.split('\n')[0];
            log(`      🔍 ${firstLine}`, 'gray');
          }
        });
      }
    });
    if (failedRoutes.length > 15) {
      log(`  ... e mais ${failedRoutes.length - 15} rotas com falha`, 'gray');
    }
  }
  
  // Mostrar rotas que precisam de autenticação
  const authRoutes = report.routes.filter(r => r.hasAuth);
  if (authRoutes.length > 0) {
    log('\n🔐 ROTAS QUE REQUEREM AUTENTICAÇÃO:', 'magenta');
    log(`📊 Total: ${authRoutes.length} rotas`, 'cyan');
    
    const authSuccessful = authRoutes.filter(r => r.tests.some(t => t.success && t.authUsed));
    const authFailed = authRoutes.filter(r => r.tests.every(t => !t.success));
    
    log(`✅ Com autenticação funcionando: ${authSuccessful.length}`, 'green');
    log(`❌ Com falha de autenticação: ${authFailed.length}`, 'red');
    
    // Mostrar estatísticas de autenticação
    if (auth.success && auth.token) {
      const authStats = {
        bearer: authRoutes.filter(r => r.tests.some(t => t.success && t.authUsed)).length,
        total: authRoutes.length
      };
      
      const authSuccessRate = authStats.total > 0
        ? ((authStats.bearer / authStats.total) * 100).toFixed(1)
        : '0';
      
      log(`🔑 Taxa de sucesso com Bearer Token: ${authSuccessRate}%`,
          authSuccessRate === '100.0' ? 'green' : authSuccessRate > '50.0' ? 'yellow' : 'red');
    }
    
    if (authFailed.length > 0 && authFailed.length <= 10) {
      log('\n🔒 Rotas com falha de autenticação:', 'yellow');
      authFailed.forEach(route => {
        const authTests = route.tests.filter(t => t.status === 401);
        if (authTests.length > 0) {
          log(`  ${route.path} - ${authTests.map(t => t.method).join(', ')}`, 'red');
        }
      });
    }
  }
  
  // Mostrar dicas e recomendações
  if (report.summary.failed > 0 || !auth.success) {
    log('\n💡 DICAS E RECOMENDAÇÕES:', 'bright');
    log('═'.repeat(50), 'blue');
    
    if (!auth.success) {
      log('🔐 Problema de Autenticação:', 'yellow');
      log('  • Verifique as credenciais no CONFIG', 'gray');
      log('  • Confirme se o servidor está rodando', 'gray');
      log('  • Teste o endpoint /api/auth/login manualmente', 'gray');
    }
    
    if (report.summary.byStatus[401] > 0) {
      log('🚫 Muitos erros 401 (Unauthorized):', 'yellow');
      log('  • Token pode estar expirado', 'gray');
      log('  • Verifique se o JWT_SECRET está configurado', 'gray');
      log('  • Confirme se as rotas realmente precisam de auth', 'gray');
    }
    
    if (report.summary.byStatus[404] > 0) {
      log('🔍 Muitos erros 404 (Not Found):', 'yellow');
      log('  • IDs de teste podem não existir no banco', 'gray');
      log('  • Algumas rotas podem estar desabilitadas', 'gray');
      log('  • Verifique se o servidor backend está rodando', 'gray');
    }
    
    if (report.summary.byStatus[500] > 0) {
      log('💥 Erros 500 (Internal Server Error):', 'red');
      log('  • Verifique os logs do servidor', 'gray');
      log('  • Pode haver problemas de configuração', 'gray');
      log('  • Banco de dados pode estar inacessível', 'gray');
    }
  }
  
  log('\n🎉 Mapeamento completo concluído!', 'bright');
  log(`📋 Total de ${report.totalRoutes} rotas mapeadas e testadas`, 'cyan');
  log(`🔧 Para executar novamente: node ${__filename}`, 'gray');
}

// Executar script
if (require.main === module) {
  main().catch(error => {
    log(`💥 Erro fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  discoverRoutes,
  analyzeRouteFile,
  makeRequest,
  authenticate,
  testRoute,
  determineSuccess,
  getTestBodyForRoute,
  getStatusMessage,
  decodeJWT,
  extractCookies,
  displaySessionInfo
};