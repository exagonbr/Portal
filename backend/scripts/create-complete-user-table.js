const knex = require('knex');
const knexConfigFile = require('../knexfile.js');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// Obter a configuração correta do knexfile
const knexConfig = knexConfigFile.default || knexConfigFile;

// Carrega variáveis de ambiente
dotenv.config();

// Função para verificar se uma tabela existe
async function tableExists(db, tableName) {
  return db.schema.hasTable(tableName);
}

// Função para fazer DROP da tabela user se existir
async function dropUserTableIfExists(db) {
  console.log('🗑️  REMOVENDO TABELA USER EXISTENTE\n');

  try {
    const exists = await tableExists(db, 'user');
    if (exists) {
      console.log('   ⚠️  Tabela user existe, fazendo DROP...');
      await db.schema.dropTable('user');
      console.log('   ✅ Tabela user removida com sucesso!');
    } else {
      console.log('   ℹ️  Tabela user não existe, continuando...');
    }
  } catch (error) {
    console.log(`   ❌ Erro ao remover tabela user: ${error.message}`);
    throw error;
  }
}

// Função para criar a tabela user completa baseada na estrutura MySQL
async function createCompleteUserTable(db) {
  console.log('🏗️  CRIANDO TABELA USER COMPLETA (BASEADA NO MYSQL)\n');

  try {
    // Verificar se a tabela já existe
    const exists = await tableExists(db, 'user');
    if (exists) {
      console.log('   ⚠️  Tabela user já existe, pulando criação...');
      return;
    }

    console.log('   📋 Criando tabela user com estrutura completa...');

    await db.schema.createTable('user', (table) => {
      // Chave primária
      table.bigIncrements('id').primary();

      // Campos básicos da estrutura MySQL original
      table.bigInteger('version').nullable();
      table.boolean('account_expired').nullable();
      table.boolean('account_locked').nullable();
      table.string('address', 255).nullable();
      table.integer('amount_of_media_entries').nullable();
      table.datetime('date_created').nullable();
      table.boolean('deleted').nullable();
      table.string('email', 255).notNullable();
      table.boolean('enabled').nullable();
      table.string('full_name', 255).notNullable();
      table.boolean('invitation_sent').nullable();
      table.boolean('is_admin').notNullable();
      table.string('language', 255).nullable();
      table.datetime('last_updated').nullable();
      table.string('password', 255).nullable();
      table.boolean('password_expired').nullable();
      table.boolean('pause_video_on_click').nullable();
      table.string('phone', 255).nullable();
      table.boolean('reset_password').notNullable().defaultTo(true);
      table.string('username', 255).nullable();
      table.string('uuid', 255).nullable();
      table.boolean('is_manager').notNullable();
      table.integer('type').nullable();
      table.string('certificate_path', 255).nullable();
      table.boolean('is_certified').defaultTo(false);
      table.boolean('is_student').notNullable();
      table.boolean('is_teacher').notNullable();
      table.bigInteger('institution_id').nullable();
      table.bigInteger('role_id').nullable();
      table.string('subject', 255).nullable();
      table.bigInteger('subject_data_id').nullable();

      // Campos adicionais encontrados em algumas versões
      table.boolean('is_institution_manager').defaultTo(false);
      table.boolean('is_coordinator').defaultTo(false);
      table.boolean('is_guardian').defaultTo(false);

      // ===== CAMPOS OAUTH GOOGLE =====
      table.string('google_id', 255).unique().nullable();
      table.string('google_email', 255).nullable();
      table.string('google_name', 255).nullable();
      table.string('google_picture', 500).nullable();
      table.text('google_access_token').nullable();
      table.text('google_refresh_token').nullable();
      table.timestamp('google_token_expires_at').nullable();
      table.boolean('is_google_verified').defaultTo(false);
      table.timestamp('google_linked_at').nullable();

      // ===== CAMPOS DE PERFIL ADICIONAIS =====
      table.string('profile_image', 500).nullable();
      table.string('avatar', 500).nullable();
      table.string('avatar_url', 500).nullable();
      table.string('profile_picture', 500).nullable();
      table.text('bio').nullable();
      table.text('description').nullable();
      table.string('first_name', 255).nullable();
      table.string('last_name', 255).nullable();
      table.string('display_name', 255).nullable();
      table.string('locale', 10).nullable();
      table.string('timezone', 50).nullable();
      table.date('birth_date').nullable();
      table.string('gender', 20).nullable();
      table.boolean('phone_verified').defaultTo(false);
      table.boolean('email_verified').defaultTo(false);
      table.boolean('two_factor_enabled').defaultTo(false);

      // ===== CAMPOS DE CONTROLE E VERSIONAMENTO =====
      table.bigInteger('entity_version').defaultTo(1);
      table.integer('revision').defaultTo(0);

      // ===== CAMPOS DE STATUS E CONTROLE =====
      table.string('status', 50).defaultTo('active');
      table.string('account_status', 50).defaultTo('active');
      table.string('verification_status', 50).defaultTo('pending');
      table.timestamp('last_login_at').nullable();
      table.timestamp('last_activity_at').nullable();
      table.integer('login_count').defaultTo(0);
      table.integer('failed_login_attempts').defaultTo(0);
      table.timestamp('locked_until').nullable();

      // ===== CAMPOS DE CONFIGURAÇÕES =====
      table.json('preferences').nullable();
      table.json('settings').nullable();
      table.json('metadata').nullable();

      // ===== CAMPOS DE RELACIONAMENTO EXTRAS =====
      table.uuid('manager_id').nullable();
      table.uuid('department_id').nullable();
      table.uuid('organization_id').nullable();

      // ===== CAMPOS DE CONTATO ADICIONAIS =====
      table.string('mobile_phone', 50).nullable();
      table.string('work_phone', 50).nullable();
      table.string('alternative_email', 255).nullable();

      // ===== CAMPOS DE ENDEREÇO =====
      table.string('street_address', 255).nullable();
      table.string('city', 100).nullable();
      table.string('state', 100).nullable();
      table.string('postal_code', 20).nullable();
      table.string('country', 100).nullable();

      // ===== CAMPOS DE AUDITORIA ADICIONAIS =====
      table.uuid('created_by').nullable();
      table.uuid('updated_by').nullable();
      table.timestamp('deleted_at').nullable();
      table.uuid('deleted_by').nullable();

      // ===== CAMPOS DE TIMESTAMPS =====
      table.timestamps(true, true);
    });

    console.log('   ✅ Tabela user criada com sucesso!');

    // Criar índices para performance
    console.log('   🔍 Criando índices...');
    
    const indexQueries = [
      // Índices básicos
      'CREATE INDEX IF NOT EXISTS idx_user_email ON "user" (email);',
      'CREATE INDEX IF NOT EXISTS idx_user_username ON "user" (username);',
      'CREATE INDEX IF NOT EXISTS idx_user_institution_id ON "user" (institution_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_role_id ON "user" (role_id);',
      
      // Índices OAuth Google
      'CREATE INDEX IF NOT EXISTS idx_user_google_id ON "user" (google_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_google_email ON "user" (google_email);',
      'CREATE INDEX IF NOT EXISTS idx_user_is_google_verified ON "user" (is_google_verified);',
      
      // Índices de roles
      'CREATE INDEX IF NOT EXISTS idx_user_is_admin ON "user" (is_admin);',
      'CREATE INDEX IF NOT EXISTS idx_user_is_manager ON "user" (is_manager);',
      'CREATE INDEX IF NOT EXISTS idx_user_is_teacher ON "user" (is_teacher);',
      'CREATE INDEX IF NOT EXISTS idx_user_is_student ON "user" (is_student);',
      'CREATE INDEX IF NOT EXISTS idx_user_is_coordinator ON "user" (is_coordinator);',
      'CREATE INDEX IF NOT EXISTS idx_user_is_guardian ON "user" (is_guardian);',
      
      // Índices de status
      'CREATE INDEX IF NOT EXISTS idx_user_enabled ON "user" (enabled);',
      'CREATE INDEX IF NOT EXISTS idx_user_deleted ON "user" (deleted);',
      'CREATE INDEX IF NOT EXISTS idx_user_account_expired ON "user" (account_expired);',
      'CREATE INDEX IF NOT EXISTS idx_user_account_locked ON "user" (account_locked);',
      'CREATE INDEX IF NOT EXISTS idx_user_status ON "user" (status);',
      'CREATE INDEX IF NOT EXISTS idx_user_account_status ON "user" (account_status);',
      
      // Índices de atividade
      'CREATE INDEX IF NOT EXISTS idx_user_last_login_at ON "user" (last_login_at);',
      'CREATE INDEX IF NOT EXISTS idx_user_last_activity_at ON "user" (last_activity_at);',
      'CREATE INDEX IF NOT EXISTS idx_user_date_created ON "user" (date_created);',
      'CREATE INDEX IF NOT EXISTS idx_user_last_updated ON "user" (last_updated);',
      
      // Índices compostos
      'CREATE INDEX IF NOT EXISTS idx_user_institution_role ON "user" (institution_id, role_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_email_enabled ON "user" (email, enabled);',
      'CREATE INDEX IF NOT EXISTS idx_user_status_deleted ON "user" (status, deleted);'
    ];

    for (const query of indexQueries) {
      try {
        await db.raw(query);
      } catch (error) {
        console.log(`   ⚠️  Índice pode já existir: ${error.message}`);
      }
    }

    console.log('   ✅ Índices criados com sucesso!');

  } catch (error) {
    console.log(`   ❌ Erro ao criar tabela user: ${error.message}`);
    throw error;
  }
}

// Função para criar usuários padrão
async function createDefaultUsers(db) {
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
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified'
    },
    {
      email: 'gestor@sabercon.edu.br',
      password: 'password',
      full_name: 'Gestor Institucional',
      username: 'gestor',
      is_admin: false,
      is_manager: true,
      is_coordinator: false,
      is_teacher: false,
      is_student: false,
      is_guardian: false,
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified'
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
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified'
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
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified'
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
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified'
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
      enabled: true,
      deleted: false,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      status: 'active',
      account_status: 'active',
      verification_status: 'verified'
    }
  ];

  let usersCreated = 0;
  let usersSkipped = 0;

  for (const userData of defaultUsers) {
    try {
      // Verificar se o usuário já existe
      const existingUser = await db('user').where('email', userData.email).first();
      
      if (existingUser) {
        console.log(`   ℹ️  Usuário ${userData.email} já existe, pulando...`);
        usersSkipped++;
        continue;
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Criar usuário
      await db('user').insert({
        ...userData,
        password: hashedPassword,
        date_created: new Date(),
        last_updated: new Date(),
        uuid: db.raw('gen_random_uuid()::text'),
        version: 1,
        entity_version: 1,
        revision: 0,
        login_count: 0,
        failed_login_attempts: 0
      });

      console.log(`   ✅ Usuário ${userData.email} criado com sucesso!`);
      usersCreated++;

    } catch (error) {
      console.log(`   ❌ Erro ao criar usuário ${userData.email}: ${error.message}`);
    }
  }

  console.log(`\n📊 Resumo da criação de usuários:`);
  console.log(`   • ${usersCreated} usuários criados`);
  console.log(`   • ${usersSkipped} usuários já existiam`);
}

// Função principal
async function createCompleteUserStructure() {
  console.log('🚀 CRIANDO ESTRUTURA COMPLETA DA TABELA USER\n');
  
  let db = null;
  
  try {
    // Conectar ao banco
    console.log('🔌 Conectando ao banco de dados...');
    db = knex(knexConfig.development);
    console.log('✅ Conectado ao PostgreSQL!\n');
    
    // Fazer DROP da tabela existente
    await dropUserTableIfExists(db);
    
    // Criar tabela user completa
    await createCompleteUserTable(db);
    
    // Criar usuários padrão
    await createDefaultUsers(db);
    
    console.log('\n🎉 PROCESSO CONCLUÍDO COM SUCESSO!\n');
    console.log('📋 Estrutura criada:');
    console.log('   • Tabela user com todos os campos do MySQL');
    console.log('   • Campos OAuth Google completos');
    console.log('   • Campos de perfil e controle adicionais');
    console.log('   • Índices otimizados para performance');
    console.log('   • Usuários padrão do sistema');
    
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
    console.log('   • admin@sabercon.edu.br (Administrador)');
    console.log('   • gestor@sabercon.edu.br (Gestor)');
    console.log('   • coordenador@sabercon.edu.br (Coordenador)');
    console.log('   • professor@sabercon.edu.br (Professor)');
    console.log('   • julia.c@ifsp.com (Aluna)');
    console.log('   • renato@gmail.com (Responsável)');
    
    console.log('\n💡 Próximos passos:');
    console.log('   • Reinicie sua aplicação');
    console.log('   • Teste o login com os usuários criados');
    console.log('   • Configure OAuth Google se necessário');
    
  } catch (error) {
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

module.exports = { createCompleteUserStructure, createCompleteUserTable, createDefaultUsers, dropUserTableIfExists }; 