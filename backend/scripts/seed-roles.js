const { v4: uuidv4 } = require('uuid');

// Configuração do banco de dados
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'portal_sabercon'
  }
});

async function seedRoles() {
  try {
    console.log('🌱 Iniciando seed de roles...');

    // Verificar se já existem roles
    const existingRoles = await knex('roles').select('*');
    console.log(`📊 Roles existentes: ${existingRoles.length}`);

    if (existingRoles.length > 0) {
      console.log('✅ Roles já existem no banco:');
      existingRoles.forEach(role => {
        console.log(`  - ${role.name} (${role.id}) - Status: ${role.status}`);
      });
      return;
    }

    // Roles básicas para o sistema
    const roles = [
      {
        id: uuidv4(),
        name: 'Administrador',
        description: 'Acesso total ao sistema',
        type: 'system',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Professor',
        description: 'Gerencia cursos e alunos',
        type: 'system',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Estudante',
        description: 'Acessa os cursos e materiais',
        type: 'system',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Coordenador',
        description: 'Coordena professores e turmas',
        type: 'system',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Gerente',
        description: 'Gerencia instituição',
        type: 'system',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Responsável',
        description: 'Responsável por estudante',
        type: 'system',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Inserir roles
    await knex('roles').insert(roles);

    console.log('✅ Roles criadas com sucesso:');
    roles.forEach(role => {
      console.log(`  - ${role.name} (${role.id})`);
    });

    console.log('🎉 Seed de roles concluído!');

  } catch (error) {
    console.error('❌ Erro ao fazer seed de roles:', error);
  } finally {
    await knex.destroy();
  }
}

// Executar o seed
seedRoles(); 