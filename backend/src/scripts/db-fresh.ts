import knex from 'knex';
import config from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

async function fresh() {
  try {
    console.log('🔄 Iniciando reset completo do banco de dados...');
    
    // Drop all tables
    console.log('🗑️  Dropando todas as tabelas...');
    await db.raw('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log('✅ Todas as tabelas foram removidas.');

    // Run migrations
    console.log('🏗️  Executando migrações...');
    await db.migrate.latest();
    console.log('✅ Migrações executadas com sucesso.');

    // Run specific seed
    console.log('🌱 Executando seed de dados iniciais...');
    await db.seed.run({ specific: '001_test_seed.js' });
    console.log('✅ Seeds executados com sucesso.');
    
    console.log('\n🎉 BANCO DE DADOS RESETADO COM SUCESSO!');
    console.log('==========================================');
    console.log('📧 Usuário admin: admin@sabercon.edu.br');
    console.log('🔑 Senha: password123');
    console.log('==========================================\n');
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

fresh();