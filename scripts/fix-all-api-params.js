const fs = require('fs');
const path = require('path');

// Função para encontrar todos os arquivos route.ts
function findAllApiFiles(dir) {
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

// Função para corrigir um arquivo
function fixApiFile(filePath) {
  console.log(`Verificando: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Verificar se o arquivo tem parâmetros dinâmicos
  const hasParams = content.includes('{ params }') && content.includes('params:');
  
  if (!hasParams) {
    console.log(`⏭️  Arquivo não tem parâmetros: ${filePath}`);
    return false;
  }
  
  // Corrigir assinaturas de função
  const functionPattern = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*([^,]+),\s*\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{([^}]+)\}\s*\}\s*\)/g;
  
  content = content.replace(functionPattern, (match, method, req, paramsType) => {
    modified = true;
    return `export async function ${method}(\n  ${req.trim()},\n  { params }: { params: Promise<{${paramsType}}> }\n)`;
  });
  
  // Corrigir uso dos parâmetros
  if (modified) {
    // Encontrar todas as referências a params.xxx
    const paramUsages = content.match(/params\.(\w+)/g);
    if (paramUsages) {
      const uniqueParams = [...new Set(paramUsages.map(usage => usage.split('.')[1]))];
      
      // Para cada função que foi modificada, adicionar resolução de parâmetros
      content = content.replace(
        /(export\s+async\s+function\s+(?:GET|POST|PUT|DELETE|PATCH)\s*\([^)]+\)\s*\{\s*try\s*\{)/g,
        (match) => {
          return match + '\n    const resolvedParams = await params';
        }
      );
      
      // Substituir todas as referências params.xxx por resolvedParams.xxx
      uniqueParams.forEach(param => {
        content = content.replace(
          new RegExp(`params\\.${param}`, 'g'),
          `resolvedParams.${param}`
        );
      });
    }
  }
  
  // Verificar se precisa adicionar funções CORS
  if (content.includes('getCorsHeaders(') && !content.includes('function getCorsHeaders')) {
    const corsCode = `
// Funções CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}

`;
    
    // Inserir após os imports
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
    if (lastImportIndex !== -1) {
      const nextLineIndex = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, nextLineIndex + 1) + corsCode + content.slice(nextLineIndex + 1);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Arquivo corrigido: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  Arquivo não precisou de correção: ${filePath}`);
    return false;
  }
}

// Executar script
const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');
const apiFiles = findAllApiFiles(apiDir);

console.log(`Encontrados ${apiFiles.length} arquivos de API:`);

let fixedCount = 0;
for (const file of apiFiles) {
  if (fixApiFile(file)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Script concluído! ${fixedCount} arquivos foram corrigidos.`);