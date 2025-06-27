#!/usr/bin/env node

/**
 * Script para diagnosticar e corrigir problemas de token de autenticação
 * Uso: node scripts/fix-auth-token.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 SCRIPT DE CORREÇÃO DE AUTENTICAÇÃO');
console.log('=====================================');
console.log('');

// Instruções para o usuário
console.log('📋 INSTRUÇÕES:');
console.log('1. Este script verifica a configuração do sistema de autenticação');
console.log('2. Para diagnóstico no navegador, use o código JavaScript fornecido');
console.log('3. Siga as recomendações para corrigir problemas encontrados');
console.log('');

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
        if (content.includes('throw new Error') && content.includes('Invalid JWT payload')) {
          console.warn(`⚠️  ${file}: Lançando erro para payload JWT inválido (pode causar unhandled exceptions)`);
          issuesFound++;
        }
        
        if (content.includes('console.error') && content.includes('Token inválido')) {
          console.warn(`⚠️  ${file}: Usando console.error para tokens inválidos (pode causar logs desnecessários)`);
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
  if (!content.includes('getAuthToken') || !content.includes('setAuthToken')) {
    console.warn(`⚠️  ${apiClientFile}: Pode estar faltando métodos de gerenciamento de token`);
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
  
  // Verificar se ainda está usando console.error para tokens inválidos
  const errorLines = content.split('\n').filter(line => 
    line.includes('console.error') && 
    (line.includes('token') || line.includes('Token'))
  );
  
  if (errorLines.length > 0) {
    console.warn(`⚠️  ${authDebugFile}: Ainda usando console.error para tokens (${errorLines.length} ocorrências)`);
    issuesFound++;
  }
  
  console.log(`✅ ${authDebugFile}: Verificado`);
  return issuesFound;
}

/**
 * Cria um script de diagnóstico para o navegador
 */
function createBrowserDiagnosticScript() {
  console.log('\n📄 Criando script de diagnóstico para o navegador...');
  
  const browserScript = `
// ===== DIAGNÓSTICO DE AUTENTICAÇÃO NO NAVEGADOR =====
// Cole este código no console do navegador (F12)

console.log('🔍 INICIANDO DIAGNÓSTICO DE AUTENTICAÇÃO...');

function diagnoseAuthInBrowser() {
  console.group('📊 DIAGNÓSTICO COMPLETO');
  
  // 1. Verificar tokens em localStorage
  console.log('🔍 1. Verificando localStorage:');
  const localStorageTokens = {};
  const possibleKeys = ['auth_token', 'token', 'authToken'];
  
  possibleKeys.forEach(key => {
    const value = localStorage.getItem(key);
    localStorageTokens[key] = value ? value.substring(0, 20) + '...' : null;
    console.log(\`   \${key}: \${value ? '✅ Presente' : '❌ Ausente'}\`);
  });
  
  // 2. Verificar tokens em sessionStorage
  console.log('🔍 2. Verificando sessionStorage:');
  const sessionStorageTokens = {};
  
  possibleKeys.forEach(key => {
    const value = sessionStorage.getItem(key);
    sessionStorageTokens[key] = value ? value.substring(0, 20) + '...' : null;
    console.log(\`   \${key}: \${value ? '✅ Presente' : '❌ Ausente'}\`);
  });
  
  // 3. Verificar cookies
  console.log('🔍 3. Verificando cookies:');
  const cookies = document.cookie.split(';');
  const cookieTokens = {};
  
  possibleKeys.forEach(key => {
    const cookie = cookies.find(c => c.trim().startsWith(key + '='));
    cookieTokens[key] = cookie ? cookie.split('=')[1].substring(0, 20) + '...' : null;
    console.log(\`   \${key}: \${cookie ? '✅ Presente' : '❌ Ausente'}\`);
  });
  
  // 4. Encontrar o melhor token
  let bestToken = null;
  let bestTokenSource = null;
  
  // Prioridade: localStorage > sessionStorage > cookies
  for (const key of possibleKeys) {
    const lsToken = localStorage.getItem(key);
    if (lsToken && lsToken.trim() !== '') {
      bestToken = lsToken.trim();
      bestTokenSource = \`localStorage.\${key}\`;
      break;
    }
  }
  
  if (!bestToken) {
    for (const key of possibleKeys) {
      const ssToken = sessionStorage.getItem(key);
      if (ssToken && ssToken.trim() !== '') {
        bestToken = ssToken.trim();
        bestTokenSource = \`sessionStorage.\${key}\`;
        break;
      }
    }
  }
  
  if (!bestToken) {
    for (const key of possibleKeys) {
      const cookie = cookies.find(c => c.trim().startsWith(key + '='));
      if (cookie) {
        const cookieValue = cookie.split('=')[1];
        if (cookieValue && cookieValue.trim() !== '') {
          bestToken = cookieValue.trim();
          bestTokenSource = \`cookie.\${key}\`;
          break;
        }
      }
    }
  }
  
  console.log('');
  console.log('🎯 RESULTADO DO DIAGNÓSTICO:');
  
  if (bestToken) {
    console.log(\`✅ Token encontrado em: \${bestTokenSource}\`);
    console.log(\`📏 Tamanho do token: \${bestToken.length} caracteres\`);
    
    // Verificar se é JWT
    const jwtParts = bestToken.split('.');
    if (jwtParts.length === 3) {
      console.log('✅ Token é um JWT válido');
      
      try {
        const payload = JSON.parse(atob(jwtParts[1]));
        const isExpired = payload.exp && payload.exp < Math.floor(Date.now() / 1000);
        
        console.log(\`⏰ Token expira em: \${new Date(payload.exp * 1000).toLocaleString()}\`);
        console.log(\`🔄 Token \${isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO'}\`);
        
        if (payload.email) console.log(\`👤 Email: \${payload.email}\`);
        if (payload.role) console.log(\`🎭 Role: \${payload.role}\`);
        
      } catch (error) {
        console.log('⚠️ Erro ao decodificar payload do JWT');
      }
    } else {
      console.log('⚠️ Token não é um JWT padrão');
    }
  } else {
    console.log('❌ NENHUM TOKEN ENCONTRADO!');
  }
  
  console.groupEnd();
  
  return {
    bestToken,
    bestTokenSource,
    localStorageTokens,
    sessionStorageTokens,
    cookieTokens
  };
}

// Função para corrigir problemas
function fixAuthIssues() {
  console.log('');
  console.group('🔧 CORREÇÃO DE PROBLEMAS');
  
  const diagnosis = diagnoseAuthInBrowser();
  
  if (!diagnosis.bestToken) {
    console.log('❌ Não é possível corrigir: nenhum token válido encontrado');
    console.log('💡 Solução: Faça login novamente');
    console.groupEnd();
    return false;
  }
  
  console.log('🔄 Sincronizando token em todos os storages...');
  
  try {
    // Limpar storages primeiro
    const keysToClean = ['auth_token', 'token', 'authToken'];
    
    keysToClean.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Limpar cookies
    keysToClean.forEach(key => {
      document.cookie = \`\${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT\`;
    });
    
    // Configurar token principal
    localStorage.setItem('auth_token', diagnosis.bestToken);
    localStorage.setItem('token', diagnosis.bestToken); // Compatibilidade
    
    // Configurar cookie
    const maxAge = 7 * 24 * 60 * 60; // 7 dias
    document.cookie = \`auth_token=\${diagnosis.bestToken}; path=/; max-age=\${maxAge}; SameSite=Lax\`;
    
    console.log('✅ Token sincronizado com sucesso!');
    
    // Verificar se funcionou
    const verifyToken = localStorage.getItem('auth_token');
    if (verifyToken === diagnosis.bestToken) {
      console.log('✅ Verificação: Token armazenado corretamente');
    } else {
      console.log('❌ Verificação: Falha na sincronização');
      return false;
    }
    
    console.groupEnd();
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao corrigir problemas:', error);
    console.groupEnd();
    return false;
  }
}

// Função para testar API
async function testApiConnection() {
  console.log('');
  console.group('🧪 TESTE DE CONEXÃO COM API');
  
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.log('❌ Nenhum token disponível para teste');
    console.groupEnd();
    return;
  }
  
  try {
    console.log('🔄 Testando conexão com /api/users/stats...');
    
    const response = await fetch('/api/users/stats', {
      method: 'GET',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(\`📡 Status: \${response.status} \${response.statusText}\`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API funcionando corretamente!');
      console.log('📊 Dados recebidos:', data);
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      console.log('❌ Erro na API:', errorData.message);
      
      if (response.status === 401) {
        console.log('🔐 Problema de autenticação detectado');
        console.log('💡 Solução: Faça login novamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
  
  console.groupEnd();
}

// Função principal
async function runFullDiagnosis() {
  console.log('🚀 EXECUTANDO DIAGNÓSTICO COMPLETO...');
  console.log('');
  
  // 1. Diagnosticar
  const diagnosis = diagnoseAuthInBrowser();
  
  // 2. Corrigir se necessário
  if (diagnosis.bestToken) {
    const fixed = fixAuthIssues();
    
    if (fixed) {
      // 3. Testar API
      await testApiConnection();
      
      console.log('');
      console.log('🎉 DIAGNÓSTICO CONCLUÍDO!');
      console.log('💡 Se ainda houver problemas, tente recarregar a página');
    }
  } else {
    console.log('');
    console.log('❌ DIAGNÓSTICO CONCLUÍDO COM PROBLEMAS');
    console.log('💡 Faça login novamente para resolver os problemas');
  }
}

// Executar diagnóstico
runFullDiagnosis();

// Expor funções globalmente
window.diagnoseAuthInBrowser = diagnoseAuthInBrowser;
window.fixAuthIssues = fixAuthIssues;
window.testApiConnection = testApiConnection;
window.runFullDiagnosis = runFullDiagnosis;

console.log('');
console.log('✅ Funções disponíveis globalmente:');
console.log('  - diagnoseAuthInBrowser() - Diagnóstico completo');
console.log('  - fixAuthIssues() - Corrigir problemas encontrados');
console.log('  - testApiConnection() - Testar conexão com API');
console.log('  - runFullDiagnosis() - Executar tudo automaticamente');
`;

  const scriptPath = 'scripts/browser-auth-diagnostic.js';
  
  try {
    fs.writeFileSync(scriptPath, browserScript.trim(), 'utf8');
    console.log(`✅ Script de diagnóstico criado: ${scriptPath}`);
  } catch (error) {
    console.error(`❌ Erro ao criar script: ${error.message}`);
  }
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
  
  console.log('4. 🔍 Para debug no navegador:');
  console.log('   • Abra o DevTools (F12)');
  console.log('   • Vá para a aba Console');
  console.log('   • Cole o código do arquivo scripts/browser-auth-diagnostic.js');
  console.log('   • Execute runFullDiagnosis() para diagnóstico completo');
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
  
  // Criar script de diagnóstico para o navegador
  createBrowserDiagnosticScript();
  
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
  console.log('   • Use scripts/browser-auth-diagnostic.js no navegador');
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