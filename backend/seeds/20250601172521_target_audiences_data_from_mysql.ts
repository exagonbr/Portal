/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: target_audience -> target_audiences
 * Gerado em: 2025-06-01T17:25:21.392Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('target_audiences').del();

  // Insere dados de exemplo do MySQL
  await knex('target_audiences').insert([
    {
        "id": 1,
        "description": "Publico Teste",
        "is_active": "AQ==",
        "name": "Publico Teste"
    }
]);
}
