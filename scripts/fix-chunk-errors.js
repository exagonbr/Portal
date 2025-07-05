#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Script para resolver problemas de chunk loading...\n');

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

// 1. Limpar cache do Next.js
console.log('📦 Limpando cache do Next.js...');
deleteDirectory('.next');

// 2. Limpar node_modules (opcional)
const shouldCleanNodeModules = process.argv.includes('--full');
if (shouldCleanNodeModules) {
  console.log('📦 Limpando node_modules...');
  deleteDirectory('node_modules');
  deleteDirectory('package-lock.json');
}

// 3. Limpar cache do npm/yarn
console.log('📦 Limpando cache do gerenciador de pacotes...');
try {
  runCommand('npm cache clean --force', 'Limpeza do cache npm');
} catch (error) {
  console.log('⚠️ npm não encontrado, tentando yarn...');
  try {
    runCommand('yarn cache clean', 'Limpeza do cache yarn');
  } catch (yarnError) {
    console.log('⚠️ Nenhum gerenciador de pacotes encontrado');
  }
}

// 4. Reinstalar dependências se necessário
if (shouldCleanNodeModules) {
  console.log('📦 Reinstalando dependências...');
  if (fs.existsSync('yarn.lock')) {
    runCommand('yarn install', 'Instalação com yarn');
  } else {
    runCommand('npm install', 'Instalação com npm');
  }
}

// 5. Limpar cache do TypeScript
console.log('📦 Limpando cache do TypeScript...');
deleteDirectory('tsconfig.tsbuildinfo');

// 6. Criar arquivo de configuração temporário para desenvolvimento
const tempConfigPath = '.env.local';
const tempConfig = `
# Configurações temporárias para resolver problemas de chunk
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS="--max-old-space-size=4096"
`;

if (!fs.existsSync(tempConfigPath)) {
  fs.writeFileSync(tempConfigPath, tempConfig.trim());
  console.log('✅ Arquivo .env.local criado com configurações otimizadas');
}

// 7. Verificar arquivos problemáticos
console.log('🔍 Verificando arquivos problemáticos...');

const problematicFiles = [
  'src/providers/SimpleProviders.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/utils/chunk-error-handler.ts',
  'next.config.js'
];

problematicFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} não encontrado`);
  }
});

console.log('\n🎉 Limpeza concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Execute: npm run dev (ou yarn dev)');
console.log('2. Abra o navegador em modo incógnito');
console.log('3. Pressione Ctrl+Shift+R para recarregar com cache limpo');
console.log('4. Se o problema persistir, execute: node scripts/fix-chunk-errors.js --full');

console.log('\n💡 Dicas adicionais:');
console.log('- Limpe o cache do navegador (F12 > Application > Storage > Clear Storage)');
console.log('- Desative extensões do navegador temporariamente');
console.log('- Verifique se há atualizações do Node.js disponíveis'); 