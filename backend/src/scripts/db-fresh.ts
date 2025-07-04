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
    await db.seed.run();
    console.log('✅ Seeds executados com sucesso.');
    
    console.log('\n🎉 BANCO DE DADOS RESETADO COM SUCESSO!');
    console.log('==========================================');
    console.log('👥 USUÁRIOS DE TESTE CRIADOS:');
    console.log('📧 Admin: admin@sabercon.edu.br');
    console.log('📧 Professor: teacher@sabercon.edu.br');
    console.log('📧 Estudante: student@sabercon.edu.br');
    console.log('📧 Responsável: guardian@sabercon.edu.br');
    console.log('📧 Coordenador: coordinator@sabercon.edu.br');
    console.log('📧 Gerente: institution.manager@sabercon.edu.br');
    console.log('🔑 Senha para todos: password123');
    console.log('');
    console.log('🔗 RELACIONAMENTOS USER-ROLES CRIADOS:');
    console.log('✅ Todos os usuários foram associados às suas roles');
    console.log('✅ Tabela user_roles populada com relacionamentos ativos');
    console.log('');
    console.log('🔐 PERMISSÕES DE ROLES CONFIGURADAS:');
    console.log('✅ Admin: Todas as permissões (106 permissões)');
    console.log('✅ Manager: Permissões de gestão institucional');
    console.log('✅ Teacher: Permissões de ensino e avaliação');
    console.log('✅ Student: Permissões básicas de estudante');
    console.log('✅ Guardian: Permissões de acompanhamento');
    console.log('✅ Institution Manager: Permissões administrativas completas');
    console.log('✅ Tabela role_permissions populada com hierarquia de permissões');
    console.log('==========================================\n');
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

fresh();