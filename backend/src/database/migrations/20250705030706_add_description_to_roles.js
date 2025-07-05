/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Verificar se a coluna já existe
  const hasDescription = await knex.schema.hasColumn('roles', 'description');
  
  if (!hasDescription) {
    return knex.schema.alterTable('roles', function(table) {
      table.string('description', 500).nullable();
    });
  }
  
  return Promise.resolve();
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('roles', function(table) {
    table.dropColumn('description');
  });
};
