/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: institution -> institutions
 * Gerado em: 2025-06-01T11:25:58.090Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('institutions');
  if (!hasTable) {
    return knex.schema.createTable('institutions', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.string('accountable_contact').notNullable()
        table.string('accountable_name').notNullable()
        table.string('company_name').notNullable()
        table.string('complement')
        table.boolean('contract_disabled').notNullable()
        table.string('contract_invoice_num')
        table.bigInteger('contract_num')
        table.datetime('contract_term_end').notNullable()
        table.datetime('contract_term_start').notNullable()
        table.datetime('date_created')
        table.boolean('deleted').notNullable()
        table.string('district').notNullable()
        table.string('document').notNullable()
        table.datetime('invoice_date')
        table.datetime('last_updated')
        table.string('name').notNullable()
        table.string('postal_code').notNullable()
        table.string('state').notNullable()
        table.string('street').notNullable()
        table.bigInteger('score')
        table.boolean('has_library_platform').notNullable()
        table.boolean('has_principal_platform').notNullable()
        table.boolean('has_student_platform').notNullable()
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices

    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('institutions');
}
