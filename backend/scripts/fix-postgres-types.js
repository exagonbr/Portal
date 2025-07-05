const fs = require('fs');
const path = require('path');

// Diretório das entidades
const entitiesDir = path.join(__dirname, '../src/entities');

// Mapeamento de tipos MySQL para PostgreSQL
const typeMapping = {
  'datetime': 'timestamp',
  'longtext': 'text',
  'mediumtext': 'text',
  'tinytext': 'text',
  'tinyint': 'smallint',
  'double': 'double precision',
  'blob': 'bytea',
  'mediumblob': 'bytea',
  'longblob': 'bytea',
  'tinyblob': 'bytea'
};

// Função para processar cada arquivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    
    // Substituir cada tipo incompatível
    Object.entries(typeMapping).forEach(([mysqlType, postgresType]) => {
      const regex = new RegExp(`type:\\s*['"]${mysqlType}['"]`, 'g');
      const newContent = content.replace(regex, `type: '${postgresType}'`);
      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(`  - Substituído '${mysqlType}' por '${postgresType}'`);
      }
    });
    
    // Se houve mudanças, salvar o arquivo
    if (modified) {
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
console.log('🔧 Corrigindo tipos incompatíveis com PostgreSQL...\n');

let filesUpdated = 0;
const files = fs.readdirSync(entitiesDir).filter(file => file.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(entitiesDir, file);
  if (processFile(filePath)) {
    filesUpdated++;
  }
});

console.log(`\n✨ Concluído! ${filesUpdated} arquivos atualizados.`);