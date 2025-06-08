import { spawn } from 'child_process';
import path from 'path';
import MySQLToPostgresMigrator from './complete-mysql-migrator.js';

async function runCommand(command: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Executando: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..')
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function runCompleteMigration() {
  try {
    console.log('🚀 INICIANDO MIGRAÇÃO COMPLETA MySQL → PostgreSQL\n');
    console.log('Este processo irá:');
    console.log('1. Executar migrações PostgreSQL');
    console.log('2. Executar seeds de preparação');
    console.log('3. Migrar dados do MySQL');
    console.log('4. Verificar resultado\n');

    // 1. Executar migrações
    console.log('📋 Passo 1: Executando migrações PostgreSQL...');
    await runCommand('npm', ['run', 'migrate:latest']);
    console.log('✅ Migrações executadas com sucesso\n');

    // 2. Executar seeds
    console.log('🌱 Passo 2: Executando seeds de preparação...');
    await runCommand('npm', ['run', 'seed:run']);
    console.log('✅ Seeds executados com sucesso\n');

    // 3. Migrar dados MySQL
    console.log('📊 Passo 3: Migrando dados do MySQL...');
    const migrator = new MySQLToPostgresMigrator();
    await migrator.migrate();
    console.log('✅ Migração MySQL concluída\n');

    // 4. Verificação final
    console.log('🔍 Passo 4: Verificando resultado...');
    await runCommand('npm', ['run', 'migrate:mysql:verify']);
    
    console.log('\n🎉 MIGRAÇÃO COMPLETA FINALIZADA COM SUCESSO!');
    console.log('==========================================');
    console.log('✅ Banco PostgreSQL configurado');
    console.log('✅ Dados MySQL migrados');
    console.log('✅ Todos usuários têm role TEACHER');
    console.log('✅ Sistema pronto para uso');

  } catch (error) {
    console.error('\n❌ ERRO NA MIGRAÇÃO COMPLETA:', error);
    console.log('\n🔧 Para resolver problemas:');
    console.log('1. Verifique as configurações de conexão MySQL');
    console.log('2. Certifique-se que o PostgreSQL está rodando');
    console.log('3. Execute os passos individualmente para debug');
    throw error;
  }
}

if (require.main === module) {
  runCompleteMigration().catch(console.error);
}

export default runCompleteMigration; 