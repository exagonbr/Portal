#!/usr/bin/env node

/**
 * Script de Correção de Problemas de Autenticação
 * 
 * Este script ajuda a diagnosticar e corrigir problemas relacionados a tokens
 * de autenticação no Portal Sabercon.
 * 
 * Uso: node scripts/fix-auth-token.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 SCRIPT DE CORREÇÃO DE AUTENTICAÇÃO');
console.log('=====================================\n');

/**
 * Verifica se um arquivo existe
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Lê o conteúdo de um arquivo
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Escreve conteúdo em um arquivo
 */
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`❌ Erro ao escrever arquivo ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Verifica se o middleware de autenticação está configurado corretamente
 */
function checkAuthMiddleware() {
  console.log('🔍 Verificando middleware de autenticação...');
  
  const middlewareFiles = [
    'backend/src/middleware/sessionMiddleware.ts',
    'src/middlewares/authMiddleware.ts',
    'src/middleware-old.ts'
  ];
  
  let issuesFound = 0;
  
  for (const file of middlewareFiles) {
    if (fileExists(file)) {
      const content = readFile(file);
      if (content) {
        // Verificar se há problemas comuns
        if (content.includes('Token inválido ou expirado') && 
            !content.includes('console.warn') && 
            content.includes('console.error')) {
          console.warn(`⚠️  ${file}: Usando console.error para erros de token (pode causar logs desnecessários)`);
          issuesFound++;
        }
        
        if (content.includes('throw new Error') && content.includes('Token inválido')) {
          console.warn(`⚠️  ${file}: Lançando erro para token inválido (pode causar unhandled exceptions)`);
          issuesFound++;
        }
        
        console.log(`✅ ${file}: Verificado`);
      }
    } else {
      console.log(`⏭️  ${file}: Não encontrado (normal se não usado)`);
    }
  }
  
  return issuesFound;
}

/**
 * Verifica se o cliente API está configurado corretamente
 */
function checkApiClient() {
  console.log('\n🔍 Verificando cliente API...');
  
  const apiClientFile = 'src/lib/api-client.ts';
  
  if (!fileExists(apiClientFile)) {
    console.error(`❌ Arquivo ${apiClientFile} não encontrado!`);
    return 1;
  }
  
  const content = readFile(apiClientFile);
  if (!content) {
    return 1;
  }
  
  let issuesFound = 0;
  
  // Verificar se há tratamento adequado de erros
  if (!content.includes('catch') || !content.includes('error')) {
    console.warn(`⚠️  ${apiClientFile}: Pode estar faltando tratamento de erro adequado`);
    issuesFound++;
  }
  
  // Verificar se há múltiplas chaves de token
  if (!content.includes('auth_token') || !content.includes('token')) {
    console.warn(`⚠️  ${apiClientFile}: Pode não estar verificando múltiplas chaves de token`);
    issuesFound++;
  }
  
  console.log(`✅ ${apiClientFile}: Verificado`);
  return issuesFound;
}

/**
 * Verifica se o utilitário de debug está atualizado
 */
function checkAuthDebugUtils() {
  console.log('\n🔍 Verificando utilitários de debug...');
  
  const authDebugFile = 'src/utils/auth-debug.ts';
  
  if (!fileExists(authDebugFile)) {
    console.error(`❌ Arquivo ${authDebugFile} não encontrado!`);
    return 1;
  }
  
  const content = readFile(authDebugFile);
  if (!content) {
    return 1;
  }
  
  let issuesFound = 0;
  
  // Verificar se tem as funções essenciais
  const essentialFunctions = [
    'isTokenExpired',
    'cleanExpiredTokens',
    'initializeAuthCleanup',
    'debugAuth'
  ];
  
  for (const func of essentialFunctions) {
    if (!content.includes(func)) {
      console.warn(`⚠️  ${authDebugFile}: Função ${func} não encontrada`);
      issuesFound++;
    }
  }
  
  // Verificar se está tratando erros adequadamente
  if (content.includes('console.error') && content.includes('Token inválido ou expirado')) {
    console.warn(`⚠️  ${authDebugFile}: Pode estar usando console.error para tokens inválidos`);
    issuesFound++;
  }
  
  console.log(`✅ ${authDebugFile}: Verificado`);
  return issuesFound;
}

/**
 * Sugere correções para problemas encontrados
 */
function suggestFixes(totalIssues) {
  console.log('\n📝 SUGESTÕES DE CORREÇÃO');
  console.log('========================\n');
  
  if (totalIssues === 0) {
    console.log('✅ Nenhum problema crítico encontrado!');
    console.log('💡 Dicas para manter a autenticação funcionando bem:');
    console.log('   • Execute limpeza periódica de tokens expirados');
    console.log('   • Monitore logs de autenticação regularmente');
    console.log('   • Mantenha o sistema de debug atualizado');
    return;
  }
  
  console.log('🔧 Problemas encontrados. Sugestões:');
  console.log('');
  
  console.log('1. 📊 Para problemas de logging:');
  console.log('   • Use console.warn em vez de console.error para tokens inválidos');
  console.log('   • Adicione contexto informativo aos logs');
  console.log('   • Evite logs excessivos que podem confundir usuários');
  console.log('');
  
  console.log('2. 🛡️  Para problemas de tratamento de erro:');
  console.log('   • Use try-catch adequadamente');
  console.log('   • Retorne objetos de erro em vez de lançar exceções');
  console.log('   • Trate tokens expirados como casos normais, não erros');
  console.log('');
  
  console.log('3. 🧹 Para limpeza automática:');
  console.log('   • Implemente limpeza automática de tokens expirados');
  console.log('   • Use setInterval para limpeza periódica');
  console.log('   • Verifique expiração antes de usar tokens');
  console.log('');
  
  console.log('4. 🔍 Para debug:');
  console.log('   • Mantenha funções de diagnóstico atualizadas');
  console.log('   • Adicione logs informativos para desenvolvedores');
  console.log('   • Forneça sugestões claras para resolução de problemas');
}

/**
 * Cria um arquivo de configuração de exemplo
 */
function createExampleConfig() {
  console.log('\n📄 Criando arquivo de configuração de exemplo...');
  
  const configContent = `// Configuração de Autenticação - Portal Sabercon
// Este arquivo contém exemplos de configuração para resolver problemas de autenticação

export const AUTH_CONFIG = {
  // Chaves possíveis para tokens no localStorage
  TOKEN_KEYS: ['auth_token', 'token', 'authToken'],
  
  // Tempo de limpeza automática (em milissegundos)
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutos
  
  // Endpoints para teste de autenticação
  TEST_ENDPOINTS: [
    '/api/users/stats',
    '/api/dashboard/system',
    '/api/auth/validate'
  ],
  
  // Configuração de logs
  LOGGING: {
    USE_WARN_FOR_INVALID_TOKENS: true,
    PROVIDE_HELPFUL_MESSAGES: true,
    AVOID_ERROR_LOGS_FOR_NORMAL_CASES: true
  }
};

// Exemplo de uso:
// import { AUTH_CONFIG } from './auth-config-example';
// 
// // Verificar token
// for (const key of AUTH_CONFIG.TOKEN_KEYS) {
//   const token = localStorage.getItem(key);
//   if (token) {
//     // Usar token...
//     break;
//   }
// }
`;

  const configPath = 'src/config/auth-config-example.ts';
  
  // Criar diretório se não existir
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  if (writeFile(configPath, configContent)) {
    console.log(`✅ Arquivo de exemplo criado: ${configPath}`);
  }
}

/**
 * Função principal
 */
function main() {
  console.log('Iniciando verificação do sistema de autenticação...\n');
  
  let totalIssues = 0;
  
  // Verificar componentes
  totalIssues += checkAuthMiddleware();
  totalIssues += checkApiClient();
  totalIssues += checkAuthDebugUtils();
  
  // Criar arquivo de exemplo
  createExampleConfig();
  
  // Sugerir correções
  suggestFixes(totalIssues);
  
  console.log('\n🏁 RESULTADO FINAL');
  console.log('==================');
  
  if (totalIssues === 0) {
    console.log('✅ Sistema de autenticação está bem configurado!');
    console.log('💡 Continue monitorando logs para garantir bom funcionamento.');
  } else {
    console.log(`⚠️  ${totalIssues} problema(s) encontrado(s).`);
    console.log('🔧 Consulte as sugestões acima para correções.');
  }
  
  console.log('\n📚 Para mais informações:');
  console.log('   • Verifique docs/AUTH_TOKEN_FIX.md');
  console.log('   • Execute debugAuth() no console do navegador');
  console.log('   • Monitore logs do backend para erros de autenticação');
  
  process.exit(totalIssues > 0 ? 1 : 0);
}

// Executar se for chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  checkAuthMiddleware,
  checkApiClient,
  checkAuthDebugUtils,
  suggestFixes
}; 