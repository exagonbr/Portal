const fs = require('fs');
const glob = require('glob');

// Encontrar todos os arquivos de API
const apiFiles = glob.sync('src/app/api/**/route.ts');

console.log(`Encontrados ${apiFiles.length} arquivos de API para verificar...`);

apiFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Padrão específico que está causando erro
    const errorPattern = /validationResult\.error\.flatten\(\s*,\s*\{[\s\S]*?\}\.fieldErrors/g;
    
    if (errorPattern.test(content)) {
      console.log(`Corrigindo ${filePath}...`);
      
      // Substituir o padrão problemático
      content = content.replace(errorPattern, 'validationResult.error.flatten().fieldErrors');
      
      // Corrigir a estrutura de resposta completa
      content = content.replace(
        /return NextResponse\.json\(\s*\{\s*error:\s*'Dados inválidos',\s*errors:\s*validationResult\.error\.flatten\(\)\.fieldErrors\s*\},\s*\{\s*status:\s*400\s*\}\s*\)/g,
        `return NextResponse.json({ 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      )`
      );
      
      // Adicionar funções CORS se não existirem
      if (!content.includes('function getCorsHeaders')) {
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
        const lines = content.split('\n');
        let insertIndex = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ') || lines[i].startsWith('//')) {
            insertIndex = i + 1;
          } else {
            break;
          }
        }
        lines.splice(insertIndex, 0, corsCode);
        content = lines.join('\n');
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${filePath} corrigido`);
      modified = true;
    }
    
    if (!modified) {
      console.log(`⚪ ${filePath} não precisou de correção`);
    }
  }
});

console.log('Correção concluída!');