/**
 * Script para corrigir erros nos controllers
 * 
 * Este script pode ser usado para corrigir erros comuns nos controllers:
 * 
 * 1. Passar o repositório correto no construtor
 * 2. Corrigir os tipos dos métodos
 * 3. Usar os métodos corretos do repositório
 * 
 * Como usar:
 * 1. Execute: node scripts/fix-controller-errors.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Diretórios
const CONTROLLERS_DIR = path.join(__dirname, '../src/controllers');
const REPOSITORIES_DIR = path.join(__dirname, '../src/repositories');
const ENTITIES_DIR = path.join(__dirname, '../src/entities');

// Obter todos os arquivos de controller
const controllerFiles = fs.readdirSync(CONTROLLERS_DIR)
  .filter(file => file.endsWith('Controller.ts') && file !== 'BaseController.ts');

console.log(`Encontrados ${controllerFiles.length} arquivos de controller para processar.`);

// Processar cada controller
controllerFiles.forEach(file => {
  console.log(`Processando ${file}...`);
  
  const filePath = path.join(CONTROLLERS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extrair o nome da entidade do nome do arquivo
  const entityName = file.replace('Controller.ts', '');
  
  // Verificar se a entidade existe
  const entityFile = path.join(ENTITIES_DIR, `${entityName}.ts`);
  if (!fs.existsSync(entityFile)) {
    console.warn(`Aviso: Arquivo de entidade ${entityName}.ts não encontrado.`);
  }
  
  // Verificar se o repositório existe
  const repositoryFile = path.join(REPOSITORIES_DIR, `${entityName}Repository.ts`);
  if (!fs.existsSync(repositoryFile)) {
    console.warn(`Aviso: Arquivo de repositório ${entityName}Repository.ts não encontrado.`);
  }
  
  // Adicionar importação da entidade se não existir
  if (!content.includes(`import { ${entityName} }`)) {
    content = content.replace(
      /import\s*{[\s\w,]*}\s*from\s*['"]\.\.\/repositories\/.*Repository['"]/,
      `$&\nimport { ${entityName} } from '../entities/${entityName}';`
    );
  }
  
  // Corrigir a extensão do BaseController para incluir o tipo genérico
  content = content.replace(
    /extends\s+BaseController(?!\s*<)/g,
    `extends BaseController<${entityName}>`
  );
  
  // Corrigir o construtor para passar o repositório
  if (!content.includes('super(repository)')) {
    content = content.replace(
      /constructor\s*\(\s*\)\s*{(?:\s*super\s*\(\s*\)\s*;)?/,
      `constructor() {\n    const repository = new ${entityName}Repository();\n    super(repository);`
    );
    
    // Adicionar a variável do repositório
    const repoVarName = entityName.charAt(0).toLowerCase() + entityName.slice(1) + 'Repository';
    if (!content.includes(`private ${repoVarName}`)) {
      content = content.replace(
        /export\s+class\s+\w+\s+extends\s+BaseController[^{]*{/,
        `$&\n  private ${repoVarName}: ${entityName}Repository;`
      );
      
      // Atribuir a variável no construtor
      content = content.replace(
        /super\s*\(\s*repository\s*\)\s*;/,
        `$&\n    this.${repoVarName} = repository;`
      );
    }
  }
  
  // Corrigir os métodos para retornar Promise<Response>
  content = content.replace(
    /async\s+\w+\s*\([^)]*\)\s*:\s*Promise<void>/g,
    (match) => match.replace('Promise<void>', 'Promise<Response>')
  );
  
  // Corrigir os métodos para usar return em vez de this.success/this.error
  content = content.replace(
    /this\.success\s*\(\s*res\s*,\s*([^,)]+)(?:\s*,\s*(\d+))?\s*\)\s*;/g,
    (match, data, status) => `return res.status(${status || 200}).json({ success: true, data: ${data} });`
  );
  
  content = content.replace(
    /this\.error\s*\(\s*res\s*,\s*([^,)]+)(?:\s*,\s*(\d+))?\s*\)\s*;/g,
    (match, error, status) => `console.error(${error});\n      return res.status(${status || 500}).json({ success: false, message: 'Internal Server Error' });`
  );
  
  content = content.replace(
    /this\.notFound\s*\(\s*res\s*,\s*([^,)]+)?\s*\)\s*;(?:\s*return\s*;)?/g,
    (match, message) => `return res.status(404).json({ success: false, message: ${message || "'Recurso não encontrado'"} });`
  );
  
  // Atualizar chamadas de findAll para findAllPaginated se disponível
  if (content.includes('findAllPaginated')) {
    content = content.replace(
      /(\w+)\.findAll\(\s*{\s*page\s*,\s*limit\s*,\s*search\s*}\s*\)/g,
      '$1.findAllPaginated({ page, limit, search })'
    );
  }
  
  // Salvar o arquivo modificado
  fs.writeFileSync(filePath, content);
  console.log(`✓ Controller ${file} atualizado.`);
});

console.log('\nProcesso concluído. Verifique se há erros de compilação executando:');
console.log('npx tsc --noEmit'); 