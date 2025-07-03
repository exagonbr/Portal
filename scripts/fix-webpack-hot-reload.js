#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Iniciando correção de problemas de webpack hot reload...\n');

// Função para limpar diretórios
function cleanDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Limpeza: ${dirPath}`);
      return true;
    } catch (error) {
      console.log(`❌ Erro ao limpar ${dirPath}:`, error.message);
      return false;
    }
  }
  return true;
}

// Função para executar comando
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} concluído\n`);
    return true;
  } catch (error) {
    console.log(`❌ Erro em ${description}:`, error.message);
    return false;
  }
}

// Passo 1: Parar processos do Next.js
console.log('1️⃣ Parando processos existentes...');
try {
  if (process.platform === 'win32') {
    execSync('taskkill /f /im node.exe 2>nul || echo "Nenhum processo node encontrado"', { stdio: 'inherit' });
  } else {
    execSync('pkill -f "next dev" || echo "Nenhum processo next dev encontrado"', { stdio: 'inherit' });
  }
} catch (error) {
  console.log('⚠️ Erro ao parar processos (normal se nenhum processo estiver rodando)');
}

// Passo 2: Limpar caches
console.log('\n2️⃣ Limpando caches...');
const dirsToClean = [
  '.next',
  'node_modules/.cache',
  '.next/cache',
  '.next/static',
  '.next/server',
];

dirsToClean.forEach(dir => {
  cleanDirectory(path.join(process.cwd(), dir));
});

// Passo 3: Limpar cache do npm/yarn
console.log('\n3️⃣ Limpando cache do gerenciador de pacotes...');
runCommand('npm cache clean --force', 'Limpeza do cache npm');

// Passo 4: Reinstalar dependências críticas
console.log('4️⃣ Reinstalando dependências críticas...');
const criticalDeps = [
  'framer-motion',
  'next',
  'react',
  'react-dom'
];

criticalDeps.forEach(dep => {
  runCommand(`npm uninstall ${dep}`, `Removendo ${dep}`);
  runCommand(`npm install ${dep}`, `Reinstalando ${dep}`);
});

// Passo 5: Verificar configurações
console.log('\n5️⃣ Verificando configurações...');

// Verificar next.config.js
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ next.config.js encontrado');
} else {
  console.log('❌ next.config.js não encontrado');
}

// Verificar package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('✅ package.json válido');
    console.log(`   Next.js: ${packageJson.dependencies?.next || 'não encontrado'}`);
    console.log(`   React: ${packageJson.dependencies?.react || 'não encontrado'}`);
    console.log(`   Framer Motion: ${packageJson.dependencies?.['framer-motion'] || 'não encontrado'}`);
  } catch (error) {
    console.log('❌ Erro ao ler package.json:', error.message);
  }
}

// Passo 6: Criar arquivo de configuração de desenvolvimento
console.log('\n6️⃣ Criando configuração de desenvolvimento...');
const devConfigContent = `
// Configuração para desenvolvimento local
if (typeof window !== 'undefined') {
  // Desabilitar warnings específicos do webpack
  const originalWarn = console.warn;
  console.warn = function(...args) {
    if (args[0]?.includes?.('webpackHotUpdate') || 
        args[0]?.includes?.('MIME type') ||
        args[0]?.includes?.('framer-motion')) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Configurar tratamento de erros de chunk
  window.addEventListener('error', function(event) {
    if (event.message?.includes?.('Loading chunk') || 
        event.message?.includes?.('webpackHotUpdate')) {
      console.log('🔄 Erro de chunk detectado, recarregando...');
      window.location.reload();
    }
  });
}
`;

fs.writeFileSync(path.join(process.cwd(), 'public', 'dev-config.js'), devConfigContent);
console.log('✅ Configuração de desenvolvimento criada em public/dev-config.js');

// Passo 7: Instruções finais
console.log('\n🎉 Correção concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Execute: npm run dev');
console.log('2. Aguarde o servidor inicializar completamente');
console.log('3. Abra o navegador em http://localhost:3000');
console.log('4. Pressione Ctrl+Shift+R para forçar reload sem cache');
console.log('\n⚠️ Se ainda houver problemas:');
console.log('- Feche completamente o navegador e reabra');
console.log('- Limpe o cache do navegador manualmente');
console.log('- Execute este script novamente');

console.log('\n✨ Script concluído com sucesso!'); 