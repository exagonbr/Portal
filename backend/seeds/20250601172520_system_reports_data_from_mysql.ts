/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: report -> system_reports
 * Gerado em: 2025-06-01T17:25:20.655Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('system_reports').del();

  // Insere dados de exemplo do MySQL
  await knex('system_reports').insert([
    {
        "id": 1,
        "created_by_id": 3980,
        "error_code": "CODEC_PROBLEM",
        "resolved": "AQ==",
        "video_id": 246
    },
    {
        "id": 2,
        "created_by_id": 3980,
        "error_code": "CODEC_PROBLEM",
        "resolved": "AQ==",
        "video_id": 246
    },
    {
        "id": 3,
        "created_by_id": 2,
        "error_code": "CODEC_PROBLEM",
        "resolved": "AQ==",
        "video_id": 222
    },
    {
        "id": 4,
        "created_by_id": 3980,
        "error_code": "CODEC_PROBLEM",
        "resolved": "AQ==",
        "video_id": 110
    },
    {
        "id": 5,
        "created_by_id": 2,
        "error_code": "CODEC_PROBLEM",
        "resolved": "AQ==",
        "video_id": 542
    },
    {
        "id": 6,
        "created_by_id": 7108,
        "error_code": "CODEC_PROBLEM",
        "resolved": "AQ==",
        "video_id": 247
    }
]);
}
