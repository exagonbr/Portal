#!/usr/bin/env node

/**
 * Script para verificar URLs localhost em produção
 * Execute: node check-localhost-urls.js
 */

const fs = require('fs');
const path = require('path');

const LOCALHOST_PATTERNS = [
  /http:\/\/localhost:3000/g,
  /http:\/\/localhost:3001/g,
  /localhost:3000/g,
  /localhost:3001/g
];

const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage'
];

const EXCLUDE_FILES = [
  '.log',
  '.lock',
  '.map',
  'check-localhost-urls.js'
];

function shouldExclude(filePath) {
  return EXCLUDE_DIRS.some(dir => filePath.includes(dir)) ||
         EXCLUDE_FILES.some(ext => filePath.endsWith(ext));
}

function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    LOCALHOST_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        const lineContent = lines[lines.length - 1] + content.substring(match.index).split('\n')[0];
        
        results.push({
          file: filePath,
          line: lineNumber,
          match: match[0],
          context: lineContent.trim()
        });
      }
    });
    
    return results;
  } catch (error) {
    return [];
  }
}

function searchDirectory(dir) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      if (shouldExclude(fullPath)) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        results.push(...searchDirectory(fullPath));
      } else if (stat.isFile()) {
        results.push(...searchInFile(fullPath));
      }
    }
  } catch (error) {
    // Ignorar erros de permissão
  }
  
  return results;
}

function main() {
  console.log('🔍 Procurando por URLs localhost em produção...\n');
  
  const results = searchDirectory('.');
  
  if (results.length === 0) {
    console.log('✅ Nenhuma URL localhost encontrada!');
    return;
  }
  
  console.log(`❌ Encontradas ${results.length} ocorrências de localhost:\n`);
  
  const groupedResults = {};
  results.forEach(result => {
    if (!groupedResults[result.file]) {
      groupedResults[result.file] = [];
    }
    groupedResults[result.file].push(result);
  });
  
  Object.entries(groupedResults).forEach(([file, matches]) => {
    console.log(`📄 ${file}:`);
    matches.forEach(match => {
      console.log(`   Linha ${match.line}: ${match.match}`);
      console.log(`   Contexto: ${match.context}`);
      console.log('');
    });
  });
  
  console.log('\n🔧 Ações recomendadas:');
  console.log('1. Substitua URLs localhost por URLs de produção');
  console.log('2. Use variáveis de ambiente quando possível');
  console.log('3. Implemente detecção automática de ambiente');
}

if (require.main === module) {
  main();
}