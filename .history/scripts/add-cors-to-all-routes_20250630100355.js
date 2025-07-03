#!/usr/bin/env node

/**
 * Script para adicionar handlers OPTIONS e CORS a todas as rotas API
 * Garante que todas as rotas tenham suporte completo a CORS
 */

const fs = require('fs');
const path = require('path');

// Configuração
const API_DIR = 'src/app/api';
const CORS_IMPORT = `import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';`;
const OPTIONS_HANDLER = `
// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}`;

// Função para encontrar todos os arquivos route.ts
function findRouteFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item === 'route.ts') {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Função para verificar se o arquivo já tem handler OPTIONS
function hasOptionsHandler(content) {
  return /export\s+async\s+function\s+OPTIONS/i.test(content);
}

// Função para verificar se o arquivo já tem import do CORS
function hasCorsImport(content) {
  return content.includes('createCorsOptionsResponse') || 
         content.includes('getCorsHeaders') ||
         content.includes('@/config/cors');
}

// Função para adicionar CORS headers a uma resposta NextResponse.json
function addCorsToResponse(content) {
  // Padrão para NextResponse.json sem headers CORS
  const responsePattern = /NextResponse\.json\(\s*([^,]+)\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\)/g;
  
  return content.replace(responsePattern, (match, data, status) => {
    return `NextResponse.json(${data}, { 
      status: ${status},
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })`;
  });
}

// Função para adicionar CORS headers a respostas simples
function addCorsToSimpleResponse(content) {
  // Padrão para NextResponse.json sem objeto de configuração
  const simpleResponsePattern = /NextResponse\.json\(\s*([^)]+)\s*\)/g;
  
  return content.replace(simpleResponsePattern, (match, data) => {
    // Evitar substituir se já tem configuração
    if (match.includes('status:') || match.includes('headers:')) {
      return match;
    }
    
    return `NextResponse.json(${data}, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })`;
  });
}

// Função para processar um arquivo de rota
function processRouteFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    console.log(`\n🔍 Processando: ${filePath}`);
    
    // Verificar se já tem handler OPTIONS
    if (hasOptionsHandler(content)) {
      console.log(`   ✅ Já possui handler OPTIONS`);
      return;
    }
    
    // Adicionar import do CORS se não existir
    if (!hasCorsImport(content)) {
      // Encontrar a linha dos imports do Next.js
      const nextImportMatch = content.match(/import.*from\s+['"]next\/server['"];?\n/);
      if (nextImportMatch) {
        const insertPosition = content.indexOf(nextImportMatch[0]) + nextImportMatch[0].length;
        content = content.slice(0, insertPosition) + CORS_IMPORT + '\n' + content.slice(insertPosition);
        modified = true;
        console.log(`   ✅ Adicionado import do CORS`);
      }
    }
    
    // Adicionar handler OPTIONS
    // Encontrar a primeira função export
    const firstExportMatch = content.match(/export\s+async\s+function\s+\w+/);
    if (firstExportMatch) {
      const insertPosition = content.indexOf(firstExportMatch[0]);
      content = content.slice(0, insertPosition) + OPTIONS_HANDLER + '\n\n' + content.slice(insertPosition);
      modified = true;
      console.log(`   ✅ Adicionado handler OPTIONS`);
    }
    
    // Adicionar CORS headers às respostas existentes
    const originalContent = content;
    content = addCorsToResponse(content);
    content = addCorsToSimpleResponse(content);
    
    if (content !== originalContent) {
      modified = true;
      console.log(`   ✅ Adicionados headers CORS às respostas`);
    }
    
    // Salvar arquivo se foi modificado
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`   💾 Arquivo salvo com modificações`);
    } else {
      console.log(`   ⚪ Nenhuma modificação necessária`);
    }
    
  } catch (error) {
    console.error(`   ❌ Erro ao processar ${filePath}:`, error.message);
  }
}

// Função principal
function main() {
  console.log('🚀 Iniciando adição de CORS a todas as rotas API...\n');
  
  if (!fs.existsSync(API_DIR)) {
    console.error(`❌ Diretório ${API_DIR} não encontrado!`);
    process.exit(1);
  }
  
  // Encontrar todos os arquivos route.ts
  const routeFiles = findRouteFiles(API_DIR);
  
  console.log(`📋 Encontrados ${routeFiles.length} arquivos de rota:`);
  routeFiles.forEach(file => console.log(`   - ${file}`));
  
  console.log('\n🔧 Processando arquivos...');
  
  // Processar cada arquivo
  let processedCount = 0;
  let modifiedCount = 0;
  
  for (const file of routeFiles) {
    const sizeBefore = fs.statSync(file).size;
    processRouteFile(file);
    const sizeAfter = fs.statSync(file).size;
    
    processedCount++;
    if (sizeAfter !== sizeBefore) {
      modifiedCount++;
    }
  }
  
  console.log('\n═'.repeat(60));
  console.log('✅ Processamento concluído!');
  console.log(`📊 Estatísticas:`);
  console.log(`   - Arquivos processados: ${processedCount}`);
  console.log(`   - Arquivos modificados: ${modifiedCount}`);
  console.log(`   - Arquivos já conformes: ${processedCount - modifiedCount}`);
  console.log('═'.repeat(60));
  
  console.log('\n📋 Próximos passos:');
  console.log('1. Revisar as modificações com git diff');
  console.log('2. Testar as rotas para garantir que CORS funciona');
  console.log('3. Executar o script de teste: node scripts/test-cors-aws.js');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  findRouteFiles,
  processRouteFile,
  hasOptionsHandler,
  hasCorsImport
}; 