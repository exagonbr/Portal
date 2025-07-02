"use strict";
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
var axios_1 = require("axios");
var fs_1 = require("fs");
var path_1 = require("path");
var API_BASE_URL = 'http://localhost:300/api';
var API_DIR = path_1.default.join(__dirname, '../src/app/api');
var credentials = {
    email: 'admin@sabercon.edu.br',
    password: 'password123',
};
// Função para fazer login e obter o token
function getAuthToken() {
    return __awaiter(this, void 0, void 0, function () {
        var response, token, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    console.log('🔑 Autenticando...');
                    return [4 /*yield*/, axios_1.default.post("".concat(API_BASE_URL, "/auth/login"), credentials)];
                case 1:
                    response = _d.sent();
                    token = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.accessToken;
                    if (token) {
                        console.log('✅ Autenticação bem-sucedida!');
                        return [2 /*return*/, token];
                    }
                    console.error('❌ Token não encontrado na resposta de login.');
                    return [2 /*return*/, null];
                case 2:
                    error_1 = _d.sent();
                    if (axios_1.default.isAxiosError(error_1)) {
                        console.error('❌ Falha na autenticação:', ((_c = error_1.response) === null || _c === void 0 ? void 0 : _c.data) || error_1.message);
                    }
                    else {
                        console.error('❌ Falha na autenticação (erro desconhecido):', error_1);
                    }
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Função para encontrar todas as rotas da API
function findApiRoutes(dir, base) {
    if (base === void 0) { base = '/api'; }
    var routes = [];
    var entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var entry = entries_1[_i];
        var fullPath = path_1.default.join(dir, entry.name);
        var routePath = "".concat(base, "/").concat(entry.name.replace(/\\/g, '/'));
        if (entry.isDirectory()) {
            // Ignora diretórios especiais
            if (entry.name.startsWith('_') || entry.name.startsWith('[...')) {
                continue;
            }
            routes = routes.concat(findApiRoutes(fullPath, routePath));
        }
        else if (entry.name === 'route.ts') {
            // Remove /route.ts do final
            routes.push(base);
        }
    }
    return routes;
}
// Função para testar uma única rota
function testRoute(token, route) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Pular rotas que não são de teste ou que exigem parâmetros
                    if (route.includes('[') || route.includes('login') || route.includes('register') || route.includes('refresh')) {
                        console.log("\uD83D\uDFE1 Pulando rota din\u00E2mica ou de autentica\u00E7\u00E3o: ".concat(route));
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    console.log("\u25B6\uFE0F  Testando rota: GET ".concat(route));
                    return [4 /*yield*/, axios_1.default.get("".concat(API_BASE_URL).concat(route), {
                            headers: {
                                Authorization: "Bearer ".concat(token),
                            },
                        })];
                case 2:
                    response = _b.sent();
                    console.log("\u2705 SUCESSO [".concat(response.status, "]: GET ").concat(route));
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    if (axios_1.default.isAxiosError(error_2)) {
                        if (error_2.response) {
                            if (error_2.response.status === 401 || error_2.response.status === 403) {
                                console.log("\uD83D\uDD36 AVISO [".concat(error_2.response.status, "]: GET ").concat(route, " (Acesso negado como esperado)"));
                            }
                            else {
                                console.error("\u274C FALHA [".concat(error_2.response.status, "]: GET ").concat(route, " - ").concat(((_a = error_2.response.data) === null || _a === void 0 ? void 0 : _a.message) || 'Sem mensagem'));
                            }
                        }
                        else {
                            console.error("\u274C ERRO: GET ".concat(route, " - ").concat(error_2.message));
                        }
                    }
                    else {
                        console.error("\u274C ERRO DESCONHECIDO: GET ".concat(route), error_2);
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Função principal
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var token, allRoutes, uniqueRoutes, _i, uniqueRoutes_1, route;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAuthToken()];
                case 1:
                    token = _a.sent();
                    if (!token) {
                        console.error('🛑 Testes não podem continuar sem um token de autenticação.');
                        return [2 /*return*/];
                    }
                    allRoutes = findApiRoutes(API_DIR);
                    console.log("\n\uD83D\uDD0E Encontradas ".concat(allRoutes.length, " rotas para testar."));
                    uniqueRoutes = Array.from(new Set(allRoutes));
                    console.log("\n\uD83D\uDE80 Iniciando testes em ".concat(uniqueRoutes.length, " rotas \u00FAnicas..."));
                    _i = 0, uniqueRoutes_1 = uniqueRoutes;
                    _a.label = 2;
                case 2:
                    if (!(_i < uniqueRoutes_1.length)) return [3 /*break*/, 5];
                    route = uniqueRoutes_1[_i];
                    return [4 /*yield*/, testRoute(token, route)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('\n\n🏁 Testes concluídos.');
                    return [2 /*return*/];
            }
        });
    });
}
main();
