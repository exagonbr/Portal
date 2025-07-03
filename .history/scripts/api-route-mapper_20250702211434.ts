#!/usr/bin/env tsx

/**
 * Script TypeScript para mapear e testar todas as rotas de API
 * Versão integrada com Next.js
 * Autor: Kilo Code
 * Data: 2025-01-07
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Tipos
interface RouteInfo {
  path: string;
  file: string;
  methods: string[];
  hasAuth: boolean;
  description: string;
  params?: string[];
}

interface TestResult {
  method: string;
  status: number;
  success: boolean;
  message: string;
  hasData: boolean;
  responseTime: number;
  error?: string;
}

interface AuthResult {
  token?: string;
  refreshToken?: string;
  user?: any;
  success: boolean;
}

interface ApiTestReport {
  timestamp: string;
  baseUrl: string;
  totalRoutes: number;
  authSuccess: boolean;
  routes: RouteTestResult[];
  summary: {
    total: number;
    success: number;
    failed: number;
    authRequired: number;
    byStatus: Record<number, number>;
  };
}

interface RouteTestResult extends RouteInfo {
  tests: TestResult[];
}

// Configurações
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  credentials: {
    email: 'admin@sabercon.edu.br',
    password: 'password123'
  },
  timeout: 15000,
  maxRetries: 3,
  delay: 100, // delay entre requests em ms
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

// Função para log colorido
function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisições HTTP com fetch
async function makeRequest(url: string, options: RequestInit = {}): Promise<{
  status: number;
  headers: Headers;
  data: any;
  raw: string;
  parseError?: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Route-Mapper-TS/1.0',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    const raw = await response.text();
    let data: any = null;
    let parseError: string | undefined;

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (error) {
      parseError = error instanceof Error ? error.message : 'Parse error';
    }

    return {
      status: response.status,
      headers: response.headers,
      data,
      raw,
      parseError,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Função para descobrir rotas recursivamente
function discoverRoutes(dir: string, basePath: string = ''): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const routePath = path.join(basePath, item.name);
      
      if (item.isDirectory()) {
        // Verificar se é um diretório de rota dinâmica
        if (item.name.startsWith('[') && item.name.endsWith(']')) {
          const paramName = item.name.slice(1, -1);
          let dynamicPath: string;
          
          if (paramName.startsWith('...')) {
            // Catch-all route
            dynamicPath = routePath.replace(`[${paramName}]`, '*');
          } else {
            // Dynamic route
            dynamicPath = routePath.replace(`[${paramName}]`, `:${paramName}`);
          }
          
          routes.push(...discoverRoutes(fullPath, dynamicPath));
        } else {
          routes.push(...discoverRoutes(fullPath, routePath));
        }
      } else if (item.name === 'route.ts' || item.name === 'route.js') {
        // Encontrou um arquivo de rota
        const routeInfo = analyzeRouteFile(fullPath);
        const cleanPath = basePath.replace(/\\/g, '/') || '/';
        
        routes.push({
          path: cleanPath,
          file: fullPath,
          methods: routeInfo.methods,
          hasAuth: routeInfo.hasAuth,
          description: routeInfo.description,
          params: extractParams(cleanPath),
        });
      }
    }
  } catch (error) {
    log(`Erro ao ler diretório ${dir}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'red');
  }
  
  return routes;
}

// Função para extrair parâmetros da rota
function extractParams(routePath: string): string[] {
  const params: string[] = [];
  const matches = routePath.match(/:(\w+)/g);
  if (matches) {
    params.push(...matches.map(match => match.substring(1)));
  }
  return params;
}

// Função para analisar arquivo de rota
function analyzeRouteFile(filePath: string): {
  methods: string[];
  hasAuth: boolean;
  description: string;
} {
  const methods: string[] = [];
  let hasAuth = false;
  let description = '';
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Detectar métodos HTTP exportados
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
    for (const method of httpMethods) {
      if (content.includes(`export async function ${method}`) || 
          content.includes(`export function ${method}`)) {
        methods.push(method);
      }
    }
    
    // Detectar se usa autenticação
    const authKeywords = [
      'auth', 'token', 'jwt', 'session', 'Authorization',
      'Bearer', 'authenticate', 'validateToken', 'checkAuth'
    ];
    
    hasAuth = authKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Tentar extrair descrição dos comentários
    const commentMatches = content.match(/\/\*\*([\s\S]*?)\*\//g);
    if (commentMatches && commentMatches.length > 0) {
      description = commentMatches[0]
        .replace(/\/\*\*|\*\//g, '')
        .replace(/\*/g, '')
        .replace(/\n/g, ' ')
        .trim()
        .substring(0, 150);
    }
    
    // Se não encontrou comentário, tentar extrair do primeiro comentário de linha
    if (!description) {
      const lineCommentMatch = content.match(/\/\/\s*(.+)/);
      if (lineCommentMatch) {
        description = lineCommentMatch[1].trim().substring(0, 100);
      }
    }
    
  } catch (error) {
    log(`Erro ao analisar arquivo ${filePath}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'yellow');
  }
  
  return { methods, hasAuth, description };
}

// Função para fazer login e obter token
async function authenticate(): Promise<AuthResult> {
  log('\n🔐 Fazendo login...', 'cyan');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(CONFIG.credentials),
    });
    
    if (response.status === 200 && response.data?.success) {
      log('✅ Login realizado com sucesso!', 'green');
      log(`👤 Usuário: ${response.data.data?.user?.email || 'N/A'}`, 'gray');
      log(`🎭 Papel: ${response.data.data?.user?.role || 'N/A'}`, 'gray');
      
      return {
        token: response.data.data?.token,
        refreshToken: response.data.data?.refreshToken,
        user: response.data.data?.user,
        success: true,
      };
    } else {
      log(`❌ Falha no login: ${response.data?.message || 'Erro desconhecido'}`, 'red');
      log(`📊 Status: ${response.status}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log(`❌ Erro ao fazer login: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'red');
    return { success: false };
  }
}

// Função para gerar valores de teste para parâmetros
function generateTestValues(params: string[]): Record<string, string> {
  const testValues: Record<string, string> = {};
  
  for (const param of params) {
    switch (param.toLowerCase()) {
      case 'id':
      case 'userid':
      case 'roleid':
      case 'videoid':
      case 'courseid':
      case 'classid':
        testValues[param] = '1';
        break;
      case 'email':
        testValues[param] = 'test@example.com';
        break;
      case 'slug':
        testValues[param] = 'test-slug';
        break;
      default:
        testValues[param] = 'test-value';
    }
  }
  
  return testValues;
}

// Função para testar uma rota
async function testRoute(route: RouteInfo, authToken?: string): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  for (const method of route.methods) {
    const startTime = Date.now();
    
    try {
      const headers: Record<string, string> = {};
      
      if (authToken && route.hasAuth) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Para rotas dinâmicas, usar valores de exemplo
      let testPath = route.path;
      if (route.params && route.params.length > 0) {
        const testValues = generateTestValues(route.params);
        for (const [param, value] of Object.entries(testValues)) {
          testPath = testPath.replace(`:${param}`, value);
        }
      }
      
      // Substituir catch-all routes
      testPath = testPath.replace('/*', '/test');
      
      const url = `${CONFIG.baseUrl}/api${testPath}`;
      
      const requestOptions: RequestInit = {
        method,
        headers,
      };
      
      // Para métodos que podem ter body, adicionar um body de teste simples
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        requestOptions.body = JSON.stringify({ test: true });
      }
      
      const response = await makeRequest(url, requestOptions);
      const responseTime = Date.now() - startTime;
      
      results.push({
        method,
        status: response.status,
        success: response.status < 400,
        message: response.data?.message || getStatusMessage(response.status),
        hasData: !!response.data,
        responseTime,
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      results.push({
        method,
        status: 0,
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        hasData: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
    
    // Pequeno delay entre requests
    if (CONFIG.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delay));
    }
  }
  
  return results;
}

// Função para obter mensagem de status HTTP
function getStatusMessage(status: number): string {
  const statusMessages: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    500: 'Internal Server Error',
  };
  
  return statusMessages[status] || `Status ${status}`;
}

// Função para gerar relatório HTML
function generateHtmlReport(report: ApiTestReport): string {
  const successRate = report.summary.total > 0 
    ? ((report.summary.success / report.summary.total) * 100).toFixed(1)
    : '0';
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Testes de API</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 0.9em; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        .routes { padding: 0 30px 30px 30px; }
        .route { border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
        .route-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef; }
        .route-path { font-family: 'Monaco', 'Menlo', monospace; font-weight: bold; color: #495057; }
        .route-description { color: #6c757d; font-size: 0.9em; margin-top: 5px; }
        .route-tests { padding: 15px; }
        .test { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f3f4; }
        .test:last-child { border-bottom: none; }
        .method { font-family: 'Monaco', 'Menlo', monospace; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; }
        .method.GET { background: #d4edda; color: #155724; }
        .method.POST { background: #cce5ff; color: #004085; }
        .method.PUT { background: #fff3cd; color: #856404; }
        .method.DELETE { background: #f8d7da; color: #721c24; }
        .status { font-family: 'Monaco', 'Menlo', monospace; font-size: 0.9em; }
        .status.success { color: #28a745; }
        .status.error { color: #dc3545; }
        .auth-badge { background: #6f42c1; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7em; margin-left: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Relatório de Testes de API</h1>
            <p>Gerado em ${new Date(report.timestamp).toLocaleString('pt-BR')}</p>
            <p>Base URL: ${report.baseUrl}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number info">${report.totalRoutes}</div>
                <div class="stat-label">Rotas Descobertas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number success">${report.summary.success}</div>
                <div class="stat-label">Testes Bem-sucedidos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number error">${report.summary.failed}</div>
                <div class="stat-label">Testes Falharam</div>
            </div>
            <div class="stat-card">
                <div class="stat-number warning">${successRate}%</div>
                <div class="stat-label">Taxa de Sucesso</div>
            </div>
            <div class="stat-card">
                <div class="stat-number ${report.authSuccess ? 'success' : 'error'}">${report.authSuccess ? '✅' : '❌'}</div>
                <div class="stat-label">Autenticação</div>
            </div>
            <div class="stat-card">
                <div class="stat-number info">${report.summary.authRequired}</div>
                <div class="stat-label">Requer Auth</div>
            </div>
        </div>
        
        <div class="routes">
            <h2>📋 Detalhes das Rotas</h2>
            ${report.routes.map(route => `
                <div class="route">
                    <div class="route-header">
                        <div class="route-path">
                            ${route.path}
                            ${route.hasAuth ? '<span class="auth-badge">🔒 AUTH</span>' : ''}
                        </div>
                        ${route.description ? `<div class="route-description">${route.description}</div>` : ''}
                    </div>
                    <div class="route-tests">
                        ${route.tests.map(test => `
                            <div class="test">
                                <div>
                                    <span class="method ${test.method}">${test.method}</span>
                                    <span style="margin-left: 10px;">${test.message}</span>
                                </div>
                                <div>
                                    <span class="status ${test.success ? 'success' : 'error'}">
                                        ${test.status} (${test.responseTime}ms)
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
  `.trim();
}

// Função principal
async function main(): Promise<void> {
  log('🚀 Iniciando mapeamento de rotas de API...', 'bright');
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
  
  // Mostrar algumas rotas descobertas
  if (routes.length > 0) {
    log('\n📋 Primeiras rotas encontradas:', 'gray');
    routes.slice(0, 5).forEach(route => {
      log(`  ${route.path} [${route.methods.join(', ')}]${route.hasAuth ? ' 🔒' : ''}`, 'gray');
    });
    if (routes.length > 5) {
      log(`  ... e mais ${routes.length - 5} rotas`, 'gray');
    }
  }
  
  // Fazer autenticação
  const auth = await authenticate();
  
  // Criar relatório
  const report: ApiTestReport = {
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
      byStatus: {},
    },
  };
  
  // Testar cada rota
  log('\n🧪 Testando rotas...', 'cyan');
  log('═'.repeat(60), 'blue');
  
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const progress = `[${String(i + 1).padStart(3)}/${routes.length}]`;
    
    log(`${progress} ${route.path}`, 'yellow');
    
    const testResults = await testRoute(route, auth.token);
    
    const routeReport: RouteTestResult = {
      ...route,
      tests: testResults,
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
      
      // Contar por status
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
  
  // Salvar relatórios
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const reportDir = path.join(process.cwd(), 'reports');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const jsonReportPath = path.join(reportDir, `api-test-report-${timestamp}.json`);
  const htmlReportPath = path.join(reportDir, `api-test-report-${timestamp}.html`);
  
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(htmlReportPath, generateHtmlReport(report));
  
  // Mostrar resumo final
  log('\n📊 RESUMO FINAL', 'bright');
  log('═'.repeat(60), 'blue');
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
  
  log(`\n📄 Relatórios salvos:`, 'blue');
  log(`  JSON: ${jsonReportPath}`, 'gray');
  log(`  HTML: ${htmlReportPath}`, 'gray');
  
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
  
  // Mostrar rotas com falha se houver
  if (report.summary.failed > 0) {
    log('\n❌ ROTAS COM FALHA:', 'red');
    for (const route of report.routes) {
      const failedTests = route.tests.filter(t => !t.success);
      if (failedTests.length > 0) {
        log(`  ${route.path}:`, 'yellow');
        for (const test of failedTests) {
          log(`    ${test.method}: ${test.message} (${test.status})`, 'red');
        }
      }
    }
  }
  
  log('\n🎉 Mapeamento concluído!', 'bright');
