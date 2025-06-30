const fs = require('fs');
const path = require('path');

// Lista de arquivos com importações duplicadas baseada na busca anterior
const filesToFix = [
  'src/app/api/users/[id]/route.ts',
  'src/app/api/users/by-role/[roleId]/route.ts',
  'src/app/api/users/stats/route.ts',
  'src/app/api/settings/admin/route.ts',
  'src/app/api/schools/[id]/route.ts',
  'src/app/api/institutions/[id]/route.ts',
  'src/app/api/institutions/route.ts',
  'src/app/api/collections/top-rated/route.ts',
  'src/app/api/collections/route.ts',
  'src/app/api/collections/search/route.ts',
  'src/app/api/health/route.ts',
  'src/app/api/collections/recent/route.ts',
  'src/app/api/collections/popular/route.ts',
  'src/app/api/collections/manage/route.ts',
  'src/app/api/dashboard/health/route.ts',
  'src/app/api/dashboard/metrics/realtime/route.ts',
  'src/app/api/cache/get/route.ts',
  'src/app/api/auth/_log/route.ts',
  'src/app/api/auth/register/route.ts',
  'src/app/api/auth/logout/route.ts'
];

function fixCorsImports(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Arquivo não encontrado: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    // Encontrar todas as linhas com importações de CORS
    const corsImportLines = [];
    lines.forEach((line, index) => {
      if (line.includes('createCorsOptionsResponse') && line.includes('from') && line.includes('config/cors')) {
        corsImportLines.push({ line, index });
      }
    });

    if (corsImportLines.length <= 1) {
      console.log(`✅ ${filePath} - Nenhuma duplicação encontrada`);
      return false;
    }

    console.log(`🔧 ${filePath} - Encontradas ${corsImportLines.length} importações CORS`);
    
    // Manter apenas a primeira importação que usa @/config/cors (alias)
    let keptImport = null;
    const linesToRemove = [];

    corsImportLines.forEach(({ line, index }) => {
      if (line.includes('@/config/cors') && !keptImport) {
        // Manter esta importação (com alias)
        keptImport = { line, index };
        console.log(`  ✅ Mantendo linha ${index + 1}: ${line.trim()}`);
      } else if (line.includes('../../../../config/cors') || line.includes('../../../config/cors') || line.includes('../../config/cors')) {
        // Remover importações com caminho relativo
        linesToRemove.push(index);
        console.log(`  ❌ Removendo linha ${index + 1}: ${line.trim()}`);
      } else if (keptImport) {
        // Se já temos uma importação com alias, remover duplicatas
        linesToRemove.push(index);
        console.log(`  ❌ Removendo duplicata linha ${index + 1}: ${line.trim()}`);
      } else {
        // Se não temos alias ainda, manter esta
        keptImport = { line, index };
        console.log(`  ✅ Mantendo linha ${index + 1}: ${line.trim()}`);
      }
    });

    if (linesToRemove.length === 0) {
      console.log(`  ℹ️  Nenhuma linha para remover`);
      return false;
    }

    // Remover linhas duplicadas (de trás para frente para não afetar os índices)
    const newLines = [...lines];
    linesToRemove.sort((a, b) => b - a).forEach(index => {
      newLines.splice(index, 1);
    });

    // Escrever arquivo corrigido
    const newContent = newLines.join('\n');
    fs.writeFileSync(fullPath, newContent, 'utf8');
    
    console.log(`  ✅ Arquivo corrigido: removidas ${linesToRemove.length} linhas duplicadas`);
    return true;

  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Iniciando correção de importações CORS duplicadas...\n');
  
  let fixedCount = 0;
  let totalCount = 0;

  filesToFix.forEach(filePath => {
    totalCount++;
    if (fixCorsImports(filePath)) {
      fixedCount++;
    }
    console.log(''); // Linha em branco para separar
  });

  console.log(`📊 Resumo:`);
  console.log(`   Total de arquivos verificados: ${totalCount}`);
  console.log(`   Arquivos corrigidos: ${fixedCount}`);
  console.log(`   Arquivos sem problemas: ${totalCount - fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n✅ Correção concluída! Execute npm run dev para verificar se os erros foram resolvidos.');
  } else {
    console.log('\n✅ Nenhum arquivo precisou ser corrigido.');
  }
}

main();