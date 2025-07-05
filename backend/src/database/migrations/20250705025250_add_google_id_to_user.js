/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Verificar se a coluna já existe
  const hasGoogleId = await knex.schema.hasColumn('user', 'google_id');
  
  if (!hasGoogleId) {
    return knex.schema.alterTable('user', function(table) {
      table.string('google_id', 255).nullable().unique();
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
    table.dropColumn('google_id');
  });
};
