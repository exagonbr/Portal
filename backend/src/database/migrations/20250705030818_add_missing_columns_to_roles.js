/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Verificar e adicionar coluna is_active
  const hasIsActive = await knex.schema.hasColumn('roles', 'is_active');
  if (!hasIsActive) {
    await knex.schema.alterTable('roles', function(table) {
      table.boolean('is_active').defaultTo(true);
    });
  }
  
  // Verificar e adicionar coluna created_at
  const hasCreatedAt = await knex.schema.hasColumn('roles', 'created_at');
  if (!hasCreatedAt) {
    await knex.schema.alterTable('roles', function(table) {
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
  
  // Verificar e adicionar coluna updated_at
  const hasUpdatedAt = await knex.schema.hasColumn('roles', 'updated_at');
  if (!hasUpdatedAt) {
    await knex.schema.alterTable('roles', function(table) {
      table.timestamp('updated_at').defaultTo(knex.fn.now());
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
    table.dropColumn('is_active');
    table.dropColumn('created_at');
    table.dropColumn('updated_at');
  });
};
