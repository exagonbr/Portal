/**
 * Migration para atualizar a tabela certificate conforme especificação
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('certificate', function(table) {
    // Verificar se as colunas já existem antes de adicionar
    table.string('document', 255).nullable().alter();
    table.string('license_code', 255).nullable().alter();
    table.string('tv_show_name', 255).nullable().alter();
    table.boolean('recreate').defaultTo(true).nullable().alter();
    
    // Garantir que o índice existe
    table.index('user_id', 'idx_certificate_user_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('certificate', function(table) {
    // Reverter as alterações se necessário
    table.dropIndex('user_id', 'idx_certificate_user_id');
  });
};