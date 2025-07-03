const fs = require('fs');
const path = require('path');

// Função para encontrar todos os arquivos .ts na pasta src/app/api
function findApiRoutes(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findApiRoutes(fullPath));
    } else if (item === 'route.ts') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Função para corrigir um arquivo
function fixCorsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Verificar se já tem o import correto
  if (content.includes("import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'")) {
    console.log(`✅ ${filePath} - já tem import correto`);
    return false;
  }
  
  // Verificar se tem funções CORS locais
  const hasCorsFunction = content.includes('function getCorsHeaders') || content.includes('function createCorsOptionsResponse');
  
  if (!hasCorsFunction) {
    // Verificar se usa as funções mas não tem import
    const usesCorsFunction = content.includes('getCorsHeaders(') || content.includes('createCorsOptionsResponse(');
    
    if (usesCorsFunction) {
      // Adicionar import
      const importLine = "import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'";
      
      // Encontrar onde inserir o import (após outros imports)
      const lines = content.split('\n');
      let insertIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '' && insertIndex > 0) {
          break;
        }
      }
      
      lines.splice(insertIndex, 0, importLine);
      content = lines.join('\n');
      modified = true;
      console.log(`🔧 ${filePath} - adicionado import`);
    } else {
      console.log(`⏭️  ${filePath} - não usa CORS`);
      return false;
    }
  } else {
    // Remover funções CORS locais e adicionar import
    const importLine = "import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'";
    
    // Remover funções CORS locais
    content = content.replace(/\/\/ Funções CORS[\s\S]*?function createCorsOptionsResponse\(origin\?\: string\) \{[\s\S]*?\}\n\n/g, '');
    content = content.replace(/\/\/ Função CORS[\s\S]*?function createCorsOptionsResponse\(origin\?\: string\) \{[\s\S]*?\}\n\n/g, '');
    content = content.replace(/\/\/ Função para criar headers CORS[\s\S]*?function createCorsOptionsResponse\(origin\?\: string\) \{[\s\S]*?\}\n\n/g, '');
    
    // Adicionar import
    const lines = content.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '' && insertIndex > 0) {
        break;
      }
    }
    
    lines.splice(insertIndex, 0, importLine);
    content = lines.join('\n');
    modified = true;
    console.log(`🔧 ${filePath} - removidas funções locais e adicionado import`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Executar correção
console.log('🚀 Iniciando correção de imports CORS...\n');

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');
const routeFiles = findApiRoutes(apiDir);

console.log(`📁 Encontrados ${routeFiles.length} arquivos route.ts\n`);

let fixedCount = 0;
for (const file of routeFiles) {
  try {
    if (fixCorsInFile(file)) {
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${file}:`, error.message);
  }
}

console.log(`\n✨ Correção concluída! ${fixedCount} arquivos foram modificados.`);