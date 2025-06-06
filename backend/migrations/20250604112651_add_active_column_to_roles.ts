import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  // Adicionar coluna active na tabela roles se ela não existir
  const hasActiveColumn = await knex.schema.hasColumn('roles', 'active');
  if (!hasActiveColumn) {
    await knex.schema.alterTable('roles', (table) => {
      table.boolean('active').defaultTo(true);
    });
  }
}


export async function down(knex: Knex): Promise<void> {
  // Remover coluna active da tabela roles
  await knex.schema.alterTable('roles', (table) => {
    table.dropColumn('active');
  });
}

