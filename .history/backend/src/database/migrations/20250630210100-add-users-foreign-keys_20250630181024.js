/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
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