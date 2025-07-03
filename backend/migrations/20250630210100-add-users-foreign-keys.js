/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Verificar se a tabela users existe
  const usersExists = await knex.schema.hasTable('users');
  const rolesExists = await knex.schema.hasTable('roles');
  
  if (!usersExists) {
    console.log('Tabela "users" não existe, pulando adição de chaves estrangeiras...');
    return Promise.resolve();
  }
  
  if (!rolesExists) {
    console.log('Tabela "roles" não existe, pulando adição de chave estrangeira role_id...');
    return Promise.resolve();
  }
  
  // Verificar se a constraint já existe
  const constraintExists = await knex.raw(`
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'users'
    AND constraint_name = 'users_role_id_foreign'
    AND constraint_type = 'FOREIGN KEY'
  `);
  
  if (constraintExists.rows && constraintExists.rows.length > 0) {
    console.log('Chave estrangeira "users_role_id_foreign" já existe, pulando...');
    return Promise.resolve();
  }
  
  return knex.schema.alterTable('users', function(table) {
    // Adicionar chave estrangeira para roles
    table.foreign('role_id')
         .references('id')
         .inTable('roles')
         .onDelete('SET NULL')
         .withKeyName('users_role_id_foreign');
    
    // Adicionar chave estrangeira para institutions (se a tabela existir)
    // Descomente a linha abaixo se a tabela institutions existir
    // table.foreign('institution_id')
    //      .references('id')
    //      .inTable('institutions')
    //      .onDelete('SET NULL')
    //      .withKeyName('users_institution_id_foreign');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // Remover chaves estrangeiras
    table.dropForeign('role_id', 'users_role_id_foreign');
    // table.dropForeign('institution_id', 'users_institution_id_foreign');
  });
};