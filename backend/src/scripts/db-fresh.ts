import knex from 'knex';
import { Knex } from 'knex';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Configuração do Knex
const knexConfig = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'portal_sabercon'
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'js'
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'js'
    }
  }
};

async function dbFresh(): Promise<void> {
  console.log('🚀 INICIANDO DB:FRESH - RESETANDO BANCO DE DADOS\n');
  
  let db: Knex | null = null;
  
  try {
    // Conectar ao banco
    console.log('🔌 Conectando ao banco de dados...');
    db = knex(knexConfig.development);
    console.log('✅ Conectado ao PostgreSQL!\n');
    
    // 1. Rollback de todas as migrations
    console.log('🔄 Fazendo rollback de todas as migrations...');
    await db.migrate.rollback(undefined, true);
    console.log('✅ Rollback concluído!\n');
    
    // 2. Executar migrations
    console.log('📋 Executando migrations...');
    await db.migrate.latest();
    console.log('✅ Migrations executadas!\n');
    
    // 3. Executar seeds
    console.log('🌱 Executando seeds...');
    await db.seed.run();
    console.log('✅ Seeds executadas!\n');
    
    console.log('🎉 DB:FRESH CONCLUÍDO COM SUCESSO!\n');
    console.log('📋 Estrutura criada:');
    console.log('   • Tabelas: institutions, roles, permissions, role_permissions');
    console.log('   • Tabelas: teacher_subject, users, security_policies');
    console.log('   • Tabelas: units, education_cycles, classes, user_classes');
    console.log('   • Tabelas: forgot_password');
    console.log('   • Roles: SYSTEM_ADMIN, INSTITUTION_MANAGER, COORDINATOR, TEACHER, STUDENT, GUARDIAN');
    console.log('   • Permissions: Todas as permissões baseadas no arquivo roles.ts');
    console.log('   • Instituições padrão: Portal Sabercon e IFSP');
    console.log('   • Usuários padrão: Prontos para uso');
    
    console.log('\n💡 Próximos passos:');
    console.log('   • Execute: npm run create-users (para criar usuários padrão)');
    console.log('   • Ou execute: bash scripts/create-complete-user-table.sh');
    console.log('   • Reinicie sua aplicação');
    
  } catch (error: any) {
    console.log('\n❌ ERRO DURANTE O PROCESSO:');
    console.log(error.message);
    console.log('\nStack trace:');
    console.log(error.stack);
    throw error;
  } finally {
    // Fechar conexão
    if (db) {
    await db.destroy();
    }
  }
}

// Executar script
if (require.main === module) {
  dbFresh()
    .then(() => {
      console.log('\n✅ DB:FRESH finalizado com sucesso.');
      process.exit(0);
    })
    .catch(err => {
      console.log('\n❌ Erro fatal:', err.message);
      process.exit(1);
    });
}

export { dbFresh }; 