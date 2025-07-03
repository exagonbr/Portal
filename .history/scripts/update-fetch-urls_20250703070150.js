#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Padrões para encontrar URLs hardcoded
const patterns = [
  // URLs completas
  /fetch\s*\(\s*['"`]https?:\/\/[^'"`]+['"`]/g,
  /fetch\s*\(\s*['"`]http:\/\/localhost:\d+[^'"`]*['"`]/g,
  /fetch\s*\(\s*['"`]https:\/\/portal\.sabercon\.com\.br[^'"`]*['"`]/g,
  
  // Variáveis com URLs hardcoded
  /const\s+\w+\s*=\s*['"`]https?:\/\/[^'"`]+['"`]/g,
  /let\s+\w+\s*=\s*['"`]https?:\/\/[^'"`]+['"`]/g,
  
  // Template literals com URLs
  /\$\{['"`]https?:\/\/[^}]+\}/g,
  
  // process.env com fallback hardcoded
  /process\.env\.\w+\s*\|\|\s*['"`]https?:\/\/[^'"`]+['"`]/g,
];

// Arquivos para ignorar
const ignorePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/scripts/**',
  '**/test/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/config/urls.ts', // Não modificar o arquivo de configuração
];

// Função para processar arquivo
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changes = [];

  // Verificar se já importa a configuração de URLs
  const hasUrlImport = content.includes('@/config/urls');
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Pular se for uma URL externa (não do projeto)
        if (!match.includes('localhost') && 
            !match.includes('portal.sabercon.com.br') &&
            !match.includes('sabercon.com.br/api')) {
          return;
        }

        changes.push({
          file: filePath,
          match: match,
          line: getLineNumber(content, match)
        });
        modified = true;
      });
    }
  });

  if (modified && !hasUrlImport) {
    // Adicionar import se necessário
    const importStatement = "import { getApiUrl, buildApiUrl } from '@/config/urls';\n";
    
    // Encontrar onde adicionar o import
    const firstImportIndex = content.indexOf('import ');
    if (firstImportIndex !== -1) {
      // Adicionar após os imports existentes
      const endOfImports = content.indexOf('\n\n', firstImportIndex);
      if (endOfImports !== -1) {
        content = content.slice(0, endOfImports) + '\n' + importStatement + content.slice(endOfImports);
      }
    } else {
      // Adicionar no início do arquivo
      content = importStatement + '\n' + content;
    }
  }

  return { content, changes, modified };
}

// Função para obter número da linha
function getLineNumber(content, match) {
  const lines = content.substring(0, content.indexOf(match)).split('\n');
  return lines.length;
}

// Função principal
async function main() {
  console.log('🔍 Procurando arquivos com URLs hardcoded...\n');

  // Encontrar todos os arquivos TypeScript e JavaScript
  const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
    ignore: ignorePatterns
  });

  let totalChanges = 0;
  const allChanges = [];

  files.forEach(file => {
    const { changes } = processFile(file);
    if (changes.length > 0) {
      totalChanges += changes.length;
      allChanges.push(...changes);
    }
  });

  if (totalChanges === 0) {
    console.log('✅ Nenhuma URL hardcoded encontrada!');
    return;
  }

  console.log(`📊 Encontradas ${totalChanges} URLs hardcoded em ${allChanges.length} arquivos:\n`);

  // Agrupar por arquivo
  const changesByFile = allChanges.reduce((acc, change) => {
    if (!acc[change.file]) {
      acc[change.file] = [];
    }
    acc[change.file].push(change);
    return acc;
  }, {});

  // Mostrar resumo
  Object.entries(changesByFile).forEach(([file, changes]) => {
    console.log(`\n📄 ${file}:`);
    changes.forEach(change => {
      console.log(`   Linha ${change.line}: ${change.match.substring(0, 80)}...`);
    });
  });

  console.log('\n⚠️  Para atualizar automaticamente, execute: node scripts/update-fetch-urls.js --fix');
  
  // Se --fix foi passado, aplicar as correções
  if (process.argv.includes('--fix')) {
    console.log('\n🔧 Aplicando correções...');
    
    Object.keys(changesByFile).forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      
      // Substituições específicas
      content = content
        // URLs completas para API
        .replace(/fetch\s*\(\s*['"`]https:\/\/portal\.sabercon\.com\.br\/api([^'"`]*)/g, 'fetch(buildApiUrl("$1"')
        .replace(/fetch\s*\(\s*['"`]http:\/\/localhost:3001\/api([^'"`]*)/g, 'fetch(buildApiUrl("$1"')
        
        // Variáveis com URLs
        .replace(/const\s+apiUrl\s*=\s*process\.env\.\w+\s*\|\|\s*['"`][^'"`]+['"`]/g, 'const apiUrl = getApiUrl()')
        .replace(/const\s+backendUrl\s*=\s*['"`][^'"`]+['"`]/g, 'const backendUrl = getApiUrl()')
        
        // Template literals
