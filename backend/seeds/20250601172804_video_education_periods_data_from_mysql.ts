/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: video_education_period -> video_education_periods
 * Gerado em: 2025-06-01T17:28:04.998Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('video_education_periods').del();

  // Insere dados de exemplo do MySQL
  await knex('video_education_periods').insert([
    {
        "video_periods_id": 42,
        "education_period_id": 1
    },
    {
        "video_periods_id": 94,
        "education_period_id": 1
    },
    {
        "video_periods_id": 152,
        "education_period_id": 2
    },
    {
        "video_periods_id": 155,
        "education_period_id": 3
    },
    {
        "video_periods_id": 157,
        "education_period_id": 3
    }
]);
}
