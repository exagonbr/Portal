/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Remover a tabela antiga se ela existir
  await knex.schema.dropTableIfExists('institution');
  await knex.schema.dropTableIfExists('institutions'); // Tenta remover a versão no plural também

  // 2. Criar a nova tabela 'institution'
  return knex.schema.createTable('institution', function(table) {
    table.bigIncrements('id').primary();
    table.bigInteger('version').nullable();
    table.string('accountable_contact', 255).notNullable();
    table.string('accountable_name', 255).notNullable();
    table.string('company_name', 255).notNullable();
    table.string('complement', 255).nullable();
    table.boolean('contract_disabled').notNullable();
    table.string('contract_invoice_num', 255).nullable();
    table.bigInteger('contract_num').nullable();
    table.datetime('contract_term_end').notNullable();
    table.datetime('contract_term_start').notNullable();
    table.datetime('date_created').nullable();
    table.boolean('deleted').notNullable();
    table.string('district', 255).notNullable();
    table.string('document', 255).notNullable();
    table.datetime('invoice_date').nullable();
    table.datetime('last_updated').nullable();
    table.string('name', 255).notNullable();
    table.string('postal_code', 255).notNullable();
    table.string('state', 255).notNullable();
    table.string('street', 255).notNullable();
    table.bigInteger('score').nullable();
    table.boolean('has_library_platform').notNullable();
    table.boolean('has_principal_platform').notNullable();
    table.boolean('has_student_platform').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // O downgrade pode ser complexo, então por agora vamos apenas remover a nova tabela.
  // Em um cenário real, seria necessário recriar a tabela antiga.
  return knex.schema.dropTableIfExists('institution');
};