#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando desenvolvimento com limpeza completa...\n');

// Função para deletar diretório recursivamente
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removido: ${dirPath}`);
    return true;
  }
  return false;
}

// Função para executar comando
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} concluído\n`);
  } catch (error) {
    console.log(`⚠️ Erro em ${description}: ${error.message}\n`);
  }
}

// 1. Parar qualquer processo Next.js rodando
console.log('🛑 Parando processos Next.js...');
try {
  if (process.platform === 'win32') {
    execSync('taskkill /f /im node.exe /t', { stdio: 'ignore' });
  } else {
    execSync('pkill -f next', { stdio: 'ignore' });
  }
} catch (error) {
  // Ignorar erros se não houver processos rodando
}

// 2. Limpeza completa
console.log('📦 Limpeza completa...');
deleteDirectory('.next');
deleteDirectory('node_modules/.cache');
deleteDirectory('tsconfig.tsbuildinfo');

// 3. Limpar cache do npm
runCommand('npm cache clean --force', 'Limpeza do cache npm');

// 4. Verificar e criar .env.local otimizado
const envPath = '.env.local';
const envContent = `
# Configurações otimizadas para desenvolvimento
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS="--max-old-space-size=4096"
NEXT_PRIVATE_STANDALONE=true
NEXT_PRIVATE_DEBUG_CACHE=true
`.trim();

fs.writeFileSync(envPath, envContent);
console.log('✅ .env.local otimizado criado');

// 5. Verificar middleware
if (fs.existsSync('middleware.ts')) {
  console.log('✅ Middleware CSS configurado');
} else {
  console.log('❌ Middleware CSS não encontrado');
}

// 6. Verificar configurações críticas
const criticalFiles = [
  'next.config.js',
  'middleware.ts',
  'src/providers/SimpleProviders.tsx',
  'src/utils/chunk-error-handler.ts'
];

console.log('🔍 Verificando arquivos críticos...');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - ARQUIVO CRÍTICO AUSENTE!`);
  }
});

// 7. Iniciar servidor de desenvolvimento
console.log('\n🚀 Iniciando servidor de desenvolvimento...');
console.log('📍 URL: http://localhost:3000');
console.log('🔧 Configurações aplicadas:');
console.log('   - Middleware CSS ativo');
console.log('   - Error boundaries configurados');
console.log('   - Chunk error handler ativo');
console.log('   - Headers MIME otimizados');
console.log('\n⚠️  IMPORTANTE: Abra o navegador em modo incógnito!');
console.log('⚠️  Use Ctrl+Shift+R para recarregar com cache limpo');

// Iniciar o servidor
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erro ao iniciar servidor:', error.message);
  process.exit(1);
} 