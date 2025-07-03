#!/usr/bin/env tsx
"use strict";
/**
 * Script TypeScript para mapear e testar todas as rotas de API
 * Versão integrada com Next.js
 * Autor: Kilo Code
 * Data: 2025-01-07
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverRoutes = discoverRoutes;
exports.analyzeRouteFile = analyzeRouteFile;
exports.makeRequest = makeRequest;
exports.authenticate = authenticate;
exports.testRoute = testRoute;
var fs_1 = require("fs");
var path_1 = require("path");
// Configurações
var CONFIG = {
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
var colors = {
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
function log(message, color) {
    if (color === void 0) { color = 'reset'; }
    console.log("".concat(colors[color]).concat(message).concat(colors.reset));
}
// Função para fazer requisições HTTP com fetch
function makeRequest(url_1) {
    return __awaiter(this, arguments, void 0, function (url, options) {
        var controller, timeoutId, response, raw, data, parseError, error_1;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    controller = new AbortController();
                    timeoutId = setTimeout(function () { return controller.abort(); }, CONFIG.timeout);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(url, __assign(__assign({}, options), { headers: __assign({ 'Content-Type': 'application/json', 'User-Agent': 'API-Route-Mapper-TS/1.0' }, options.headers), signal: controller.signal }))];
                case 2:
                    response = _a.sent();
                    clearTimeout(timeoutId);
                    return [4 /*yield*/, response.text()];
                case 3:
                    raw = _a.sent();
                    data = null;
                    parseError = void 0;
                    try {
                        data = raw ? JSON.parse(raw) : {};
                    }
                    catch (error) {
                        parseError = error instanceof Error ? error.message : 'Parse error';
                    }
                    return [2 /*return*/, {
                            status: response.status,
                            headers: response.headers,
                            data: data,
                            raw: raw,
                            parseError: parseError,
                        }];
                case 4:
                    error_1 = _a.sent();
                    clearTimeout(timeoutId);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Função para descobrir rotas recursivamente
function discoverRoutes(dir, basePath) {
    if (basePath === void 0) { basePath = ''; }
    var routes = [];
    try {
        var items = fs_1.default.readdirSync(dir, { withFileTypes: true });
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var fullPath = path_1.default.join(dir, item.name);
            var routePath = path_1.default.join(basePath, item.name);
            if (item.isDirectory()) {
                // Verificar se é um diretório de rota dinâmica
                if (item.name.startsWith('[') && item.name.endsWith(']')) {
                    var paramName = item.name.slice(1, -1);
                    var dynamicPath = void 0;
                    if (paramName.startsWith('...')) {
                        // Catch-all route
                        dynamicPath = routePath.replace("[".concat(paramName, "]"), '*');
                    }
                    else {
                        // Dynamic route
                        dynamicPath = routePath.replace("[".concat(paramName, "]"), ":".concat(paramName));
                    }
                    routes.push.apply(routes, discoverRoutes(fullPath, dynamicPath));
                }
                else {
                    routes.push.apply(routes, discoverRoutes(fullPath, routePath));
                }
            }
            else if (item.name === 'route.ts' || item.name === 'route.js') {
                // Encontrou um arquivo de rota
                var routeInfo = analyzeRouteFile(fullPath);
                var cleanPath = basePath.replace(/\\/g, '/') || '/';
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
    }
    catch (error) {
        log("Erro ao ler diret\u00F3rio ".concat(dir, ": ").concat(error instanceof Error ? error.message : 'Erro desconhecido'), 'red');
    }
    return routes;
}
// Função para extrair parâmetros da rota
function extractParams(routePath) {
    var params = [];
    var matches = routePath.match(/:(\w+)/g);
    if (matches) {
        params.push.apply(params, matches.map(function (match) { return match.substring(1); }));
    }
    return params;
}
// Função para analisar arquivo de rota
function analyzeRouteFile(filePath) {
    var methods = [];
    var hasAuth = false;
    var description = '';
    try {
        var content_1 = fs_1.default.readFileSync(filePath, 'utf8');
        // Detectar métodos HTTP exportados
        var httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
        for (var _i = 0, httpMethods_1 = httpMethods; _i < httpMethods_1.length; _i++) {
            var method = httpMethods_1[_i];
            if (content_1.includes("export async function ".concat(method)) ||
                content_1.includes("export function ".concat(method))) {
                methods.push(method);
            }
        }
        // Detectar se usa autenticação
        var authKeywords = [
            'auth', 'token', 'jwt', 'session', 'Authorization',
            'Bearer', 'authenticate', 'validateToken', 'checkAuth'
        ];
        hasAuth = authKeywords.some(function (keyword) {
            return content_1.toLowerCase().includes(keyword.toLowerCase());
        });
        // Tentar extrair descrição dos comentários
        var commentMatches = content_1.match(/\/\*\*([\s\S]*?)\*\//g);
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
            var lineCommentMatch = content_1.match(/\/\/\s*(.+)/);
            if (lineCommentMatch) {
                description = lineCommentMatch[1].trim().substring(0, 100);
            }
        }
    }
    catch (error) {
        log("Erro ao analisar arquivo ".concat(filePath, ": ").concat(error instanceof Error ? error.message : 'Erro desconhecido'), 'yellow');
    }
    return { methods: methods, hasAuth: hasAuth, description: description };
}
// Função para fazer login e obter token
function authenticate() {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_2;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    log('\n🔐 Fazendo login...', 'cyan');
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, makeRequest("".concat(CONFIG.baseUrl, "/api/auth/login"), {
                            method: 'POST',
                            body: JSON.stringify(CONFIG.credentials),
                        })];
                case 2:
                    response = _k.sent();
                    if (response.status === 200 && ((_a = response.data) === null || _a === void 0 ? void 0 : _a.success)) {
                        log('✅ Login realizado com sucesso!', 'green');
                        log("\uD83D\uDC64 Usu\u00E1rio: ".concat(((_c = (_b = response.data.data) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.email) || 'N/A'), 'gray');
                        log("\uD83C\uDFAD Papel: ".concat(((_e = (_d = response.data.data) === null || _d === void 0 ? void 0 : _d.user) === null || _e === void 0 ? void 0 : _e.role) || 'N/A'), 'gray');
                        return [2 /*return*/, {
                                token: (_f = response.data.data) === null || _f === void 0 ? void 0 : _f.token,
                                refreshToken: (_g = response.data.data) === null || _g === void 0 ? void 0 : _g.refreshToken,
                                user: (_h = response.data.data) === null || _h === void 0 ? void 0 : _h.user,
                                success: true,
                            }];
                    }
                    else {
                        log("\u274C Falha no login: ".concat(((_j = response.data) === null || _j === void 0 ? void 0 : _j.message) || 'Erro desconhecido'), 'red');
                        log("\uD83D\uDCCA Status: ".concat(response.status), 'red');
                        return [2 /*return*/, { success: false }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _k.sent();
                    log("\u274C Erro ao fazer login: ".concat(error_2 instanceof Error ? error_2.message : 'Erro desconhecido'), 'red');
                    return [2 /*return*/, { success: false }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Função para gerar valores de teste para parâmetros
function generateTestValues(params) {
    var testValues = {};
    for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
        var param = params_1[_i];
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
function testRoute(route, authToken) {
    return __awaiter(this, void 0, void 0, function () {
        var results, _i, _a, method, startTime, headers, testPath, testValues, _b, _c, _d, param, value, url, requestOptions, response, responseTime, error_3, responseTime;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    results = [];
                    _i = 0, _a = route.methods;
                    _f.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    method = _a[_i];
                    startTime = Date.now();
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 4, , 5]);
                    headers = {};
                    if (authToken && route.hasAuth) {
                        headers['Authorization'] = "Bearer ".concat(authToken);
                    }
                    testPath = route.path;
                    if (route.params && route.params.length > 0) {
                        testValues = generateTestValues(route.params);
                        for (_b = 0, _c = Object.entries(testValues); _b < _c.length; _b++) {
                            _d = _c[_b], param = _d[0], value = _d[1];
                            testPath = testPath.replace(":".concat(param), value);
                        }
                    }
                    // Substituir catch-all routes
                    testPath = testPath.replace('/*', '/test');
                    url = "".concat(CONFIG.baseUrl, "/api").concat(testPath);
                    requestOptions = {
                        method: method,
                        headers: headers,
                    };
                    // Para métodos que podem ter body, adicionar um body de teste simples
                    if (['POST', 'PUT', 'PATCH'].includes(method)) {
                        requestOptions.body = JSON.stringify({ test: true });
                    }
                    return [4 /*yield*/, makeRequest(url, requestOptions)];
                case 3:
                    response = _f.sent();
                    responseTime = Date.now() - startTime;
                    results.push({
                        method: method,
                        status: response.status,
                        success: response.status < 400,
                        message: ((_e = response.data) === null || _e === void 0 ? void 0 : _e.message) || getStatusMessage(response.status),
                        hasData: !!response.data,
                        responseTime: responseTime,
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _f.sent();
                    responseTime = Date.now() - startTime;
                    results.push({
                        method: method,
                        status: 0,
                        success: false,
                        message: error_3 instanceof Error ? error_3.message : 'Erro desconhecido',
                        hasData: false,
                        responseTime: responseTime,
                        error: error_3 instanceof Error ? error_3.message : 'Erro desconhecido',
                    });
                    return [3 /*break*/, 5];
                case 5:
                    if (!(CONFIG.delay > 0)) return [3 /*break*/, 7];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, CONFIG.delay); })];
                case 6:
                    _f.sent();
                    _f.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, results];
            }
        });
    });
}
// Função para obter mensagem de status HTTP
function getStatusMessage(status) {
    var statusMessages = {
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
    return statusMessages[status] || "Status ".concat(status);
}
// Função para gerar relatório HTML
function generateHtmlReport(report) {
    var successRate = report.summary.total > 0
        ? ((report.summary.success / report.summary.total) * 100).toFixed(1)
        : '0';
    return "\n<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Relat\u00F3rio de Testes de API</title>\n    <style>\n        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }\n        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }\n        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }\n        .header h1 { margin: 0; font-size: 2.5em; }\n        .header p { margin: 10px 0 0 0; opacity: 0.9; }\n        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }\n        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }\n        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }\n        .stat-label { color: #666; font-size: 0.9em; }\n        .success { color: #28a745; }\n        .error { color: #dc3545; }\n        .warning { color: #ffc107; }\n        .info { color: #17a2b8; }\n        .routes { padding: 0 30px 30px 30px; }\n        .route { border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }\n        .route-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef; }\n        .route-path { font-family: 'Monaco', 'Menlo', monospace; font-weight: bold; color: #495057; }\n        .route-description { color: #6c757d; font-size: 0.9em; margin-top: 5px; }\n        .route-tests { padding: 15px; }\n        .test { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f3f4; }\n        .test:last-child { border-bottom: none; }\n        .method { font-family: 'Monaco', 'Menlo', monospace; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; }\n        .method.GET { background: #d4edda; color: #155724; }\n        .method.POST { background: #cce5ff; color: #004085; }\n        .method.PUT { background: #fff3cd; color: #856404; }\n        .method.DELETE { background: #f8d7da; color: #721c24; }\n        .status { font-family: 'Monaco', 'Menlo', monospace; font-size: 0.9em; }\n        .status.success { color: #28a745; }\n        .status.error { color: #dc3545; }\n        .auth-badge { background: #6f42c1; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7em; margin-left: 10px; }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <div class=\"header\">\n            <h1>\uD83D\uDE80 Relat\u00F3rio de Testes de API</h1>\n            <p>Gerado em ".concat(new Date(report.timestamp).toLocaleString('pt-BR'), "</p>\n            <p>Base URL: ").concat(report.baseUrl, "</p>\n        </div>\n        \n        <div class=\"stats\">\n            <div class=\"stat-card\">\n                <div class=\"stat-number info\">").concat(report.totalRoutes, "</div>\n                <div class=\"stat-label\">Rotas Descobertas</div>\n            </div>\n            <div class=\"stat-card\">\n                <div class=\"stat-number success\">").concat(report.summary.success, "</div>\n                <div class=\"stat-label\">Testes Bem-sucedidos</div>\n            </div>\n            <div class=\"stat-card\">\n                <div class=\"stat-number error\">").concat(report.summary.failed, "</div>\n                <div class=\"stat-label\">Testes Falharam</div>\n            </div>\n            <div class=\"stat-card\">\n                <div class=\"stat-number warning\">").concat(successRate, "%</div>\n                <div class=\"stat-label\">Taxa de Sucesso</div>\n            </div>\n            <div class=\"stat-card\">\n                <div class=\"stat-number ").concat(report.authSuccess ? 'success' : 'error', "\">").concat(report.authSuccess ? '✅' : '❌', "</div>\n                <div class=\"stat-label\">Autentica\u00E7\u00E3o</div>\n            </div>\n            <div class=\"stat-card\">\n                <div class=\"stat-number info\">").concat(report.summary.authRequired, "</div>\n                <div class=\"stat-label\">Requer Auth</div>\n            </div>\n        </div>\n        \n        <div class=\"routes\">\n            <h2>\uD83D\uDCCB Detalhes das Rotas</h2>\n            ").concat(report.routes.map(function (route) { return "\n                <div class=\"route\">\n                    <div class=\"route-header\">\n                        <div class=\"route-path\">\n                            ".concat(route.path, "\n                            ").concat(route.hasAuth ? '<span class="auth-badge">🔒 AUTH</span>' : '', "\n                        </div>\n                        ").concat(route.description ? "<div class=\"route-description\">".concat(route.description, "</div>") : '', "\n                    </div>\n                    <div class=\"route-tests\">\n                        ").concat(route.tests.map(function (test) { return "\n                            <div class=\"test\">\n                                <div>\n                                    <span class=\"method ".concat(test.method, "\">").concat(test.method, "</span>\n                                    <span style=\"margin-left: 10px;\">").concat(test.message, "</span>\n                                </div>\n                                <div>\n                                    <span class=\"status ").concat(test.success ? 'success' : 'error', "\">\n                                        ").concat(test.status, " (").concat(test.responseTime, "ms)\n                                    </span>\n                                </div>\n                            </div>\n                        "); }).join(''), "\n                    </div>\n                </div>\n            "); }).join(''), "\n        </div>\n    </div>\n</body>\n</html>\n  ").trim();
}
// Função principal
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var apiDir, routes, auth, report, i, route, progress, testResults, routeReport, _i, testResults_1, test, successCount, totalTests, status_1, avgTime, timestamp, reportDir, jsonReportPath, htmlReportPath, successRate, _a, _b, route, failedTests, _c, failedTests_1, test;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    log('🚀 Iniciando mapeamento de rotas de API...', 'bright');
                    log("\uD83D\uDCCD Base URL: ".concat(CONFIG.baseUrl), 'blue');
                    log("\uD83D\uDC64 Usu\u00E1rio: ".concat(CONFIG.credentials.email), 'blue');
                    // Descobrir todas as rotas
                    log('\n📂 Descobrindo rotas...', 'cyan');
                    apiDir = path_1.default.join(process.cwd(), 'src', 'app', 'api');
                    if (!fs_1.default.existsSync(apiDir)) {
                        log('❌ Diretório de API não encontrado!', 'red');
                        log("\uD83D\uDCC1 Procurando em: ".concat(apiDir), 'gray');
                        process.exit(1);
                    }
                    routes = discoverRoutes(apiDir);
                    log("\u2705 Encontradas ".concat(routes.length, " rotas"), 'green');
                    // Mostrar algumas rotas descobertas
                    if (routes.length > 0) {
                        log('\n📋 Primeiras rotas encontradas:', 'gray');
                        routes.slice(0, 5).forEach(function (route) {
                            log("  ".concat(route.path, " [").concat(route.methods.join(', '), "]").concat(route.hasAuth ? ' 🔒' : ''), 'gray');
                        });
                        if (routes.length > 5) {
                            log("  ... e mais ".concat(routes.length - 5, " rotas"), 'gray');
                        }
                    }
                    return [4 /*yield*/, authenticate()];
                case 1:
                    auth = _d.sent();
                    report = {
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
                    i = 0;
                    _d.label = 2;
                case 2:
                    if (!(i < routes.length)) return [3 /*break*/, 5];
                    route = routes[i];
                    progress = "[".concat(String(i + 1).padStart(3), "/").concat(routes.length, "]");
                    log("".concat(progress, " ").concat(route.path), 'yellow');
                    return [4 /*yield*/, testRoute(route, auth.token)];
                case 3:
                    testResults = _d.sent();
                    routeReport = __assign(__assign({}, route), { tests: testResults });
                    report.routes.push(routeReport);
                    // Atualizar estatísticas
                    for (_i = 0, testResults_1 = testResults; _i < testResults_1.length; _i++) {
                        test = testResults_1[_i];
                        report.summary.total++;
                        if (test.success) {
                            report.summary.success++;
                        }
                        else {
                            report.summary.failed++;
                        }
                        // Contar por status
                        report.summary.byStatus[test.status] = (report.summary.byStatus[test.status] || 0) + 1;
                    }
                    if (route.hasAuth) {
                        report.summary.authRequired++;
                    }
                    successCount = testResults.filter(function (t) { return t.success; }).length;
                    totalTests = testResults.length;
                    status_1 = successCount === totalTests ? '✅' : successCount > 0 ? '⚠️' : '❌';
                    avgTime = Math.round(testResults.reduce(function (sum, t) { return sum + t.responseTime; }, 0) / totalTests);
                    log("      ".concat(status_1, " ").concat(successCount, "/").concat(totalTests, " OK (").concat(avgTime, "ms avg)"), successCount === totalTests ? 'green' : successCount > 0 ? 'yellow' : 'red');
                    _d.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
                    reportDir = path_1.default.join(process.cwd(), 'reports');
                    if (!fs_1.default.existsSync(reportDir)) {
                        fs_1.default.mkdirSync(reportDir, { recursive: true });
                    }
                    jsonReportPath = path_1.default.join(reportDir, "api-test-report-".concat(timestamp, ".json"));
                    htmlReportPath = path_1.default.join(reportDir, "api-test-report-".concat(timestamp, ".html"));
                    fs_1.default.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
                    fs_1.default.writeFileSync(htmlReportPath, generateHtmlReport(report));
                    // Mostrar resumo final
                    log('\n📊 RESUMO FINAL', 'bright');
                    log('═'.repeat(60), 'blue');
                    log("\uD83D\uDCCD Base URL: ".concat(CONFIG.baseUrl), 'blue');
                    log("\uD83D\uDD10 Autentica\u00E7\u00E3o: ".concat(auth.success ? '✅ Sucesso' : '❌ Falhou'), auth.success ? 'green' : 'red');
                    log("\uD83D\uDCC2 Total de rotas: ".concat(report.totalRoutes), 'cyan');
                    log("\uD83E\uDDEA Total de testes: ".concat(report.summary.total), 'cyan');
                    log("\u2705 Sucessos: ".concat(report.summary.success), 'green');
                    log("\u274C Falhas: ".concat(report.summary.failed), 'red');
                    log("\uD83D\uDD12 Requer autentica\u00E7\u00E3o: ".concat(report.summary.authRequired), 'magenta');
                    successRate = report.summary.total > 0
                        ? ((report.summary.success / report.summary.total) * 100).toFixed(1)
                        : '0';
                    log("\uD83D\uDCC8 Taxa de sucesso: ".concat(successRate, "%"), successRate === '100.0' ? 'green' : 'yellow');
                    log("\n\uD83D\uDCC4 Relat\u00F3rios salvos:", 'blue');
                    log("  JSON: ".concat(jsonReportPath), 'gray');
                    log("  HTML: ".concat(htmlReportPath), 'gray');
                    // Mostrar distribuição por status
                    if (Object.keys(report.summary.byStatus).length > 0) {
                        log('\n📊 Distribuição por Status HTTP:', 'cyan');
                        Object.entries(report.summary.byStatus)
                            .sort(function (_a, _b) {
                            var a = _a[0];
                            var b = _b[0];
                            return parseInt(a) - parseInt(b);
                        })
                            .forEach(function (_a) {
                            var status = _a[0], count = _a[1];
                            var statusNum = parseInt(status);
                            var color = statusNum < 300 ? 'green' : statusNum < 400 ? 'yellow' : 'red';
                            log("  ".concat(status, ": ").concat(count, " (").concat(getStatusMessage(statusNum), ")"), color);
                        });
                    }
                    // Mostrar rotas com falha se houver
                    if (report.summary.failed > 0) {
                        log('\n❌ ROTAS COM FALHA:', 'red');
                        for (_a = 0, _b = report.routes; _a < _b.length; _a++) {
                            route = _b[_a];
                            failedTests = route.tests.filter(function (t) { return !t.success; });
                            if (failedTests.length > 0) {
                                log("  ".concat(route.path, ":"), 'yellow');
                                for (_c = 0, failedTests_1 = failedTests; _c < failedTests_1.length; _c++) {
                                    test = failedTests_1[_c];
                                    log("    ".concat(test.method, ": ").concat(test.message, " (").concat(test.status, ")"), 'red');
                                }
                            }
                        }
                    }
                    log('\n🎉 Mapeamento concluído!', 'bright');
                    log("\uD83C\uDF10 Abra o relat\u00F3rio HTML para visualiza\u00E7\u00E3o detalhada: ".concat(htmlReportPath), 'cyan');
                    return [2 /*return*/];
            }
        });
    });
}
// Executar script
if (import.meta.url === "file://".concat(process.argv[1])) {
    main().catch(function (error) {
        log("\uD83D\uDCA5 Erro fatal: ".concat(error instanceof Error ? error.message : 'Erro desconhecido'), 'red');
        console.error(error);
        process.exit(1);
    });
}
