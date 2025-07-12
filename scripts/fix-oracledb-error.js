#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Resolvendo problema do módulo oracledb e outros drivers de banco...\n');

// Função para executar comandos
function runCommand(command, description) {
  console.log(`📋 ${description}`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - Concluído\n`);
  } catch (error) {
    console.log(`⚠️  ${description} - Erro (continuando...)\n`);
  }
}

// Função para remover diretórios
function removeDirectory(dirPath, description) {
  console.log(`🗑️  ${description}`);
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ ${description} - Removido\n`);
    } else {
      console.log(`ℹ️  ${description} - Não encontrado\n`);
    }
  } catch (error) {
    console.log(`⚠️  ${description} - Erro: ${error.message}\n`);
  }
}

// 1. Limpar cache do Next.js e Node.js
console.log('🧹 ETAPA 1: Limpando caches...\n');
removeDirectory('.next', 'Limpando cache do Next.js (.next)');
removeDirectory('build', 'Limpando diretório de build');
removeDirectory('node_modules/.cache', 'Limpando cache do Node.js');
removeDirectory('.npm', 'Limpando cache local do npm');

// 2. Limpar cache do npm
runCommand('npm cache clean --force', 'Limpando cache global do npm');

// 3. Verificar configurações
console.log('📝 ETAPA 2: Verificando configurações...\n');

// Verificar se o arquivo next.config.js existe e tem as configurações corretas
if (fs.existsSync('next.config.js')) {
  console.log('✅ next.config.js encontrado');
  
  const configContent = fs.readFileSync('next.config.js', 'utf8');
  if (configContent.includes('oracledb: false')) {
    console.log('✅ Configuração do oracledb encontrada');
  } else {
    console.log('❌ Configuração do oracledb NÃO encontrada');
    console.log('   Execute: npm run build para aplicar as novas configurações');
  }
} else {
  console.log('❌ next.config.js não encontrado');
}

// Verificar se o arquivo webpack.config.js existe
if (fs.existsSync('webpack.config.js')) {
  console.log('✅ webpack.config.js encontrado');
} else {
  console.log('ℹ️  webpack.config.js não encontrado (opcional)');
}

// Verificar se existe arquivo de configuração do banco seguro
if (fs.existsSync('src/lib/database-safe.ts')) {
  console.log('✅ database-safe.ts encontrado');
} else {
  console.log('❌ database-safe.ts não encontrado');
}

// 4. Verificar dependências problemáticas
console.log('\n📦 ETAPA 3: Verificando dependências...\n');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const problematicDeps = ['oracledb', 'mysql', 'sqlite3', 'better-sqlite3', 'tedious'];
const foundProblems = [];

problematicDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    foundProblems.push(`dependencies.${dep}`);
  }
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    foundProblems.push(`devDependencies.${dep}`);
  }
});

if (foundProblems.length > 0) {
  console.log('❌ Dependências problemáticas encontradas:');
  foundProblems.forEach(dep => console.log(`   - ${dep}`));
  console.log('\n💡 Se você não está usando esses bancos, considere removê-los.');
} else {
  console.log('✅ Nenhuma dependência problemática encontrada');
}

// 5. Verificar variáveis de ambiente
console.log('\n🔐 ETAPA 4: Verificando configuração do banco...\n');

if (fs.existsSync('.env.local')) {
  console.log('✅ .env.local encontrado');
  const envContent = fs.readFileSync('.env.local', 'utf8');
  if (envContent.includes('DB_HOST')) {
    console.log('✅ Configurações de banco encontradas');
  } else {
    console.log('⚠️  Configurações de banco podem estar ausentes');
  }
} else {
  console.log('⚠️  .env.local não encontrado');
}

console.log('\n🎉 ETAPA 5: Limpeza concluída!\n');
console.log('📋 Próximos passos recomendados:\n');
console.log('1. 🔨 Execute: npm run build');
console.log('2. 🚀 Se ainda houver erro, execute: npm install');
console.log('3. 🔨 Depois execute novamente: npm run build');
console.log('4. 🌐 Para desenvolvimento: npm run dev\n');
console.log('💡 O problema do oracledb deve estar resolvido após o build!');
console.log('🔍 Se persistir, verifique se está usando apenas PostgreSQL nas configurações.'); 