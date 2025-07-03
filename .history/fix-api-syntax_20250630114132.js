const fs = require('fs');
const path = require('path');

// Lista de arquivos que precisam ser corrigidos
const filesToFix = [
  'src/app/api/classes/route.ts',
  'src/app/api/courses/[id]/route.ts',
  'src/app/api/courses/[id]/students/route.ts',
  'src/app/api/forum/topics/[id]/route.ts',
  'src/app/api/forum/topics/route.ts'
];

// Funções CORS para adicionar
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

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Corrigindo ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Adicionar funções CORS se não existirem
    if (!content.includes('function getCorsHeaders')) {
      const importLines = content.split('\n').slice(0, 5).join('\n');
      const restOfFile = content.split('\n').slice(5).join('\n');
      content = importLines + corsCode + restOfFile;
    }
    
    // Corrigir erro de flatten()
    content = content.replace(
      /validationResult\.error\.flatten\(\s*,\s*\{[\s\S]*?\}\.fieldErrors/g,
      'validationResult.error.flatten().fieldErrors'
    );
    
    // Corrigir estrutura de resposta de erro
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
    
    // Corrigir Math.ceil com dois argumentos
    content = content.replace(
      /Math\.ceil\([^,]+,\s*\{[^}]*\}\)/g,
      (match) => {
        const expression = match.split(',')[0] + ')';
        return expression;
      }
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} corrigido`);
  } else {
    console.log(`❌ ${filePath} não encontrado`);
  }
});

console.log('Correção concluída!');