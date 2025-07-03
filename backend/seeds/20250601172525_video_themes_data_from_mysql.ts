/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: video_theme -> video_themes
 * Gerado em: 2025-06-01T17:25:25.040Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('video_themes').del();

  // Insere dados de exemplo do MySQL
  await knex('video_themes').insert([
    {
        "video_themes_id": 12,
        "theme_id": 1
    },
    {
        "video_themes_id": 13,
        "theme_id": 1
    },
    {
        "video_themes_id": 14,
        "theme_id": 1
    },
    {
        "video_themes_id": 15,
        "theme_id": 1
    },
    {
        "video_themes_id": 16,
        "theme_id": 1
    },
    {
        "video_themes_id": 17,
        "theme_id": 1
    },
    {
        "video_themes_id": 28,
        "theme_id": 10
    },
    {
        "video_themes_id": 29,
        "theme_id": 10
    },
    {
        "video_themes_id": 30,
        "theme_id": 10
    },
    {
        "video_themes_id": 31,
        "theme_id": 10
    },
    {
        "video_themes_id": 32,
        "theme_id": 10
    },
    {
        "video_themes_id": 33,
        "theme_id": 10
    },
    {
        "video_themes_id": 34,
        "theme_id": 10
    },
    {
        "video_themes_id": 35,
        "theme_id": 10
    },
    {
        "video_themes_id": 41,
        "theme_id": 10
    },
    {
        "video_themes_id": 42,
        "theme_id": 10
    },
    {
        "video_themes_id": 43,
        "theme_id": 10
    },
    {
        "video_themes_id": 44,
        "theme_id": 16
    },
    {
        "video_themes_id": 45,
        "theme_id": 16
    },
    {
        "video_themes_id": 46,
        "theme_id": 16
    },
    {
        "video_themes_id": 47,
        "theme_id": 16
    },
    {
        "video_themes_id": 48,
        "theme_id": 16
    },
    {
        "video_themes_id": 79,
        "theme_id": 9
    },
    {
        "video_themes_id": 80,
        "theme_id": 9
    },
    {
        "video_themes_id": 81,
        "theme_id": 9
    },
    {
        "video_themes_id": 83,
        "theme_id": 10
    },
    {
        "video_themes_id": 83,
        "theme_id": 17
    },
    {
        "video_themes_id": 84,
        "theme_id": 10
    },
    {
        "video_themes_id": 84,
        "theme_id": 17
    },
    {
        "video_themes_id": 85,
        "theme_id": 10
    },
    {
        "video_themes_id": 85,
        "theme_id": 17
    },
    {
        "video_themes_id": 86,
        "theme_id": 17
    },
    {
        "video_themes_id": 86,
        "theme_id": 10
    },
    {
        "video_themes_id": 87,
        "theme_id": 17
    },
    {
        "video_themes_id": 87,
        "theme_id": 10
    },
    {
        "video_themes_id": 88,
        "theme_id": 10
    },
    {
        "video_themes_id": 88,
        "theme_id": 17
    },
    {
        "video_themes_id": 89,
        "theme_id": 17
    },
    {
        "video_themes_id": 89,
        "theme_id": 10
    },
    {
        "video_themes_id": 90,
        "theme_id": 16
    },
    {
        "video_themes_id": 91,
        "theme_id": 16
    },
    {
        "video_themes_id": 92,
        "theme_id": 16
    },
    {
        "video_themes_id": 93,
        "theme_id": 16
    },
    {
        "video_themes_id": 94,
        "theme_id": 17
    },
    {
        "video_themes_id": 96,
        "theme_id": 17
    },
    {
        "video_themes_id": 97,
        "theme_id": 17
    },
    {
        "video_themes_id": 98,
        "theme_id": 17
    },
    {
        "video_themes_id": 124,
        "theme_id": 7
    },
    {
        "video_themes_id": 139,
        "theme_id": 10
    },
    {
        "video_themes_id": 138,
        "theme_id": 10
    },
    {
        "video_themes_id": 150,
        "theme_id": 10
    },
    {
        "video_themes_id": 151,
        "theme_id": 10
    },
    {
        "video_themes_id": 152,
        "theme_id": 10
    },
    {
        "video_themes_id": 153,
        "theme_id": 10
    },
    {
        "video_themes_id": 154,
        "theme_id": 10
    },
    {
        "video_themes_id": 155,
        "theme_id": 10
    },
    {
        "video_themes_id": 156,
        "theme_id": 10
    },
    {
        "video_themes_id": 157,
        "theme_id": 10
    },
    {
        "video_themes_id": 167,
        "theme_id": 13
    },
    {
        "video_themes_id": 167,
        "theme_id": 12
    },
    {
        "video_themes_id": 167,
        "theme_id": 14
    },
    {
        "video_themes_id": 168,
        "theme_id": 12
    },
    {
        "video_themes_id": 168,
        "theme_id": 14
    },
    {
        "video_themes_id": 168,
        "theme_id": 13
    },
    {
        "video_themes_id": 169,
        "theme_id": 12
    },
    {
        "video_themes_id": 169,
        "theme_id": 13
    },
    {
        "video_themes_id": 169,
        "theme_id": 14
    },
    {
        "video_themes_id": 170,
        "theme_id": 14
    },
    {
        "video_themes_id": 170,
        "theme_id": 13
    },
    {
        "video_themes_id": 170,
        "theme_id": 12
    },
    {
        "video_themes_id": 171,
        "theme_id": 14
    },
    {
        "video_themes_id": 171,
        "theme_id": 13
    },
    {
        "video_themes_id": 171,
        "theme_id": 12
    },
    {
        "video_themes_id": 172,
        "theme_id": 13
    },
    {
        "video_themes_id": 172,
        "theme_id": 12
    },
    {
        "video_themes_id": 172,
        "theme_id": 14
    },
    {
        "video_themes_id": 598,
        "theme_id": 13
    }
]);
}
