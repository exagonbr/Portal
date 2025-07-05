const fs = require('fs');
const path = require('path');

// Função para encontrar todos os arquivos route.ts com parâmetros dinâmicos
function findApiFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Se é um diretório com parâmetros dinâmicos [id], [slug], etc.
        if (item.startsWith('[') && item.endsWith(']')) {
          traverse(fullPath);
        } else {
          traverse(fullPath);
        }
      } else if (item === 'route.ts') {
        // Verificar se o diretório pai tem parâmetros dinâmicos
        const dirName = path.basename(path.dirname(fullPath));
        if (dirName.startsWith('[') && dirName.endsWith(']')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Função para corrigir um arquivo
function fixApiFile(filePath) {
  console.log(`Corrigindo: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Padrões para encontrar e substituir
  const patterns = [
    // GET, POST, PUT, DELETE, PATCH handlers
    {
      search: /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*([^,]+),\s*\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{([^}]+)\}\s*\}\s*\)/g,
      replace: (match, method, req, paramsType) => {
        return `export async function ${method}(\n  ${req.trim()},\n  { params }: { params: Promise<{${paramsType}}> }\n)`;
      }
    }
  ];
  
  // Aplicar padrões
  for (const pattern of patterns) {
    const newContent = content.replace(pattern.search, pattern.replace);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }
  
  // Corrigir uso dos parâmetros dentro das funções
  if (modified) {
    // Adicionar resolução de parâmetros assíncronos
    content = content.replace(
      /(const\s+\w+\s*=\s*params\.(\w+))/g,
      'const resolvedParams = await params\n    const $2 = resolvedParams.$2'
    );
    
    // Corrigir referências diretas a params.id, params.slug, etc.
    content = content.replace(
      /params\.(\w+)/g,
      'resolvedParams.$1'
    );
  }
  
  // Verificar se precisa adicionar funções CORS
  if (!content.includes('getCorsHeaders') && content.includes('getCorsHeaders(')) {
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
    const importEndIndex = content.lastIndexOf('import');
    if (importEndIndex !== -1) {
      const nextLineIndex = content.indexOf('\n', importEndIndex);
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
const apiFiles = findApiFiles(apiDir);

console.log(`Encontrados ${apiFiles.length} arquivos de API com parâmetros dinâmicos:`);
apiFiles.forEach(file => console.log(`  - ${file}`));

let fixedCount = 0;
for (const file of apiFiles) {
  if (fixApiFile(file)) {
    fixedCount++;
  }
}

console.log(`\n🎉 Script concluído! ${fixedCount} arquivos foram corrigidos.`);