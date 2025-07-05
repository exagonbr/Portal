/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Verificar se a coluna já existe
  const hasRoleId = await knex.schema.hasColumn('user', 'role_id');
  
  if (!hasRoleId) {
    return knex.schema.alterTable('user', function(table) {
      table.bigint('role_id').nullable().references('id').inTable('roles').onDelete('SET NULL');
    });
  }
  
  return Promise.resolve();
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('user', function(table) {
    table.dropColumn('role_id');
  });
};
