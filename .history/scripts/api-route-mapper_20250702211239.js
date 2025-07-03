#!/usr/bin/env node

/**
 * Script para mapear e testar todas as rotas de API
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
  timeout: 10000,
  maxRetries: 3
};

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Função para log colorido
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
        // Verificar se é um diretório de rota dinâmica
        if (item.name.startsWith('[') && item.name.endsWith(']')) {
          const paramName = item.name.slice(1, -1);
          const dynamicPath = routePath.replace(`[${paramName}]`, `:${paramName}`);
          routes.push(...discoverRoutes(fullPath, dynamicPath));
        } else if (item.name === '...slug') {
          // Rota catch-all
          routes.push(...discoverRoutes(fullPath, basePath + '/*'));
        } else {
          routes.push(...discoverRoutes(fullPath, routePath));
        }
      } else if (item.name === 'route.ts' || item.name === 'route.js') {
        // Encontrou um arquivo de rota
        const routeInfo = analyzeRouteFile(fullPath);
        routes.push({
          path: basePath.replace(/\\/g, '/') || '/',
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
    
    // Detectar métodos HTTP exportados
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    for (const method of httpMethods) {
      if (content.includes(`export async function ${method}`) || 
          content.includes(`export function ${method}`)) {
        methods.push(method);
      }
    }
    
    // Detectar se usa autenticação
    hasAuth = content.includes('auth') || 
              content.includes('token') || 
              content.includes('jwt') ||
              content.includes('session') ||
              content.includes('Authorization');
    
    // Tentar extrair descrição dos comentários
    const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    if (commentMatch) {
      description = commentMatch[1]
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

// Função para fazer login e obter token
async function authenticate() {
  log('\n🔐 Fazendo login...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/auth/login`, {
      method: 'POST',
      body: CONFIG.credentials
    });
    
    if (response.status === 200 && response.data.success) {
      log('✅ Login realizado com sucesso!', 'green');
      return {
        token: response.data.data.token,
        refreshToken: response.data.data.refreshToken,
        user: response.data.data.user
      };
    } else {
      log(`❌ Falha no login: ${response.data.message || 'Erro desconhecido'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Erro ao fazer login: ${error.message}`, 'red');
    return null;
  }
}

// Função para testar uma rota
async function testRoute(route, authToken = null) {
  const results = [];
  
  for (const method of route.methods) {
    try {
      const headers = {};
      if (authToken && route.hasAuth) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Para rotas dinâmicas, usar valores de exemplo
      let testPath = route.path;
      if (testPath.includes(':')) {
        testPath = testPath
          .replace(/:id/g, '1')
          .replace(/:userId/g, '1')
          .replace(/:roleId/g, '1')
          .replace(/:videoId/g, '1')
          .replace(/:\w+/g, 'test');
      }
      
      const url = `${CONFIG.baseUrl}/api${testPath}`;
      const response = await makeRequest(url, {
        method,
        headers
      });
      
      results.push({
        method,
        status: response.status,
        success: response.status < 400,
        message: response.data?.message || 'OK',
        hasData: !!response.data,
        responseTime: Date.now()
      });
      
    } catch (error) {
      results.push({
        method,
        status: 0,
        success: false,
        message: error.message,
        hasData: false,
        responseTime: Date.now()
      });
    }
  }
  
  return results;
}

// Função principal
async function main() {
  log('🚀 Iniciando mapeamento de rotas de API...', 'bright');
  log(`📍 Base URL: ${CONFIG.baseUrl}`, 'blue');
  
  // Descobrir todas as rotas
  log('\n📂 Descobrindo rotas...', 'cyan');
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
  
  if (!fs.existsSync(apiDir)) {
    log('❌ Diretório de API não encontrado!', 'red');
    process.exit(1);
  }
  
  const routes = discoverRoutes(apiDir);
  log(`✅ Encontradas ${routes.length} rotas`, 'green');
  
  // Fazer autenticação
  const auth = await authenticate();
  
  // Criar relatório
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: CONFIG.baseUrl,
    totalRoutes: routes.length,
    authSuccess: !!auth,
    routes: [],
    summary: {
      total: 0,
      success: 0,
      failed: 0,
      authRequired: 0
    }
  };
  
  // Testar cada rota
  log('\n🧪 Testando rotas...', 'cyan');
  
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const progress = `[${i + 1}/${routes.length}]`;
    
    log(`${progress} Testando ${route.path}...`, 'yellow');
    
    const testResults = await testRoute(route, auth?.token);
    
    const routeReport = {
      path: route.path,
      file: route.file,
      methods: route.methods,
      hasAuth: route.hasAuth,
      description: route.description,
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
      if (route.hasAuth) {
        report.summary.authRequired++;
      }
    }
    
    // Mostrar resultado resumido
    const successCount = testResults.filter(t => t.success).length;
    const totalTests = testResults.length;
    const status = successCount === totalTests ? '✅' : successCount > 0 ? '⚠️' : '❌';
    
    log(`  ${status} ${successCount}/${totalTests} métodos OK`, 
        successCount === totalTests ? 'green' : successCount > 0 ? 'yellow' : 'red');
  }
  
  // Salvar relatório
  const reportPath = path.join(process.cwd(), 'api-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Mostrar resumo final
  log('\n📊 RESUMO FINAL', 'bright');
  log('═'.repeat(50), 'blue');
  log(`📍 Base URL: ${CONFIG.baseUrl}`, 'blue');
  log(`🔐 Autenticação: ${auth ? '✅ Sucesso' : '❌ Falhou'}`, auth ? 'green' : 'red');
  log(`📂 Total de rotas: ${report.totalRoutes}`, 'cyan');
  log(`🧪 Total de testes: ${report.summary.total}`, 'cyan');
  log(`✅ Sucessos: ${report.summary.success}`, 'green');
  log(`❌ Falhas: ${report.summary.failed}`, 'red');
  log(`🔒 Requer autenticação: ${report.summary.authRequired}`, 'magenta');
  log(`📄 Relatório salvo em: ${reportPath}`, 'blue');
  
  // Mostrar rotas com falha
  if (report.summary.failed > 0) {
    log('\n❌ ROTAS COM FALHA:', 'red');
    for (const route of report.routes) {
      const failedTests = route.tests.filter(t => !t.success);
      if (failedTests.length > 0) {
        log(`  ${route.path}:`, 'yellow');
        for (const test of failedTests) {
          log(`    ${test.method}: ${test.message}`, 'red');
        }
      }
    }
  }
  
  log('\n🎉 Mapeamento concluído!', 'bright');
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