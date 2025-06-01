/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: tv_show_target_audience -> tv_show_target_audiences
 * Gerado em: 2025-06-01T17:29:32.337Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('tv_show_target_audiences').del();

  // Insere dados de exemplo do MySQL
  await knex('tv_show_target_audiences').insert([
    {
        "tv_show_target_audiences_id": 20,
        "target_audience_id": 1
    },
    {
        "tv_show_target_audiences_id": 9,
        "target_audience_id": 1
    },
    {
        "tv_show_target_audiences_id": 11,
        "target_audience_id": 1
    },
    {
        "tv_show_target_audiences_id": 2,
        "target_audience_id": 1
    },
    {
        "tv_show_target_audiences_id": 25,
        "target_audience_id": 1
    },
    {
        "tv_show_target_audiences_id": 19,
        "target_audience_id": 1
    }
]);
}
