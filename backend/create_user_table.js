const knex = require('knex');

const db = knex({
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'portal_sabercon',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
  }
});

async function createUserTable() {
  try {
    console.log('🔧 Criando estrutura básica do banco...');
    
    // Limpar tabelas existentes
    await db.raw('DROP TABLE IF EXISTS knex_migrations CASCADE');
    await db.raw('DROP TABLE IF EXISTS "user" CASCADE');
    await db.raw('DROP TABLE IF EXISTS users CASCADE');
    await db.raw('DROP TABLE IF EXISTS roles CASCADE');
    await db.raw('DROP TABLE IF EXISTS institutions CASCADE');
    
    // Criar tabela roles
    await db.schema.createTable('roles', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable().unique();
      table.text('description');
      table.timestamps(true, true);
    });
    
    // Criar tabela institutions
    await db.schema.createTable('institutions', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('code', 100).unique();
      table.string('type', 50).defaultTo('SCHOOL');
      table.timestamps(true, true);
    });
    
    // Criar tabela user
    await db.schema.createTable('user', (table) => {
      table.increments('id').primary();
      table.string('email', 255).notNullable().unique();
      table.string('password', 255);
      table.string('full_name', 255);
      table.string('name', 255);
      table.boolean('enabled').defaultTo(true);
      table.boolean('is_active').defaultTo(true);
      table.boolean('is_admin').defaultTo(false);
      table.boolean('is_manager').defaultTo(false);
      table.boolean('is_teacher').defaultTo(false);
      table.boolean('is_student').defaultTo(false);
      table.integer('role_id').unsigned().references('id').inTable('roles');
      table.integer('institution_id').unsigned().references('id').inTable('institutions');
      table.timestamps(true, true);
    });
    
    // Inserir roles básicos
    await db('roles').insert([
      { name: 'ADMIN', description: 'Administrador do sistema' },
      { name: 'TEACHER', description: 'Professor' },
      { name: 'STUDENT', description: 'Estudante' },
      { name: 'MANAGER', description: 'Gestor' }
    ]);
    
    // Inserir instituição padrão
    await db('institutions').insert([
      { name: 'Portal Sabercon', code: 'SABERCON' }
    ]);
    
    // Criar usuário admin padrão
    await db('user').insert([
      {
        email: 'admin@sabercon.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        full_name: 'Administrador',
        name: 'Admin',
        enabled: true,
        is_active: true,
        is_admin: true,
        role_id: 1,
        institution_id: 1
      }
    ]);
    
    console.log('✅ Estrutura básica do banco criada com sucesso!');
    console.log('📋 Tabelas criadas: roles, institutions, user');
    console.log('👤 Usuário admin criado: admin@sabercon.com');
    
  } catch (error) {
    console.error('❌ Erro ao criar estrutura do banco:', error);
  } finally {
    await db.destroy();
  }
}

createUserTable(); 