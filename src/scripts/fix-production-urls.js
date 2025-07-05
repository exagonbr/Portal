#!/usr/bin/env node

/**
 * Script para corrigir URLs localhost em produção
 * Substitui todas as URLs localhost por URLs de produção
 */

const fs = require('fs');
const path = require('path');

const PRODUCTION_DOMAIN = 'https://portal.sabercon.com.br';

const URL_REPLACEMENTS = [
  // URLs completas
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
  },
  // URLs sem protocolo (para casos específicos)
  {
    pattern: /localhost:3000/g,
    replacement: 'portal.sabercon.com.br'
  },
  {
    pattern: /localhost:3001/g,
    replacement: 'portal.sabercon.com.br'
  }
];

const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.history' // Excluir histórico do VSCode
];

const EXCLUDE_FILES = [
  '.log',
  '.lock',
  '.map',
  'check-localhost-urls.js',
  'fix-production-urls.js'
];

// Arquivos que devem ser tratados com cuidado (apenas comentários)
const DOCUMENTATION_FILES = [
  '.md',
  '.txt',
  'README',
  'CHANGELOG'
];

function shouldExclude(filePath) {
  return EXCLUDE_DIRS.some(dir => filePath.includes(dir)) ||
         EXCLUDE_FILES.some(ext => filePath.endsWith(ext));
}

function isDocumentationFile(filePath) {
  return DOCUMENTATION_FILES.some(ext => 
    filePath.toLowerCase().includes(ext.toLowerCase()) ||
    filePath.toLowerCase().endsWith(ext.toLowerCase())
  );
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    // Para arquivos de documentação, só alterar se estiver em comentários ou exemplos
    const isDoc = isDocumentationFile(filePath);

    URL_REPLACEMENTS.forEach(({ pattern, replacement }) => {
      if (pattern.test(newContent)) {
        // Se é arquivo de documentação, ser mais seletivo
        if (isDoc) {
          // Só substituir se estiver em contextos específicos
          const lines = newContent.split('\n');
          const updatedLines = lines.map(line => {
            // Substituir em exemplos de curl, links de teste, etc.
            if (line.includes('curl') || 
                line.includes('Acesse:') || 
                line.includes('URL:') ||
                line.includes('http') ||
                line.includes('teste') ||
                line.includes('exemplo')) {
              return line.replace(pattern, replacement);
            }
            return line;
          });
          newContent = updatedLines.join('\n');
        } else {
          // Para arquivos de código, substituir normalmente
          newContent = newContent.replace(pattern, replacement);
        }
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
  console.log('🔧 Corrigindo URLs localhost para produção...\n');
  console.log(`📍 Domínio de produção: ${PRODUCTION_DOMAIN}\n`);

  const results = processDirectory('.');

  console.log('\n📊 Resumo:');
  console.log(`   Arquivos processados: ${results.processed}`);
  console.log(`   Arquivos alterados: ${results.changed}`);
  console.log(`   Erros: ${results.errors}`);

  if (results.changed > 0) {
    console.log('\n✅ URLs corrigidas com sucesso!');
    console.log('\n🔧 Próximos passos:');
    console.log('1. Verifique as alterações com: git diff');
    console.log('2. Teste a aplicação localmente');
    console.log('3. Faça commit das alterações');
    console.log('4. Deploy para produção');
  } else {
    console.log('\n✅ Nenhuma alteração necessária!');
  }
}

if (require.main === module) {
  main();
}