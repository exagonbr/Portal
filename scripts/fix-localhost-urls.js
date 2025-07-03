const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🔧 Corrigindo URLs localhost hardcoded\n'));

// Arquivos que precisam ser corrigidos
const filesToFix = [
  // APIs principais
  'src/app/api/users/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/users/stats/route.ts',
  'src/app/api/users/by-role/[roleId]/route.ts',
  'src/app/api/institutions/route.ts',
  'src/app/api/institutions/[id]/route.ts',
  'src/app/api/schools/route.ts',
  'src/app/api/schools/[id]/route.ts',
  'src/app/api/collections/route.ts',
  'src/app/api/collections/search/route.ts',
  'src/app/api/collections/popular/route.ts',
  'src/app/api/collections/recent/route.ts',
  'src/app/api/collections/top-rated/route.ts',
  'src/app/api/certificates/route.ts',
  'src/app/api/certificates/[id]/route.ts',
  'src/app/api/cache/get/route.ts',
  'src/app/api/cache/set/route.ts',
  'src/app/api/aws/settings/route.ts',
  'src/app/api/aws/test/route.ts',
  'src/app/api/aws/connection-logs/route.ts',
  'src/app/api/aws/connection-logs/stats/route.ts',
  'src/app/api/aws/settings/[id]/route.ts',
  'src/app/api/aws/settings/[id]/test-connection/route.ts',
  'src/app/api/auth/validate/route.ts',
  'src/app/api/auth/refresh/route.ts',
  'src/app/api/auth/register/route.ts',
  'src/app/api/auth/logout/route.ts',
  'src/app/api/queue/route.ts',
  'src/app/api/queue/pause/route.ts',
  'src/app/api/queue/resume/route.ts',
  'src/app/api/roles/search/route.ts',
  'src/app/api/units/route.ts',
  'src/app/api/units/[id]/route.ts',
  'src/app/api/settings/background/route.ts',
  'src/app/api/settings/security/route.ts',
  'src/app/api/settings/general/route.ts',
  'src/app/api/settings/email/route.ts',
  'src/app/api/tv-shows/[id]/route.ts',
  'src/app/api/tv-shows/[id]/modules/route.ts'
];

// Padrões de substituição
const replacements = [
  {
    pattern: /const BACKEND_URL = process\.env\.NEXT_PUBLIC_API_URL \|\| process\.env\.BACKEND_URL \|\| 'http:\/\/localhost:3001\/api';?/g,
    replacement: "import { getInternalApiUrl } from '@/config/env';"
  },
  {
    pattern: /const BACKEND_URL = process\.env\.BACKEND_URL \|\| 'http:\/\/localhost:3001';?/g,
    replacement: "import { getInternalApiUrl } from '@/config/env';"
  },
  {
    pattern: /const BACKEND_URL = process\.env\.NEXT_PUBLIC_BACKEND_URL \|\| 'http:\/\/localhost:3001';?/g,
    replacement: "import { getInternalApiUrl } from '@/config/env';"
  },
  {
    pattern: /const BACKEND_URL = process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:3001\/api';?/g,
    replacement: "import { getInternalApiUrl } from '@/config/env';"
  },
  // Substituições de uso
  {
    pattern: /\$\{BACKEND_URL\}\/([^`'"]+)/g,
    replacement: "getInternalApiUrl('/api/$1')"
  },
  {
    pattern: /\$\{BACKEND_URL\}/g,
    replacement: "getInternalApiUrl('/api')"
  },
  {
    pattern: /`\$\{BACKEND_URL\}([^`]*)`/g,
    replacement: "getInternalApiUrl('/api$1')"
  }
];

// Função para corrigir um arquivo
function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(chalk.yellow(`⚠️  Arquivo não encontrado: ${filePath}`));
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Verificar se já tem o import correto
    const hasCorrectImport = content.includes("import { getInternalApiUrl } from '@/config/env'");
    
    // Aplicar substituições
    replacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });
    
    // Adicionar import se necessário e não existir
    if (modified && !hasCorrectImport && !content.includes("getInternalApiUrl")) {
      // Encontrar onde adicionar o import
      const importMatch = content.match(/import.*from.*['"][^'"]*['"];?\n/g);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        const importIndex = content.indexOf(lastImport) + lastImport.length;
        content = content.slice(0, importIndex) + 
                 "import { getInternalApiUrl } from '@/config/env';\n" + 
                 content.slice(importIndex);
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(chalk.green(`✅ Corrigido: ${filePath}`));
      return true;
    } else {
      console.log(chalk.gray(`📝 Já correto: ${filePath}`));
      return false;
    }
    
  } catch (error) {
    console.log(chalk.red(`❌ Erro ao corrigir ${filePath}: ${error.message}`));
    return false;
  }
}

// Executar correções
let totalFixed = 0;
let totalProcessed = 0;

console.log(chalk.cyan('🚀 Iniciando correções...\n'));

filesToFix.forEach(file => {
  totalProcessed++;
  if (fixFile(file)) {
    totalFixed++;
  }
});

// Resumo
console.log(chalk.blue.bold('\n📊 RESUMO:'));
console.log(chalk.green(`✅ Arquivos corrigidos: ${totalFixed}`));
console.log(chalk.blue(`📝 Arquivos processados: ${totalProcessed}`));
console.log(chalk.gray(`📄 Arquivos já corretos: ${totalProcessed - totalFixed}`));

if (totalFixed > 0) {
  console.log(chalk.green.bold('\n🎉 Correções aplicadas com sucesso!'));
  console.log(chalk.yellow('💡 Reinicie o servidor para aplicar as mudanças.'));
} else {
  console.log(chalk.blue.bold('\n✨ Todos os arquivos já estavam corretos!'));
}

console.log(chalk.gray('\n📋 Próximos passos:'));
console.log(chalk.gray('1. Verificar se há outros arquivos com localhost hardcoded'));
console.log(chalk.gray('2. Testar as APIs em produção'));
console.log(chalk.gray('3. Monitorar logs por erros de URL'));

module.exports = { fixFile, filesToFix }; 