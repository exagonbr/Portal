const fs = require('fs');
const path = require('path');

// Diretório das entidades
const entitiesDir = path.join(__dirname, '../src/entities');

// Função para processar cada arquivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Substituir datetime por timestamp
    content = content.replace(/type:\s*['"]datetime['"]/g, 'type: \'timestamp\'');
    
    // Se houve mudanças, salvar o arquivo
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Atualizado: ${path.basename(filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Listar todos os arquivos .ts no diretório de entidades
console.log('🔧 Corrigindo tipos datetime para timestamp...\n');

let filesUpdated = 0;
const files = fs.readdirSync(entitiesDir).filter(file => file.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(entitiesDir, file);
  if (processFile(filePath)) {
    filesUpdated++;
  }
});

console.log(`\n✨ Concluído! ${filesUpdated} arquivos atualizados.`);