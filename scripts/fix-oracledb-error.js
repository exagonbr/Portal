#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Resolvendo problema do módulo oracledb...\n');

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

// 1. Limpar cache do Next.js
removeDirectory('.next', 'Limpando cache do Next.js (.next)');
removeDirectory('node_modules/.cache', 'Limpando cache do Node.js');

// 2. Limpar cache do npm
runCommand('npm cache clean --force', 'Limpando cache do npm');

// 3. Reinstalar dependências (opcional)
console.log('🤔 Deseja reinstalar as dependências? (Isso pode demorar)');
console.log('   Se sim, execute: npm install');
console.log('   Se não, apenas execute: npm run build\n');

// 4. Verificar configurações
console.log('📝 Verificando configurações...');

// Verificar se o arquivo next.config.ts existe
if (fs.existsSync('next.config.ts')) {
  console.log('✅ next.config.ts encontrado');
} else {
  console.log('❌ next.config.ts não encontrado');
}

// Verificar se o arquivo webpack.config.js existe
if (fs.existsSync('webpack.config.js')) {
  console.log('✅ webpack.config.js encontrado');
} else {
  console.log('❌ webpack.config.js não encontrado');
}

console.log('\n🎉 Limpeza concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Execute: npm run build');
console.log('2. Se ainda houver erro, execute: npm install');
console.log('3. Depois execute novamente: npm run build');
console.log('\n💡 O problema do oracledb deve estar resolvido após o build!'); 