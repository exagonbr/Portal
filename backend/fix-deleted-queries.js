/**
 * Script para corrigir todas as consultas que usam whereNull('deleted') em vez de where('deleted', false)
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Diretórios a serem verificados
const directories = [
  './src',
  './scripts',
  './test-*.js'
];

// Padrão para encontrar .whereNull('deleted')
const whereNullPattern = /\.whereNull\(['"]deleted['"]\)/g;
const replacement = ".where('deleted', false)";

async function fixDeletedQueries() {
  console.log('🔧 Iniciando correção de consultas com whereNull("deleted")...');
  
  let totalFilesScanned = 0;
  let totalFilesModified = 0;
  let totalReplacements = 0;
  
  // Função recursiva para percorrer diretórios
  async function processDirectory(dir) {
    try {
      // Verificar se é um arquivo ou diretório
      const stat = fs.lstatSync(dir);
      
      if (stat.isDirectory()) {
        // Se for diretório, listar conteúdo e processar recursivamente
        const files = fs.readdirSync(dir);
        for (const file of files) {
          await processDirectory(path.join(dir, file));
        }
      } else if (stat.isFile()) {
        // Se for arquivo, verificar extensão
        if (dir.endsWith('.js') || dir.endsWith('.ts')) {
          totalFilesScanned++;
          
          // Ler conteúdo do arquivo
          const content = await readFileAsync(dir, 'utf8');
          
          // Verificar se contém o padrão
          if (whereNullPattern.test(content)) {
            // Resetar o lastIndex do regex
            whereNullPattern.lastIndex = 0;
            
            // Contar ocorrências
            const occurrences = (content.match(whereNullPattern) || []).length;
            
            // Substituir todas as ocorrências
            const newContent = content.replace(whereNullPattern, replacement);
            
            // Escrever arquivo modificado
            await writeFileAsync(dir, newContent, 'utf8');
            
            totalFilesModified++;
            totalReplacements += occurrences;
            
            console.log(`✅ Arquivo modificado: ${dir} (${occurrences} substituições)`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${dir}:`, error);
    }
  }
  
  // Processar cada diretório/padrão
  for (const dir of directories) {
    // Se for um padrão com wildcard, encontrar arquivos correspondentes
    if (dir.includes('*')) {
      const baseDir = path.dirname(dir);
      const pattern = path.basename(dir);
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      
      const files = fs.readdirSync(baseDir);
      for (const file of files) {
        if (regex.test(file)) {
          await processDirectory(path.join(baseDir, file));
        }
      }
    } else {
      // Caso contrário, processar diretório normalmente
      await processDirectory(dir);
    }
  }
  
  console.log('\n📊 Resumo:');
  console.log(`Total de arquivos verificados: ${totalFilesScanned}`);
  console.log(`Total de arquivos modificados: ${totalFilesModified}`);
  console.log(`Total de substituições: ${totalReplacements}`);
  console.log('\n✅ Correção concluída!');
}

// Executar o script
fixDeletedQueries().catch(console.error); 