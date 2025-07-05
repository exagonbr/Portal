const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Executando migrações do Knex...');

// Mudar para o diretório do backend
process.chdir(path.join(__dirname));

// Executar as migrações do Knex
exec('npx knex migrate:latest', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erro ao executar migrações:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️  Stderr:', stderr);
  }
  
  console.log('📋 Saída das migrações:');
  console.log(stdout);
  
  console.log('✅ Migrações do Knex executadas com sucesso!');
}); 