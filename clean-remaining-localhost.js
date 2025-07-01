#!/usr/bin/env node

/**
 * Script para limpar URLs localhost restantes (excluindo histórico do VSCode)
 */

const fs = require('fs');
const path = require('path');

const PRODUCTION_DOMAIN = 'https://portal.sabercon.com.br';

const URL_REPLACEMENTS = [
  {
    pattern: /http:\/\/localhost:3000/g,
    replacement: PRODUCTION_DOMAIN
  },
  {
    pattern: /http:\/\/localhost:3001\/api/g,
    replacement: `${PRODUCTION_DOMAIN}/api`
  },
  {
    pattern: /http:\/\/localhost:3001/g,
    replacement: `${PRODUCTION_DOMAIN}/api`
  },
  {
    pattern: /https:\/\/localhost:3000/g,
    replacement: PRODUCTION_DOMAIN
  },
  {
    pattern: /https:\/\/localhost:3001/g,
    replacement: `${PRODUCTION_DOMAIN}/api`
  }
];

const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.history' // Excluir histórico do VSCode - não afeta produção
];

const EXCLUDE_FILES = [
  '.log',
  '.lock',
  '.map',
  'check-localhost-urls.js',
  'fix-production-urls.js',
  'clean-remaining-localhost.js'
];

// Arquivos importantes que devem ser corrigidos
const IMPORTANT_FILES = [
  'fix-production-urls.js',
  'API_ERROR_FIX_SUMMARY.md',
  'OTIMIZACAO_COMUNICACAO_DIRETA.md'
];

function shouldExclude(filePath) {
  // Não excluir arquivos importantes
  if (IMPORTANT_FILES.some(file => filePath.endsWith(file))) {
    return false;
  }
  
  return EXCLUDE_DIRS.some(dir => filePath.includes(dir)) ||
         EXCLUDE_FILES.some(ext => filePath.endsWith(ext));
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    URL_REPLACEMENTS.forEach(({ pattern, replacement }) => {
      if (pattern.test(newContent)) {
        newContent = newContent.replace(pattern, replacement);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.log(`Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const results = {
    processed: 0,
    changed: 0,
    errors: 0
  };

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);

      if (shouldExclude(fullPath)) {
        continue;
      }

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const subResults = processDirectory(fullPath);
        results.processed += subResults.processed;
        results.changed += subResults.changed;
        results.errors += subResults.errors;
      } else if (stat.isFile()) {
        results.processed++;
        try {
          if (processFile(fullPath)) {
            results.changed++;
            console.log(`✅ Atualizado: ${fullPath}`);
          }
        } catch (error) {
          results.errors++;
          console.log(`❌ Erro em: ${fullPath}`, error.message);
        }
      }
    }
  } catch (error) {
    results.errors++;
    console.log(`❌ Erro ao processar diretório ${dir}:`, error.message);
  }

  return results;
}

function main() {
  console.log('🧹 Limpando URLs localhost restantes (excluindo histórico)...\n');
  console.log(`📍 Domínio de produção: ${PRODUCTION_DOMAIN}\n`);

  const results = processDirectory('.');

  console.log('\n📊 Resumo:');
  console.log(`   Arquivos processados: ${results.processed}`);
  console.log(`   Arquivos alterados: ${results.changed}`);
  console.log(`   Erros: ${results.errors}`);

  if (results.changed > 0) {
    console.log('\n✅ Limpeza concluída!');
  } else {
    console.log('\n✅ Nenhuma alteração necessária nos arquivos importantes!');
  }
  
  console.log('\n📝 Nota: Arquivos de histórico (.history) foram ignorados pois não afetam a produção.');
}

if (require.main === module) {
  main();
}