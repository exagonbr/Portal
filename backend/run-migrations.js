const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Executando migrações pendentes...');

// Mudar para o diretório do backend
process.chdir(path.join(__dirname));

// Executar as migrações
exec('npm run typeorm:migration:run', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erro ao executar migrações:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️  Stderr:', stderr);
  }
  
  console.log('📋 Saída das migrações:');
  console.log(stdout);
  
  console.log('✅ Migrações executadas com sucesso!');
}); 