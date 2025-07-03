/**
 * Migration gerada automaticamente baseada na estrutura MySQL
 * Tabela: profile -> user_profiles
 * Gerado em: 2025-06-01T11:25:59.028Z
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('user_profiles');
  if (!hasTable) {
    return knex.schema.createTable('user_profiles', function (table) {
        table.increments('id')
        table.bigInteger('version')
        table.string('avatar_color')
        table.boolean('is_child')
        table.boolean('is_deleted')
        table.string('profile_language')
        table.string('profile_name')
        table.bigInteger('user_id')
      
      // Timestamps padrão
      table.timestamps(true, true);
      
      // Índices
      table.index(['user_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user_profiles');
}
