const fs = require('fs');
const path = require('path');

// Arquivos que precisam ser corrigidos
const filesToFix = [
  'src/routes/videos.ts',
  'src/routes/teachers.ts',
  'src/routes/students.ts',
  'src/routes/roles.ts',
  'src/routes/quizzes.ts',
  'src/routes/queue.ts',
  'src/routes/pushSubscription.ts',
  'src/routes/permissions.ts',
  'src/routes/institutions.ts',
  'src/routes/content-collections.ts',
  'src/routes/cache.ts',
  'src/routes/forum.ts',
  'src/routes/highlights.ts',
  'src/routes/lessons.ts',
  'src/routes/modules.ts'
];

// Função para corrigir um arquivo
function fixFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Arquivo não encontrado: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Adicionar import do authMiddleware se não existir
  if (!content.includes('authMiddleware')) {
    content = content.replace(
      /import express from 'express';/,
      `import express from 'express';\nimport { authMiddleware } from '../middleware/auth.middleware';`
    );
    modified = true;
  }
  
  // Adicionar router.use(authMiddleware) após a criação do router
  if (!content.includes('router.use(authMiddleware)')) {
    content = content.replace(
      /const router = express\.Router\(\);/,
      `const router = express.Router();\n\n// Aplicar middleware de autenticação em todas as rotas\nrouter.use(authMiddleware);`
    );
    modified = true;
  }
  
  // Remover validateJWT dos middlewares das rotas
  content = content.replace(/validateJWT,\s*/g, '');
  content = content.replace(/,\s*validateJWT/g, '');
  content = content.replace(/validateJWT\s*,/g, '');
  content = content.replace(/\(\s*validateJWT\s*,/g, '(');
  content = content.replace(/,\s*validateJWT\s*\)/g, ')');
  
  if (content !== fs.readFileSync(fullPath, 'utf8')) {
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Corrigido: ${filePath}`);
  } else {
    console.log(`ℹ️  Já corrigido: ${filePath}`);
  }
}

// Executar correções
console.log('🔧 Iniciando correção dos arquivos...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ Correção concluída!'); 