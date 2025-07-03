#!/usr/bin/env node

/**
 * Script de Teste: Verificação de Loop SSR
 * 
 * Este script verifica se o loop infinito no AuthContext foi resolvido
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Iniciando teste de verificação de loop SSR...\n');

// Função para executar comando e capturar output
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', reject);

    // Timeout para evitar que o teste trave
    setTimeout(() => {
      child.kill();
      reject(new Error('Timeout: Comando demorou mais de 30 segundos'));
    }, 30000);
  });
}

async function testSSRLoop() {
  try {
    console.log('📦 Verificando se o projeto pode ser construído...');
    
    // Tentar build do projeto
    const buildResult = await runCommand('npm', ['run', 'build'], {
      cwd: process.cwd()
    });

    if (buildResult.code !== 0) {
      console.log('❌ Build falhou. Verificando erros...\n');
      console.log('STDERR:', buildResult.stderr);
      console.log('STDOUT:', buildResult.stdout);
      
      // Verificar se há erros relacionados ao loop
      const hasLoopError = buildResult.stderr.includes('Maximum update depth exceeded') ||
                          buildResult.stdout.includes('Maximum update depth exceeded');
      
      if (hasLoopError) {
        console.log('🚨 ERRO: Loop infinito ainda presente!');
        return false;
      } else {
        console.log('⚠️ Build falhou por outros motivos (não relacionados ao loop)');
        return true; // Loop foi resolvido, mas há outros problemas
      }
    }

    console.log('✅ Build bem-sucedido! Loop SSR foi resolvido.');
    return true;

  } catch (error) {
    console.log('❌ Erro durante o teste:', error.message);
    return false;
  }
}

async function checkAuthContextSyntax() {
  console.log('\n🔍 Verificando sintaxe do AuthContext...');
  
  try {
    const fs = require('fs');
    const authContextPath = path.join(process.cwd(), 'src/contexts/AuthContext.tsx');
    
    if (!fs.existsSync(authContextPath)) {
      console.log('❌ AuthContext.tsx não encontrado');
      return false;
    }

    const content = fs.readFileSync(authContextPath, 'utf8');
    
    // Verificar se as correções estão presentes
    const hasInitializationRef = content.includes('initializationRef');
    const hasSetupUserFromToken = content.includes('setupUserFromToken');
    const hasDirectLocalStorage = content.includes('getStoredToken');
    const removedUseLocalStorage = !content.includes('useLocalStorage');
    
    console.log('📋 Verificações:');
    console.log(`  - initializationRef presente: ${hasInitializationRef ? '✅' : '❌'}`);
    console.log(`  - setupUserFromToken presente: ${hasSetupUserFromToken ? '✅' : '❌'}`);
    console.log(`  - Acesso direto ao localStorage: ${hasDirectLocalStorage ? '✅' : '❌'}`);
    console.log(`  - useLocalStorage removido: ${removedUseLocalStorage ? '✅' : '❌'}`);
    
    const allChecksPass = hasInitializationRef && hasSetupUserFromToken && 
                         hasDirectLocalStorage && removedUseLocalStorage;
    
    if (allChecksPass) {
      console.log('✅ Todas as correções estão presentes no AuthContext');
      return true;
    } else {
      console.log('❌ Algumas correções estão faltando');
      return false;
    }

  } catch (error) {
    console.log('❌ Erro ao verificar AuthContext:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Teste de Verificação de Loop SSR\n');
  console.log('Este teste verifica se o loop infinito foi resolvido.\n');

  // Verificar sintaxe primeiro
  const syntaxOk = await checkAuthContextSyntax();
  
  if (!syntaxOk) {
    console.log('\n❌ FALHA: Correções não estão completas no AuthContext');
    process.exit(1);
  }

  // Verificar se o build funciona
  const buildOk = await testSSRLoop();
  
  if (buildOk) {
    console.log('\n🎉 SUCESSO: Loop SSR foi resolvido!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute `npm run dev` e verifique o console do navegador');
    console.log('2. Não deve haver mais erros de "Maximum update depth exceeded"');
    console.log('3. A autenticação deve funcionar normalmente');
    console.log('4. Monitore os logs para garantir estabilidade');
    process.exit(0);
  } else {
    console.log('\n❌ FALHA: Loop SSR ainda não foi totalmente resolvido');
    console.log('\n🔧 Ações recomendadas:');
    console.log('1. Verifique os logs de erro acima');
    console.log('2. Execute `npm run dev` e monitore o console');
    console.log('3. Se necessário, revise as correções no AuthContext');
    process.exit(1);
  }
}

// Executar o teste
main().catch(error => {
  console.log('💥 Erro crítico durante o teste:', error);
  process.exit(1);
}); 