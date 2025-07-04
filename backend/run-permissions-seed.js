const knex = require('knex')({
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    database: 'portal_sabercon',
    user: 'postgres',
    password: 'postgres'
  }
});

async function runSeeds() {
  try {
    console.log('🌱 Executando seed de permissões...');
    
    // Executar seed de permissões
    const permissionsSeed = require('./src/database/seeds/23_permissions.js');
    await permissionsSeed.seed(knex);
    console.log('✅ Permissões criadas com sucesso!');
    
    // Executar seed de role_permissions
    const rolePermissionsSeed = require('./src/database/seeds/20250630212000-role-permissions-seed.js');
    await rolePermissionsSeed.seed(knex);
    console.log('✅ Relacionamentos role-permissions criados com sucesso!');
    
    await knex.destroy();
    console.log('🎉 Seeds executados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error);
    await knex.destroy();
    process.exit(1);
  }
}

runSeeds();