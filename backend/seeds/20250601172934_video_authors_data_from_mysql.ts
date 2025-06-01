/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: video_author -> video_authors
 * Gerado em: 2025-06-01T17:29:34.851Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('video_authors').del();

  // Insere dados de exemplo do MySQL
  await knex('video_authors').insert([
    {
        "video_authors_id": 72,
        "author_id": 29
    },
    {
        "video_authors_id": 73,
        "author_id": 29
    },
    {
        "video_authors_id": 74,
        "author_id": 29
    },
    {
        "video_authors_id": 75,
        "author_id": 29
    },
    {
        "video_authors_id": 76,
        "author_id": 29
    },
    {
        "video_authors_id": 77,
        "author_id": 29
    },
    {
        "video_authors_id": 68,
        "author_id": 30
    },
    {
        "video_authors_id": 68,
        "author_id": 38
    },
    {
        "video_authors_id": 68,
        "author_id": 29
    },
    {
        "video_authors_id": 68,
        "author_id": 28
    },
    {
        "video_authors_id": 527,
        "author_id": 33
    }
]);
}
