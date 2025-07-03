/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('unit', function(table) {
    // Campos conforme especificação SQL fornecida
    table.bigInteger('id').primary().notNullable();
    table.bigInteger('version').nullable();
    table.timestamp('date_created').nullable();
    table.boolean('deleted').nullable().defaultTo(false);
    table.bigInteger('institution_id').notNullable();
    table.timestamp('last_updated').nullable();
    table.string('name', 255).notNullable();
    table.string('institution_name', 255).nullable();
    
    // Campos adicionais para compatibilidade com o frontend
    table.string('description').nullable();
    table.string('type').nullable().defaultTo('school');
    
    // Timestamps padrão
    table.timestamps(true, true);
    
    // Índices
    table.index(['institution_id'], 'unit_institution_id_index');
    table.index(['name'], 'unit_name_index');
    table.index(['deleted'], 'unit_deleted_index');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('unit');
};