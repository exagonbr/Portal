#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

/**
 * Script para limpar caches do Next.js e resolver problemas de chunk loading
 * Execute com: node scripts/clear-cache.js
 */

const projectRoot = path.resolve(__dirname, '..');

// Diretórios para limpar
const CACHE_DIRS = [
  '.next/cache',
  'node_modules/.cache',
];

// Função para limpar um diretório
function clearDirectory(dir) {
  const fullPath = path.join(process.cwd(), dir);
  
  try {
    if (fs.existsSync(fullPath)) {
      console.log(`🗑️  Limpando ${dir}...`);
      rimraf.sync(fullPath);
      console.log(`✅ ${dir} limpo com sucesso`);
    } else {
      console.log(`ℹ️  ${dir} não existe`);
    }
  } catch (error) {
    console.error(`❌ Erro ao limpar ${dir}:`, error);
  }
}

// Função principal
function clearCache() {
  console.log('🧹 Iniciando limpeza de cache...\n');

  // Limpar cada diretório
  CACHE_DIRS.forEach(clearDirectory);

  console.log('\n✨ Limpeza de cache concluída!');
}

// Executar limpeza
clearCache(); 