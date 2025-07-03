/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: watchlist_entry -> watchlist_entries
 * Gerado em: 2025-06-01T17:29:35.993Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('watchlist_entries').del();

  // Insere dados de exemplo do MySQL
  await knex('watchlist_entries').insert([
    {
        "id": 3,
        "is_deleted": "AQ==",
        "profile_id": 1,
        "tv_show_id": 9,
        "user_id": 1,
        "video_id": null
    },
    {
        "id": 4,
        "is_deleted": "AA==",
        "profile_id": 1,
        "tv_show_id": 9,
        "user_id": 1,
        "video_id": null
    },
    {
        "id": 5,
        "is_deleted": "AQ==",
        "profile_id": 2,
        "tv_show_id": 14,
        "user_id": 2,
        "video_id": null
    },
    {
        "id": 6,
        "is_deleted": "AA==",
        "profile_id": 1,
        "tv_show_id": 16,
        "user_id": 1,
        "video_id": null
    },
    {
        "id": 7,
        "is_deleted": "AA==",
        "profile_id": 3795,
        "tv_show_id": 11,
        "user_id": 3979,
        "video_id": null
    },
    {
        "id": 8,
        "is_deleted": "AA==",
        "profile_id": 3795,
        "tv_show_id": 56,
        "user_id": 3979,
        "video_id": null
    },
    {
        "id": 9,
        "is_deleted": "AQ==",
        "profile_id": 3794,
        "tv_show_id": 45,
        "user_id": 3978,
        "video_id": null
    },
    {
        "id": 10,
        "is_deleted": "AA==",
        "profile_id": 3794,
        "tv_show_id": 7,
        "user_id": 3978,
        "video_id": null
    },
    {
        "id": 11,
        "is_deleted": "AA==",
        "profile_id": 3794,
        "tv_show_id": 45,
        "user_id": 3978,
        "video_id": null
    },
    {
        "id": 12,
        "is_deleted": "AA==",
        "profile_id": 3794,
        "tv_show_id": 16,
        "user_id": 3978,
        "video_id": null
    },
    {
        "id": 13,
        "is_deleted": "AQ==",
        "profile_id": 3794,
        "tv_show_id": 11,
        "user_id": 3978,
        "video_id": null
    },
    {
        "id": 14,
        "is_deleted": "AQ==",
        "profile_id": 3794,
        "tv_show_id": 22,
        "user_id": 3978,
        "video_id": null
    },
    {
        "id": 15,
        "is_deleted": "AA==",
        "profile_id": 3796,
        "tv_show_id": 11,
        "user_id": 3980,
        "video_id": null
    },
    {
        "id": 16,
        "is_deleted": "AA==",
        "profile_id": 3796,
        "tv_show_id": 7,
        "user_id": 3980,
        "video_id": null
    },
    {
        "id": 17,
        "is_deleted": "AA==",
        "profile_id": 3796,
        "tv_show_id": 9,
        "user_id": 3980,
        "video_id": null
    },
    {
        "id": 18,
        "is_deleted": "AQ==",
        "profile_id": 2,
        "tv_show_id": 28,
        "user_id": 2,
        "video_id": null
    },
    {
        "id": 19,
        "is_deleted": "AA==",
        "profile_id": 3796,
        "tv_show_id": 38,
        "user_id": 3980,
        "video_id": null
    },
    {
        "id": 20,
        "is_deleted": "AA==",
        "profile_id": 3796,
        "tv_show_id": 28,
        "user_id": 3980,
        "video_id": null
    },
    {
        "id": 21,
        "is_deleted": "AA==",
        "profile_id": 3796,
        "tv_show_id": 2,
        "user_id": 3980,
        "video_id": null
    },
    {
        "id": 22,
        "is_deleted": "AA==",
        "profile_id": 3796,
        "tv_show_id": 14,
        "user_id": 3980,
        "video_id": null
    },
    {
        "id": 23,
        "is_deleted": "AA==",
        "profile_id": 4804,
        "tv_show_id": 17,
        "user_id": 5496,
        "video_id": null
    },
    {
        "id": 24,
        "is_deleted": "AQ==",
        "profile_id": 4271,
        "tv_show_id": 24,
        "user_id": 5311,
        "video_id": null
    },
    {
        "id": 25,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 56,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 26,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 15,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 27,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 11,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 28,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 23,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 29,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 26,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 30,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 30,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 31,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 44,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 32,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 21,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 33,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 42,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 34,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 43,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 35,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 46,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 36,
        "is_deleted": "AQ==",
        "profile_id": 6333,
        "tv_show_id": 47,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 37,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 38,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 38,
        "is_deleted": "AA==",
        "profile_id": 6333,
        "tv_show_id": 48,
        "user_id": 7068,
        "video_id": null
    },
    {
        "id": 39,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 11,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 40,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 2,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 41,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 15,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 42,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 23,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 43,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 24,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 44,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 28,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 45,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 66,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 46,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 12,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 47,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 61,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 48,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 55,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 49,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 56,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 50,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 71,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 51,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 48,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 52,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 46,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 53,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 31,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 54,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 45,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 55,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 43,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 56,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 42,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 57,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 39,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 58,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 38,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 59,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 41,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 60,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 37,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 61,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 34,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 62,
        "is_deleted": "AA==",
        "profile_id": 6313,
        "tv_show_id": 32,
        "user_id": 6792,
        "video_id": null
    },
    {
        "id": 63,
        "is_deleted": "AQ==",
        "profile_id": 4918,
        "tv_show_id": 9,
        "user_id": 5787,
        "video_id": null
    },
    {
        "id": 64,
        "is_deleted": "AA==",
        "profile_id": 4918,
        "tv_show_id": 9,
        "user_id": 5787,
        "video_id": null
    },
    {
        "id": 65,
        "is_deleted": "AQ==",
        "profile_id": 4918,
        "tv_show_id": 66,
        "user_id": 5787,
        "video_id": null
    },
    {
        "id": 66,
        "is_deleted": "AA==",
        "profile_id": 4918,
        "tv_show_id": 66,
        "user_id": 5787,
        "video_id": null
    },
    {
        "id": 67,
        "is_deleted": "AQ==",
        "profile_id": 4918,
        "tv_show_id": 7,
        "user_id": 5787,
        "video_id": null
    },
    {
        "id": 68,
        "is_deleted": "AA==",
        "profile_id": 4918,
        "tv_show_id": 7,
        "user_id": 5787,
        "video_id": null
    },
    {
        "id": 69,
        "is_deleted": "AA==",
        "profile_id": 4804,
        "tv_show_id": 23,
        "user_id": 5496,
        "video_id": null
    },
    {
        "id": 70,
        "is_deleted": "AA==",
        "profile_id": 4804,
        "tv_show_id": 23,
        "user_id": 5496,
        "video_id": null
    },
    {
        "id": 71,
        "is_deleted": "AA==",
        "profile_id": 5559,
        "tv_show_id": 7,
        "user_id": 6516,
        "video_id": null
    },
    {
        "id": 72,
        "is_deleted": "AA==",
        "profile_id": 5559,
        "tv_show_id": 7,
        "user_id": 6516,
        "video_id": null
    },
    {
        "id": 73,
        "is_deleted": "AA==",
        "profile_id": 5559,
        "tv_show_id": 7,
        "user_id": 6516,
        "video_id": null
    },
    {
        "id": 74,
        "is_deleted": "AA==",
        "profile_id": 5559,
        "tv_show_id": 7,
        "user_id": 6516,
        "video_id": null
    },
    {
        "id": 75,
        "is_deleted": "AA==",
        "profile_id": 5559,
        "tv_show_id": 7,
        "user_id": 6516,
        "video_id": null
    },
    {
        "id": 76,
        "is_deleted": "AA==",
        "profile_id": 3112,
        "tv_show_id": 66,
        "user_id": 3275,
        "video_id": null
    },
    {
        "id": 77,
        "is_deleted": "AA==",
        "profile_id": 3112,
        "tv_show_id": 45,
        "user_id": 3275,
        "video_id": null
    },
    {
        "id": 78,
        "is_deleted": "AA==",
        "profile_id": 4804,
        "tv_show_id": 9,
        "user_id": 5496,
        "video_id": null
    },
    {
        "id": 79,
        "is_deleted": "AA==",
        "profile_id": 4804,
        "tv_show_id": 7,
        "user_id": 5496,
        "video_id": null
    },
    {
        "id": 80,
        "is_deleted": "AA==",
        "profile_id": 4804,
        "tv_show_id": 7,
        "user_id": 5496,
        "video_id": null
    },
    {
        "id": 81,
        "is_deleted": "AA==",
        "profile_id": 4185,
        "tv_show_id": 46,
        "user_id": 5189,
        "video_id": null
    },
    {
        "id": 82,
        "is_deleted": "AA==",
        "profile_id": 4185,
        "tv_show_id": 46,
        "user_id": 5189,
        "video_id": null
    },
    {
        "id": 83,
        "is_deleted": "AA==",
        "profile_id": 4214,
        "tv_show_id": 32,
        "user_id": 5244,
        "video_id": null
    },
    {
        "id": 84,
        "is_deleted": "AA==",
        "profile_id": 4214,
        "tv_show_id": 67,
        "user_id": 5244,
        "video_id": null
    },
    {
        "id": 85,
        "is_deleted": "AQ==",
        "profile_id": 3797,
        "tv_show_id": 9,
        "user_id": 3981,
        "video_id": null
    },
    {
        "id": 86,
        "is_deleted": "AQ==",
        "profile_id": 3797,
        "tv_show_id": 68,
        "user_id": 3981,
        "video_id": null
    },
    {
        "id": 87,
        "is_deleted": "AQ==",
        "profile_id": 6910,
        "tv_show_id": 63,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 88,
        "is_deleted": "AQ==",
        "profile_id": 6910,
        "tv_show_id": 2,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 89,
        "is_deleted": "AA==",
        "profile_id": 6910,
        "tv_show_id": 2,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 90,
        "is_deleted": "AA==",
        "profile_id": 6910,
        "tv_show_id": 9,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 91,
        "is_deleted": "AQ==",
        "profile_id": 6910,
        "tv_show_id": 64,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 92,
        "is_deleted": "AQ==",
        "profile_id": 6910,
        "tv_show_id": 64,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 93,
        "is_deleted": "AA==",
        "profile_id": 6910,
        "tv_show_id": 64,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 94,
        "is_deleted": "AA==",
        "profile_id": 6910,
        "tv_show_id": 71,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 95,
        "is_deleted": "AA==",
        "profile_id": 6910,
        "tv_show_id": 21,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 96,
        "is_deleted": "AA==",
        "profile_id": 6910,
        "tv_show_id": 72,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 97,
        "is_deleted": "AA==",
        "profile_id": 6910,
        "tv_show_id": 20,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 98,
        "is_deleted": "AQ==",
        "profile_id": 6910,
        "tv_show_id": 30,
        "user_id": 7094,
        "video_id": null
    },
    {
        "id": 99,
        "is_deleted": "AA==",
        "profile_id": 3759,
        "tv_show_id": 68,
        "user_id": 3939,
        "video_id": null
    },
    {
        "id": 100,
        "is_deleted": "AA==",
        "profile_id": 6758,
        "tv_show_id": 14,
        "user_id": 4534,
        "video_id": null
    },
    {
        "id": 101,
        "is_deleted": "AA==",
        "profile_id": 6758,
        "tv_show_id": 14,
        "user_id": 4534,
        "video_id": null
    },
    {
        "id": 102,
        "is_deleted": "AA==",
        "profile_id": 6758,
        "tv_show_id": 14,
        "user_id": 4534,
        "video_id": null
    }
]);
}
