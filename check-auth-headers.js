const fs = require('fs');
const path = require('path');

// Diretório dos serviços
const servicesDir = path.join(__dirname, 'src', 'services');

// Padrões para verificar
const patterns = [
  { pattern: /apiGet|apiPost|apiPut|apiDelete|apiPatch/, description: 'Usando apiService' },
  { pattern: /AuthHeaderService/, description: 'Usando AuthHeaderService' },
  { pattern: /headers\['Authorization'\]|headers\.set\('Authorization'/, description: 'Definindo Authorization manualmente' },
  { pattern: /Bearer/, description: 'Usando Bearer token' },
];

// Função para verificar um arquivo
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  
  // Ignorar arquivos específicos
  if (fileName === 'index.ts' || fileName.includes('.mock.ts')) {
    return;
  }

  console.log(`\nVerificando ${fileName}:`);
  
  const results = patterns.map(({ pattern, description }) => {
    const matches = content.match(pattern);
    return { 
      pattern: description, 
      found: !!matches, 
      count: matches ? matches.length : 0 
    };
  });
  
  // Verificar se o arquivo usa apiService ou AuthHeaderService
  const usesApiService = results[0].found;
  const usesAuthHeaderService = results[1].found;
  const setsAuthManually = results[2].found;
  const usesBearer = results[3].found;
  
  if (usesApiService || usesAuthHeaderService) {
    console.log(`✅ ${fileName} - OK - Usa apiService ou AuthHeaderService`);
  } else if (!setsAuthManually && !usesBearer) {
    console.log(`⚠️ ${fileName} - Não parece fazer requisições HTTP`);
  } else {
    console.log(`❌ ${fileName} - ATENÇÃO - Define Authorization manualmente sem usar AuthHeaderService`);
  }
  
  // Detalhes
  results.forEach(result => {
    if (result.found) {
      console.log(`  - ${result.pattern}: ${result.count} ocorrências`);
    }
  });
}

// Função para verificar todos os arquivos em um diretório
function checkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      checkDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      checkFile(filePath);
    }
  });
}

console.log('Verificando serviços para uso correto de headers de autorização...');
checkDirectory(servicesDir);
console.log('\nVerificação concluída!'); 