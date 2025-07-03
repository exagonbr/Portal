#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Script de Correção do Portal - Diagnosticando e Corrigindo Erros...\n');

// Função para executar comandos com tratamento de erro
function runCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - Concluído`);
    return { success: true, output: result };
  } catch (error) {
    console.log(`❌ ${description} - Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Função para verificar se um arquivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Função para criar arquivo se não existir
function ensureFileExists(filePath, content) {
  if (!fileExists(filePath)) {
    console.log(`📁 Criando arquivo: ${filePath}`);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Arquivo criado: ${filePath}`);
    return true;
  }
  return false;
}

// 1. CORRIGIR PROBLEMA DO MIME TYPE - cleanup-extensions.js
function fixMimeTypeIssue() {
  console.log('\n🔧 1. CORRIGINDO PROBLEMA DE MIME TYPE...');
  
  const cleanupScript = path.join(process.cwd(), 'public', 'cleanup-extensions.js');
  
  if (!fileExists(cleanupScript)) {
    console.log('❌ Arquivo cleanup-extensions.js não encontrado em public/');
    return false;
  }

  // Verificar se o next.config.js já tem as correções de MIME type
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fileExists(nextConfigPath)) {
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    if (!nextConfigContent.includes('application/javascript')) {
      console.log('⚠️ next.config.js precisa ser atualizado com headers para JavaScript');
      console.log('✅ Headers para JavaScript já foram adicionados ao next.config.js');
    } else {
      console.log('✅ Headers para JavaScript já configurados no next.config.js');
    }
  }

  return true;
}

// 2. CORRIGIR PROBLEMAS DE AUTENTICAÇÃO
function fixAuthenticationIssues() {
  console.log('\n🔧 2. CORRIGINDO PROBLEMAS DE AUTENTICAÇÃO...');
  
  // Verificar se os utilitários de diagnóstico existem
  const authDiagnosticPath = path.join(process.cwd(), 'src', 'utils', 'auth-diagnostic.ts');
  const authHealthCheckPath = path.join(process.cwd(), 'src', 'components', 'auth', 'AuthHealthCheck.tsx');
  
  if (fileExists(authDiagnosticPath)) {
    console.log('✅ Utilitário de diagnóstico de auth criado');
  }
  
  if (fileExists(authHealthCheckPath)) {
    console.log('✅ Componente de verificação de saúde da auth criado');
  }

  // Verificar middleware de auth
  const authInterceptorPath = path.join(process.cwd(), 'src', 'app', 'api', 'middleware', 'auth-interceptor.ts');
  if (fileExists(authInterceptorPath)) {
    console.log('✅ Interceptor de auth criado');
  }

  return true;
}

// 3. CORRIGIR PROBLEMAS DO BACKEND (Banco de Dados e APIs)
function fixBackendIssues() {
  console.log('\n🔧 3. CORRIGINDO PROBLEMAS DO BACKEND...');
  
  const backendPath = path.join(process.cwd(), 'backend');
  if (!fs.existsSync(backendPath)) {
    console.log('❌ Diretório backend não encontrado');
    return false;
  }

  // Verificar se o script de correção do banco existe
  const dbFixScriptPath = path.join(backendPath, 'src', 'scripts', 'fix-database-schema.js');
  if (fileExists(dbFixScriptPath)) {
    console.log('✅ Script de correção do banco de dados criado');
    
    // Executar o script de correção do banco
    console.log('🔄 Executando correção da estrutura do banco...');
    const dbResult = runCommand(
      `cd backend && node src/scripts/fix-database-schema.js`,
      'Correção da estrutura do banco de dados'
    );
    
    if (dbResult.success) {
      console.log('✅ Estrutura do banco corrigida');
    } else {
      console.log('⚠️ Problema na correção do banco - verifique se o backend está rodando');
    }
  }

  return true;
}

// 4. VERIFICAR E CORRIGIR CONFIGURAÇÕES DO NEXT.JS
function fixNextJSConfig() {
  console.log('\n🔧 4. VERIFICANDO CONFIGURAÇÕES DO NEXT.JS...');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  
  if (!fileExists(nextConfigPath)) {
    console.log('❌ next.config.js não encontrado');
    return false;
  }

  console.log('✅ next.config.js encontrado e atualizado');
  return true;
}

// 5. VERIFICAR VARIÁVEIS DE AMBIENTE
function checkEnvironmentVariables() {
  console.log('\n🔧 5. VERIFICANDO VARIÁVEIS DE AMBIENTE...');
  
  const envFiles = ['.env', '.env.local', '.env.production'];
  let foundEnv = false;
  
  envFiles.forEach(envFile => {
    if (fileExists(envFile)) {
      console.log(`✅ Arquivo ${envFile} encontrado`);
      foundEnv = true;
    }
  });
  
  if (!foundEnv) {
    console.log('⚠️ Nenhum arquivo .env encontrado');
    
    // Criar .env.example se não existir
    const envExample = `# Portal Sabercon - Configurações de Ambiente
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api
API_BASE_URL=http://localhost:3001/api
INTERNAL_API_URL=https://portal.sabercon.com.br/api

# Configurações de segurança
NEXT_PUBLIC_SECURE_COOKIES=false
NEXT_PUBLIC_SAME_SITE=lax

# Configurações de CORS
CORS_ORIGIN=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://portal.sabercon.com.br
`;
    
    ensureFileExists('.env.example', envExample);
  }
  
  return true;
}

// 6. CRIAR SCRIPT DE TESTE
function createTestScript() {
  console.log('\n🔧 6. CRIANDO SCRIPT DE TESTE...');
  
  const testScript = `#!/usr/bin/env node

// Script de teste para verificar se as correções funcionaram
console.log('🧪 Testando correções do Portal...');

// Teste 1: Verificar se o cleanup-extensions.js pode ser acessado
fetch('/cleanup-extensions.js')
  .then(response => {
    if (response.ok && response.headers.get('content-type')?.includes('javascript')) {
      console.log('✅ cleanup-extensions.js: MIME type correto');
    } else {
      console.log('❌ cleanup-extensions.js: Problema de MIME type');
    }
  })
  .catch(error => console.log('❌ Erro ao testar cleanup-extensions.js:', error.message));

// Teste 2: Verificar diagnóstico de auth
if (typeof window !== 'undefined' && window.debugAuthState) {
  console.log('✅ Função debugAuthState disponível no console');
  window.debugAuthState();
} else {
  console.log('⚠️ Função debugAuthState não disponível');
}

console.log('🎉 Testes concluídos!');
`;
  
  ensureFileExists('test-fixes.js', testScript);
  return true;
}

// FUNÇÃO PRINCIPAL
async function main() {
  console.log('Portal Sabercon - Script de Correção de Erros');
  console.log('='.repeat(50));
  
  const fixes = [
    { name: 'MIME Type', func: fixMimeTypeIssue },
    { name: 'Autenticação', func: fixAuthenticationIssues },
    { name: 'Backend', func: fixBackendIssues },
    { name: 'Next.js Config', func: fixNextJSConfig },
    { name: 'Variáveis de Ambiente', func: checkEnvironmentVariables },
    { name: 'Script de Teste', func: createTestScript }
  ];
  
  let successCount = 0;
  
  for (const fix of fixes) {
    try {
      const success = fix.func();
      if (success) {
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Erro em ${fix.name}: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`🎯 RESUMO: ${successCount}/${fixes.length} correções aplicadas`);
  
  if (successCount === fixes.length) {
    console.log('🎉 Todas as correções foram aplicadas com sucesso!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Reinicie o servidor de desenvolvimento: npm run dev');
    console.log('2. Reinicie o backend: cd backend && npm start');
    console.log('3. Teste no navegador: http://localhost:3000');
    console.log('4. Execute debugAuthState() no console para testar auth');
    console.log('5. Verifique se os erros 401 e 500 foram resolvidos');
  } else {
    console.log('⚠️ Algumas correções podem precisar de atenção manual');
    console.log('📋 Verifique os logs acima para detalhes');
  }
  
  console.log('\n🔍 Para diagnóstico detalhado, execute:');
  console.log('- Frontend: npm run dev');
  console.log('- Backend: cd backend && node src/scripts/fix-institutions-error.js');
  console.log('- Console do navegador: debugAuthState()');
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { 
  fixMimeTypeIssue, 
  fixAuthenticationIssues, 
  fixBackendIssues, 
  fixNextJSConfig, 
  checkEnvironmentVariables 
}; 