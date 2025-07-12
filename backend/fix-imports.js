const fs = require('fs');
const path = require('path');

// Função para corrigir imports em um arquivo
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Corrigir import do BaseController
    if (content.includes("import { BaseController } from './BaseController'")) {
      content = content.replace(
        "import { BaseController } from './BaseController'",
        "import BaseController from './BaseController'"
      );
      modified = true;
    }

    // Corrigir import do BaseController com caminho diferente
    if (content.includes('import { BaseController } from "../controllers/BaseController"')) {
      content = content.replace(
        'import { BaseController } from "../controllers/BaseController"',
        'import BaseController from "../controllers/BaseController"'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Função para percorrer diretórios recursivamente
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      callback(filePath);
    }
  });
}

// Corrigir controllers
console.log('Fixing BaseController imports...');
walkDir(path.join(__dirname, 'src/controllers'), fixImportsInFile);

// Corrigir routes
walkDir(path.join(__dirname, 'src/routes'), fixImportsInFile);

console.log('Import fixes completed!');