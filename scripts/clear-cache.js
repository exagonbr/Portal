#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para limpar caches do Next.js e resolver problemas de chunk loading
 * Execute com: node scripts/clear-cache.js
 */

const projectRoot = path.resolve(__dirname, '..');

const pathsToClean = [
  '.next',
  'node_modules/.cache',
  '.swc',
  'dist',
  'build',
];

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`🗑️  Removendo: ${dirPath}`);
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removido: ${dirPath}`);
    } catch (error) {
      console.log(`❌ Erro ao remover ${dirPath}:`, error.message);
    }
  } else {
    console.log(`⏭️  Não encontrado: ${dirPath}`);
  }
}

function clearNextCache() {
  console.log('🧹 Iniciando limpeza de cache...\n');
  
  pathsToClean.forEach(relativePath => {
    const fullPath = path.join(projectRoot, relativePath);
    removeDirectory(fullPath);
  });
  
  console.log('\n🎉 Limpeza concluída!');
  console.log('\n📝 Próximos passos:');
  console.log('1. npm install (se necessário)');
  console.log('2. npm run dev (para desenvolvimento)');
  console.log('3. npm run build (para produção)');
}

// Executar limpeza
clearNextCache(); 