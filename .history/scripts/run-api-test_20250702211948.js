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
      const headers = {};
      
      if (authToken && route.hasAuth) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      let testPath = route.path;
      if (testPath.includes(':')) {
        testPath = testPath
          .replace(/:id/g, '1')
          .replace(/:userId/g, '1')
          .replace(/:roleId/g, '1')
          .replace(/:videoId/g, '1')
          .replace(/:\w+/g, 'test');
      }
      
      testPath = testPath.replace('/*', '/test');
      
      const url = `${CONFIG.baseUrl}/api${testPath}`;
      
      const requestOptions = {
        method,
        headers
      };
      
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        requestOptions.body = { test: true };
      }
      
      const response = await makeRequest(url, requestOptions);
      const responseTime = Date.now() - startTime;
      
      results.push({
        method,
        status: response.status,
        success: response.status < 400,
        message: response.data?.message || getStatusMessage(response.status),
        hasData: !!response.data,
        responseTime
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      results.push({
        method,
        status: 0,
        success: false,
        message: error.message,
        hasData: false,
        responseTime,
        error: error.message
      });
    }
    
    if (CONFIG.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delay));
    }
  }
  
  return results;
}

function getStatusMessage(status) {
  const statusMessages = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    500: 'Internal Server Error'
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
    
    // Mostrar resultado resumido
    const successCount = testResults.filter(t => t.success).length;
    const totalTests = testResults.length;
    const status = successCount === totalTests ? '✅' : successCount > 0 ? '⚠️' : '❌';
    const avgTime = Math.round(testResults.reduce((sum, t) => sum + t.responseTime, 0) / totalTests);
    
    log(`      ${status} ${successCount}/${totalTests} OK (${avgTime}ms avg)`, 
        successCount === totalTests ? 'green' : successCount > 0 ? 'yellow' : 'red');
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
