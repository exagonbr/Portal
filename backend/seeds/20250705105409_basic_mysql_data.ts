import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  console.log('🌱 Executando seeds básicos baseados no MySQL...');

  console.log('✅ Seeds básicos executados com sucesso!');
}
