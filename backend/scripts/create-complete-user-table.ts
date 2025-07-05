import knex from 'knex';
import { Knex } from 'knex';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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

// Interface para definir as colunas
interface ColumnDefinition {
  name: string;
  type: 'string' | 'text' | 'timestamp' | 'date' | 'boolean' | 'integer' | 'bigint' | 'json' | 'uuid' | 'datetime';
  length?: number;
  unique?: boolean;
  default?: any;
  nullable?: boolean;
  primary?: boolean;
  references?: { table: string; column: string };
}

// Função para verificar se uma tabela existe
async function tableExists(db: Knex, tableName: string): Promise<boolean> {
  return db.schema.hasTable(tableName);
}

// Função para fazer DROP da tabela users se existir
async function dropUsersTableIfExists(db: Knex): Promise<void> {
  console.log('🗑️  REMOVENDO TABELA USERS EXISTENTE\n');

  try {
    const exists = await tableExists(db, 'users');
    if (exists) {
      console.log('   ⚠️  Tabela users existe, fazendo DROP...');
      await db.schema.dropTable('users');
      console.log('   ✅ Tabela users removida com sucesso!');
    } else {
      console.log('   ℹ️  Tabela users não existe, continuando...');
    }
  } catch (error: any) {
    console.log(`   ❌ Erro ao remover tabela users: ${error.message}`);
    throw error;
  }
}

// Função para criar usuários padrão
async function createDefaultUsers(db: Knex): Promise<void> {
  console.log('\n👥 CRIANDO USUÁRIOS PADRÃO\n');

  const defaultUsers = [
    {
      email: 'admin@sabercon.edu.br',
      password: 'password',
      full_name: 'Administrador do Sistema',
      username: 'admin',
      is_admin: true,
      is_manager: false,
      is_coordinator: false,
      is_teacher: false,
      is_student: false,
      is_guardian: false,
      is_institution_manager: false,
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified',
      role_id: 1, // SYSTEM_ADMIN
      institution_id: 1
    },
    {
      email: 'gestor@sabercon.edu.br',
      password: 'password',
      full_name: 'Gestor Institucional',
      username: 'gestor',
      is_admin: false,
      is_manager: false,
      is_coordinator: false,
      is_teacher: false,
      is_student: false,
      is_guardian: false,
      is_institution_manager: true,
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified',
      role_id: 2, // INSTITUTION_MANAGER
      institution_id: 1
    },
    {
      email: 'coordenador@sabercon.edu.br',
      password: 'password',
      full_name: 'Coordenador Acadêmico',
      username: 'coordenador',
      is_admin: false,
      is_manager: false,
      is_coordinator: true,
      is_teacher: false,
      is_student: false,
      is_guardian: false,
      is_institution_manager: false,
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified',
      role_id: 3, // COORDINATOR
      institution_id: 1
    },
    {
      email: 'professor@sabercon.edu.br',
      password: 'password',
      full_name: 'Professor do Sistema',
      username: 'professor',
      is_admin: false,
      is_manager: false,
      is_coordinator: false,
      is_teacher: true,
      is_student: false,
      is_guardian: false,
      is_institution_manager: false,
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified',
      role_id: 4, // TEACHER
      institution_id: 1
    },
    {
      email: 'julia.c@ifsp.com',
      password: 'password',
      full_name: 'Julia Cristina',
      username: 'julia.c',
      is_admin: false,
      is_manager: false,
      is_coordinator: false,
      is_teacher: false,
      is_student: true,
      is_guardian: false,
      is_institution_manager: false,
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified',
      role_id: 5, // STUDENT
      institution_id: 2
    },
    {
      email: 'renato@gmail.com',
      password: 'password',
      full_name: 'Renato Silva',
      username: 'renato',
      is_admin: false,
      is_manager: false,
      is_coordinator: false,
      is_teacher: false,
      is_student: false,
      is_guardian: true,
      is_institution_manager: false,
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified',
      role_id: 6, // GUARDIAN
      institution_id: 2
    }
  ];

  let usersCreated = 0;
  let usersSkipped = 0;

  for (const userData of defaultUsers) {
    try {
      // Verificar se o usuário já existe
      const existingUser = await db('users').where('email', userData.email).first();
      
      if (existingUser) {
        console.log(`   ℹ️  Usuário ${userData.email} já existe, pulando...`);
        usersSkipped++;
        continue;
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Criar usuário
      await db('users').insert({
        ...userData,
        password: hashedPassword,
        date_created: new Date(),
        last_updated: new Date(),
        version: 1,
        entity_version: 1,
        revision: 0,
        login_count: 0,
        failed_login_attempts: 0,
        created_at: new Date(),
        updated_at: new Date()
      });

      console.log(`   ✅ Usuário ${userData.email} criado com sucesso!`);
      usersCreated++;

    } catch (error: any) {
      console.log(`   ❌ Erro ao criar usuário ${userData.email}: ${error.message}`);
    }
  }

  console.log(`\n📊 Resumo da criação de usuários:`);
  console.log(`   • ${usersCreated} usuários criados`);
  console.log(`   • ${usersSkipped} usuários já existiam`);
}

// Função principal
async function createCompleteUserStructure(): Promise<void> {
  console.log('🚀 CRIANDO ESTRUTURA COMPLETA DE USUÁRIOS\n');
  
  let db: Knex | null = null;
  
  try {
    // Conectar ao banco
    console.log('🔌 Conectando ao banco de dados...');
    db = knex(knexConfig.development);
    console.log('✅ Conectado ao PostgreSQL!\n');
    
    // Verificar se as tabelas necessárias existem
    const tablesExist = await Promise.all([
      tableExists(db, 'institutions'),
      tableExists(db, 'roles'),
      tableExists(db, 'users')
    ]);
    
    if (!tablesExist[0] || !tablesExist[1]) {
      console.log('❌ Tabelas necessárias não encontradas!');
      console.log('   Execute primeiro: npm run migrate && npm run seed');
      process.exit(1);
    }
    
    if (!tablesExist[2]) {
      console.log('❌ Tabela users não encontrada!');
      console.log('   Execute primeiro: npm run migrate');
      process.exit(1);
    }
    
    // Criar usuários padrão
    await createDefaultUsers(db);
    
    console.log('\n🎉 PROCESSO CONCLUÍDO COM SUCESSO!\n');
    console.log('📋 Usuários criados:');
    console.log('   • Tabela users populada com usuários padrão');
    console.log('   • Roles e permissions já configuradas');
    console.log('   • Campos OAuth Google disponíveis');
    
    console.log('\n🔐 Campos OAuth Google incluídos:');
    console.log('   • google_id (VARCHAR 255, UNIQUE)');
    console.log('   • google_email (VARCHAR 255)');
    console.log('   • google_name (VARCHAR 255)');
    console.log('   • google_picture (VARCHAR 500)');
    console.log('   • google_access_token (TEXT)');
    console.log('   • google_refresh_token (TEXT)');
    console.log('   • google_token_expires_at (TIMESTAMP)');
    console.log('   • is_google_verified (BOOLEAN)');
    console.log('   • google_linked_at (TIMESTAMP)');
    
    console.log('\n👥 Usuários padrão criados:');
    console.log('   • admin@sabercon.edu.br (SYSTEM_ADMIN)');
    console.log('   • gestor@sabercon.edu.br (INSTITUTION_MANAGER)');
    console.log('   • coordenador@sabercon.edu.br (COORDINATOR)');
    console.log('   • professor@sabercon.edu.br (TEACHER)');
    console.log('   • julia.c@ifsp.com (STUDENT)');
    console.log('   • renato@gmail.com (GUARDIAN)');
    
    console.log('\n💡 Próximos passos:');
    console.log('   • Reinicie sua aplicação');
    console.log('   • Teste o login com os usuários criados');
    console.log('   • Configure OAuth Google se necessário');
    
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
  createCompleteUserStructure()
    .then(() => {
      console.log('\n✅ Script finalizado com sucesso.');
      process.exit(0);
    })
    .catch(err => {
      console.log('\n❌ Erro fatal:', err.message);
      process.exit(1);
    });
}

export { createCompleteUserStructure, createDefaultUsers, dropUsersTableIfExists }; 