import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  // Adicionar coluna active na tabela roles
  await knex.schema.alterTable('roles', (table) => {
    table.boolean('active').defaultTo(true);
  });
}


export async function down(knex: Knex): Promise<void> {
  // Remover coluna active da tabela roles
  await knex.schema.alterTable('roles', (table) => {
    table.dropColumn('active');
  });
}

