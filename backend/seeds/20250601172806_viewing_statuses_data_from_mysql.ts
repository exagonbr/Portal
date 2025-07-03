/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: viewing_status -> viewing_statuses
 * Gerado em: 2025-06-01T17:28:06.407Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('viewing_statuses').del();

  // Insere dados de exemplo do MySQL
  await knex('viewing_statuses').insert([
    {
        "id": 8,
        "completed": "AA==",
        "current_play_time": 318,
        "profile_id": 1,
        "runtime": 928,
        "tv_show_id": 9,
        "user_id": 1,
        "video_id": 13
    },
    {
        "id": 9,
        "completed": "AA==",
        "current_play_time": 216,
        "profile_id": 1,
        "runtime": 893,
        "tv_show_id": 9,
        "user_id": 1,
        "video_id": 12
    },
    {
        "id": 10,
        "completed": "AA==",
        "current_play_time": 301,
        "profile_id": 1,
        "runtime": 878,
        "tv_show_id": 9,
        "user_id": 1,
        "video_id": 11
    },
    {
        "id": 11,
        "completed": "AA==",
        "current_play_time": 403,
        "profile_id": 1,
        "runtime": 928,
        "tv_show_id": 9,
        "user_id": 1,
        "video_id": 17
    },
    {
        "id": 12,
        "completed": "AA==",
        "current_play_time": 419,
        "profile_id": 1,
        "runtime": 928,
        "tv_show_id": 9,
        "user_id": 1,
        "video_id": 14
    },
    {
        "id": 13,
        "completed": "AA==",
        "current_play_time": 336,
        "profile_id": 1,
        "runtime": 893,
        "tv_show_id": 9,
        "user_id": 1,
        "video_id": 16
    },
    {
        "id": 14,
        "completed": "AA==",
        "current_play_time": 328,
        "profile_id": 1,
        "runtime": 878,
        "tv_show_id": 9,
        "user_id": 1,
        "video_id": 15
    },
    {
        "id": 15,
        "completed": "AA==",
        "current_play_time": 200,
        "profile_id": 1,
        "runtime": 611,
        "tv_show_id": 11,
        "user_id": 1,
        "video_id": 20
    },
    {
        "id": 16,
        "completed": "AQ==",
        "current_play_time": 798,
        "profile_id": 2,
        "runtime": 878,
        "tv_show_id": 9,
        "user_id": 2,
        "video_id": 11
    },
    {
        "id": 17,
        "completed": "AA==",
        "current_play_time": 228,
        "profile_id": 2,
        "runtime": 1027,
        "tv_show_id": 11,
        "user_id": 2,
        "video_id": 18
    },
    {
        "id": 19,
        "completed": "AQ==",
        "current_play_time": 1726,
        "profile_id": 2,
        "runtime": 1895,
        "tv_show_id": 12,
        "user_id": 2,
        "video_id": 21
    },
    {
        "id": 20,
        "completed": "AA==",
        "current_play_time": 13,
        "profile_id": 1,
        "runtime": 2592,
        "tv_show_id": 14,
        "user_id": 1,
        "video_id": 35
    },
    {
        "id": 21,
        "completed": "AA==",
        "current_play_time": 13,
        "profile_id": 2,
        "runtime": 1353,
        "tv_show_id": 15,
        "user_id": 2,
        "video_id": 37
    },
    {
        "id": 22,
        "completed": "AA==",
        "current_play_time": 19,
        "profile_id": 2,
        "runtime": 1537,
        "tv_show_id": 15,
        "user_id": 2,
        "video_id": 36
    },
    {
        "id": 23,
        "completed": "AQ==",
        "current_play_time": 1163,
        "profile_id": 2,
        "runtime": 1222,
        "tv_show_id": 15,
        "user_id": 2,
        "video_id": 38
    },
    {
        "id": 24,
        "completed": "AA==",
        "current_play_time": 4,
        "profile_id": 2,
        "runtime": 972,
        "tv_show_id": 15,
        "user_id": 2,
        "video_id": 39
    },
    {
        "id": 25,
        "completed": "AA==",
        "current_play_time": 52,
        "profile_id": 2,
        "runtime": 4574,
        "tv_show_id": 16,
        "user_id": 2,
        "video_id": 41
    },
    {
        "id": 26,
        "completed": "AA==",
        "current_play_time": 2,
        "profile_id": 2,
        "runtime": 2244,
        "tv_show_id": 17,
        "user_id": 2,
        "video_id": 44
    },
    {
        "id": 27,
        "completed": "AA==",
        "current_play_time": 4,
        "profile_id": 2,
        "runtime": 5513,
        "tv_show_id": 16,
        "user_id": 2,
        "video_id": 42
    },
    {
        "id": 28,
        "completed": "AQ==",
        "current_play_time": 2821,
        "profile_id": 2,
        "runtime": 3057,
        "tv_show_id": 17,
        "user_id": 2,
        "video_id": 45
    },
    {
        "id": 29,
        "completed": "AA==",
        "current_play_time": 191,
        "profile_id": 1,
        "runtime": 1370,
        "tv_show_id": 18,
        "user_id": 1,
        "video_id": 48
    },
    {
        "id": 30,
        "completed": "AA==",
        "current_play_time": 112,
        "profile_id": 1,
        "runtime": 1085,
        "tv_show_id": 18,
        "user_id": 1,
        "video_id": 49
    },
    {
        "id": 31,
        "completed": "AA==",
        "current_play_time": 15,
        "profile_id": 2,
        "runtime": 1124,
        "tv_show_id": 20,
        "user_id": 2,
        "video_id": 61
    },
    {
        "id": 32,
        "completed": "AA==",
        "current_play_time": 185,
        "profile_id": 2,
        "runtime": 1305,
        "tv_show_id": 20,
        "user_id": 2,
        "video_id": 62
    },
    {
        "id": 33,
        "completed": "AA==",
        "current_play_time": 4,
        "profile_id": 2,
        "runtime": 1037,
        "tv_show_id": 20,
        "user_id": 2,
        "video_id": 63
    },
    {
        "id": 34,
        "completed": "AA==",
        "current_play_time": 4,
        "profile_id": 2,
        "runtime": 1291,
        "tv_show_id": 20,
        "user_id": 2,
        "video_id": 64
    },
    {
        "id": 35,
        "completed": "AA==",
        "current_play_time": 4,
        "profile_id": 2,
        "runtime": 831,
        "tv_show_id": 20,
        "user_id": 2,
        "video_id": 65
    },
    {
        "id": 36,
        "completed": "AA==",
        "current_play_time": 8,
        "profile_id": 2,
        "runtime": 936,
        "tv_show_id": 20,
        "user_id": 2,
        "video_id": 78
    },
    {
        "id": 37,
        "completed": "AA==",
        "current_play_time": 1424,
        "profile_id": 2,
        "runtime": 1489,
        "tv_show_id": 21,
        "user_id": 2,
        "video_id": 66
    },
    {
        "id": 38,
        "completed": "AA==",
        "current_play_time": 1229,
        "profile_id": 2,
        "runtime": 1265,
        "tv_show_id": 21,
        "user_id": 2,
        "video_id": 67
    },
    {
        "id": 40,
        "completed": "AQ==",
        "current_play_time": 1371,
        "profile_id": 2,
        "runtime": 1387,
        "tv_show_id": 21,
        "user_id": 2,
        "video_id": 70
    },
    {
        "id": 41,
        "completed": "AA==",
        "current_play_time": 4,
        "profile_id": 2,
        "runtime": 3390,
        "tv_show_id": 22,
        "user_id": 2,
        "video_id": 80
    },
    {
        "id": 42,
        "completed": "AA==",
        "current_play_time": 8,
        "profile_id": 2,
        "runtime": 3117,
        "tv_show_id": 22,
        "user_id": 2,
        "video_id": 81
    },
    {
        "id": 43,
        "completed": "AA==",
        "current_play_time": 292,
        "profile_id": 2,
        "runtime": 1823,
        "tv_show_id": 24,
        "user_id": 2,
        "video_id": 90
    },
    {
        "id": 44,
        "completed": "AA==",
        "current_play_time": 683,
        "profile_id": 2,
        "runtime": 1861,
        "tv_show_id": 24,
        "user_id": 2,
        "video_id": 91
    },
    {
        "id": 45,
        "completed": "AQ==",
        "current_play_time": 1648,
        "profile_id": 2,
        "runtime": 1753,
        "tv_show_id": 24,
        "user_id": 2,
        "video_id": 92
    },
    {
        "id": 46,
        "completed": "AA==",
        "current_play_time": 1558,
        "profile_id": 2,
        "runtime": 3207,
        "tv_show_id": 25,
        "user_id": 2,
        "video_id": 94
    },
    {
        "id": 47,
        "completed": "AA==",
        "current_play_time": 8,
        "profile_id": 2,
        "runtime": 3095,
        "tv_show_id": 25,
        "user_id": 2,
        "video_id": 98
    },
    {
        "id": 48,
        "completed": "AA==",
        "current_play_time": 930,
        "profile_id": 2,
        "runtime": 1594,
        "tv_show_id": 26,
        "user_id": 2,
        "video_id": 103
    },
    {
        "id": 49,
        "completed": "AA==",
        "current_play_time": 13,
        "profile_id": 2,
        "runtime": 1087,
        "tv_show_id": 18,
        "user_id": 2,
        "video_id": 49
    },
    {
        "id": 50,
        "completed": "AQ==",
        "current_play_time": 1367,
        "profile_id": 2,
        "runtime": 1370,
        "tv_show_id": 18,
        "user_id": 2,
        "video_id": 48
    },
    {
        "id": 51,
        "completed": "AA==",
        "current_play_time": 163,
        "profile_id": 3,
        "runtime": 2372,
        "tv_show_id": 32,
        "user_id": 3,
        "video_id": 144
    },
    {
        "id": 52,
        "completed": "AA==",
        "current_play_time": 548,
        "profile_id": 1,
        "runtime": 2046,
        "tv_show_id": 28,
        "user_id": 1,
        "video_id": 110
    },
    {
        "id": 53,
        "completed": "AA==",
        "current_play_time": 354,
        "profile_id": 1,
        "runtime": 2046,
        "tv_show_id": 28,
        "user_id": 1,
        "video_id": 110
    },
    {
        "id": 54,
        "completed": "AA==",
        "current_play_time": 4,
        "profile_id": 1,
        "runtime": 4574,
        "tv_show_id": 16,
        "user_id": 1,
        "video_id": 41
    },
    {
        "id": 55,
        "completed": "AQ==",
        "current_play_time": 278,
        "profile_id": 3,
        "runtime": 281,
        "tv_show_id": 41,
        "user_id": 3,
        "video_id": 191
    },
    {
        "id": 56,
        "completed": "AA==",
        "current_play_time": 170,
        "profile_id": 1,
        "runtime": 1359,
        "tv_show_id": 27,
        "user_id": 1,
        "video_id": 104
    },
    {
        "id": 57,
        "completed": "AA==",
        "current_play_time": 869,
        "profile_id": 3795,
        "runtime": 5129,
        "tv_show_id": 32,
        "user_id": 3979,
        "video_id": 138
    },
    {
        "id": 59,
        "completed": "AA==",
        "current_play_time": 416,
        "profile_id": 3795,
        "runtime": 1370,
        "tv_show_id": 18,
        "user_id": 3979,
        "video_id": 48
    },
    {
        "id": 61,
        "completed": "AA==",
        "current_play_time": 9,
        "profile_id": 3794,
        "runtime": 3494,
        "tv_show_id": 38,
        "user_id": 3978,
        "video_id": 167
    },
    {
        "id": 62,
        "completed": "AA==",
        "current_play_time": 9,
        "profile_id": 3794,
        "runtime": 2675,
        "tv_show_id": 45,
        "user_id": 3978,
        "video_id": 214
    },
    {
        "id": 63,
        "completed": "AA==",
        "current_play_time": 24,
        "profile_id": 3794,
        "runtime": 928,
        "tv_show_id": 9,
        "user_id": 3978,
        "video_id": 17
    },
    {
        "id": 64,
        "completed": "AA==",
        "current_play_time": 27,
        "profile_id": 3796,
        "runtime": 1009,
        "tv_show_id": 7,
        "user_id": 3980,
        "video_id": 50
    },
    {
        "id": 65,
        "completed": "AA==",
        "current_play_time": 3381,
        "profile_id": 3796,
        "runtime": 3399,
        "tv_show_id": 14,
        "user_id": 3980,
        "video_id": 27
    },
    {
        "id": 66,
        "completed": "AA==",
        "current_play_time": 2795,
        "profile_id": 2,
        "runtime": 5129,
        "tv_show_id": 32,
        "user_id": 2,
        "video_id": 138
    },
    {
        "id": 67,
        "completed": "AA==",
        "current_play_time": 1785,
        "profile_id": 3796,
        "runtime": 1880,
        "tv_show_id": 28,
        "user_id": 3980,
        "video_id": 121
    },
    {
        "id": 68,
        "completed": "AA==",
        "current_play_time": 2061,
        "profile_id": 3796,
        "runtime": 2114,
        "tv_show_id": 28,
        "user_id": 3980,
        "video_id": 122
    },
    {
        "id": 69,
        "completed": "AQ==",
        "current_play_time": 2353,
        "profile_id": 3796,
        "runtime": 2454,
        "tv_show_id": 28,
        "user_id": 3980,
        "video_id": 443
    },
    {
        "id": 70,
        "completed": "AA==",
        "current_play_time": 2134,
        "profile_id": 3796,
        "runtime": 2291,
        "tv_show_id": 28,
        "user_id": 3980,
        "video_id": 441
    },
    {
        "id": 71,
        "completed": "AA==",
        "current_play_time": 1826,
        "profile_id": 3796,
        "runtime": 1922,
        "tv_show_id": 28,
        "user_id": 3980,
        "video_id": 448
    },
    {
        "id": 72,
        "completed": "AA==",
        "current_play_time": 1781,
        "profile_id": 3796,
        "runtime": 1855,
        "tv_show_id": 28,
        "user_id": 3980,
        "video_id": 449
    },
    {
        "id": 73,
        "completed": "AA==",
        "current_play_time": 1935,
        "profile_id": 3796,
        "runtime": 1971,
        "tv_show_id": 28,
        "user_id": 3980,
        "video_id": 112
    },
    {
        "id": 74,
        "completed": "AA==",
        "current_play_time": 1808,
        "profile_id": 3796,
        "runtime": 1872,
        "tv_show_id": 28,
        "user_id": 3980,
        "video_id": 451
    },
    {
        "id": 75,
        "completed": "AQ==",
        "current_play_time": 1573,
        "profile_id": 3796,
        "runtime": 1601,
        "tv_show_id": 28,
        "user_id": 3980,
        "video_id": 455
    },
    {
        "id": 76,
        "completed": "AA==",
        "current_play_time": 1294,
        "profile_id": 3796,
        "runtime": 1388,
        "tv_show_id": 2,
        "user_id": 3980,
        "video_id": 71
    },
    {
        "id": 77,
        "completed": "AA==",
        "current_play_time": 1540,
        "profile_id": 3796,
        "runtime": 1696,
        "tv_show_id": 2,
        "user_id": 3980,
        "video_id": 72
    },
    {
        "id": 78,
        "completed": "AA==",
        "current_play_time": 1992,
        "profile_id": 3796,
        "runtime": 2054,
        "tv_show_id": 2,
        "user_id": 3980,
        "video_id": 73
    },
    {
        "id": 79,
        "completed": "AA==",
        "current_play_time": 1536,
        "profile_id": 3796,
        "runtime": 1650,
        "tv_show_id": 2,
        "user_id": 3980,
        "video_id": 74
    },
    {
        "id": 80,
        "completed": "AA==",
        "current_play_time": 914,
        "profile_id": 3796,
        "runtime": 988,
        "tv_show_id": 2,
        "user_id": 3980,
        "video_id": 75
    },
    {
        "id": 81,
        "completed": "AQ==",
        "current_play_time": 1267,
        "profile_id": 3796,
        "runtime": 1299,
        "tv_show_id": 2,
        "user_id": 3980,
        "video_id": 76
    },
    {
        "id": 82,
        "completed": "AQ==",
        "current_play_time": 1382,
        "profile_id": 3796,
        "runtime": 1454,
        "tv_show_id": 2,
        "user_id": 3980,
        "video_id": 77
    },
    {
        "id": 83,
        "completed": "AA==",
        "current_play_time": 441,
        "profile_id": 3796,
        "runtime": 1698,
        "tv_show_id": 59,
        "user_id": 3980,
        "video_id": 340
    },
    {
        "id": 84,
        "completed": "AA==",
        "current_play_time": 18,
        "profile_id": 3796,
        "runtime": 1636,
        "tv_show_id": 59,
        "user_id": 3980,
        "video_id": 341
    },
    {
        "id": 85,
        "completed": "AA==",
        "current_play_time": 129,
        "profile_id": 3796,
        "runtime": 969,
        "tv_show_id": 59,
        "user_id": 3980,
        "video_id": 342
    },
    {
        "id": 86,
        "completed": "AA==",
        "current_play_time": 21,
        "profile_id": 3796,
        "runtime": 947,
        "tv_show_id": 59,
        "user_id": 3980,
        "video_id": 343
    },
    {
        "id": 87,
        "completed": "AA==",
        "current_play_time": 20,
        "profile_id": 3796,
        "runtime": 1170,
        "tv_show_id": 59,
        "user_id": 3980,
        "video_id": 344
    },
    {
        "id": 88,
        "completed": "AA==",
        "current_play_time": 28,
        "profile_id": 3796,
        "runtime": 938,
        "tv_show_id": 59,
        "user_id": 3980,
        "video_id": 345
    },
    {
        "id": 89,
        "completed": "AQ==",
        "current_play_time": 859,
        "profile_id": 3796,
        "runtime": 878,
        "tv_show_id": 9,
        "user_id": 3980,
        "video_id": 11
    },
    {
        "id": 90,
        "completed": "AA==",
        "current_play_time": 13,
        "profile_id": 3796,
        "runtime": 893,
        "tv_show_id": 9,
        "user_id": 3980,
        "video_id": 12
    },
    {
        "id": 91,
        "completed": "AQ==",
        "current_play_time": 885,
        "profile_id": 3796,
        "runtime": 928,
        "tv_show_id": 9,
        "user_id": 3980,
        "video_id": 13
    },
    {
        "id": 92,
        "completed": "AQ==",
        "current_play_time": 916,
        "profile_id": 3796,
        "runtime": 974,
        "tv_show_id": 9,
        "user_id": 3980,
        "video_id": 14
    },
    {
        "id": 93,
        "completed": "AQ==",
        "current_play_time": 544,
        "profile_id": 3796,
        "runtime": 591,
        "tv_show_id": 9,
        "user_id": 3980,
        "video_id": 15
    },
    {
        "id": 94,
        "completed": "AQ==",
        "current_play_time": 648,
        "profile_id": 3796,
        "runtime": 704,
        "tv_show_id": 9,
        "user_id": 3980,
        "video_id": 17
    },
    {
        "id": 95,
        "completed": "AQ==",
        "current_play_time": 429,
        "profile_id": 3796,
        "runtime": 438,
        "tv_show_id": 9,
        "user_id": 3980,
        "video_id": 16
    },
    {
        "id": 96,
        "completed": "AQ==",
        "current_play_time": 878,
        "profile_id": 3796,
        "runtime": 952,
        "tv_show_id": 39,
        "user_id": 3980,
        "video_id": 173
    },
    {
        "id": 97,
        "completed": "AA==",
        "current_play_time": 18,
        "profile_id": 3796,
        "runtime": 846,
        "tv_show_id": 39,
        "user_id": 3980,
        "video_id": 174
    },
    {
        "id": 98,
        "completed": "AA==",
        "current_play_time": 78,
        "profile_id": 3796,
        "runtime": 785,
        "tv_show_id": 39,
        "user_id": 3980,
        "video_id": 175
    },
    {
        "id": 99,
        "completed": "AA==",
        "current_play_time": 13,
        "profile_id": 3796,
        "runtime": 899,
        "tv_show_id": 39,
        "user_id": 3980,
        "video_id": 176
    },
    {
        "id": 100,
        "completed": "AA==",
        "current_play_time": 18,
        "profile_id": 3796,
        "runtime": 1080,
        "tv_show_id": 39,
        "user_id": 3980,
        "video_id": 177
    },
    {
        "id": 101,
        "completed": "AA==",
        "current_play_time": 12,
        "profile_id": 3796,
        "runtime": 828,
        "tv_show_id": 39,
        "user_id": 3980,
        "video_id": 178
    },
    {
        "id": 102,
        "completed": "AA==",
        "current_play_time": 27,
        "profile_id": 3796,
        "runtime": 851,
        "tv_show_id": 39,
        "user_id": 3980,
        "video_id": 261
    },
    {
        "id": 103,
        "completed": "AA==",
        "current_play_time": 18,
        "profile_id": 3796,
        "runtime": 1404,
        "tv_show_id": 39,
        "user_id": 3980,
        "video_id": 262
    },
    {
        "id": 104,
        "completed": "AA==",
        "current_play_time": 235,
        "profile_id": 3796,
        "runtime": 1984,
        "tv_show_id": 26,
        "user_id": 3980,
        "video_id": 99
    },
    {
        "id": 105,
        "completed": "AA==",
        "current_play_time": 723,
        "profile_id": 3796,
        "runtime": 1983,
        "tv_show_id": 26,
        "user_id": 3980,
        "video_id": 100
    },
    {
        "id": 106,
        "completed": "AA==",
        "current_play_time": 977,
        "profile_id": 3796,
        "runtime": 1033,
        "tv_show_id": 26,
        "user_id": 3980,
        "video_id": 101
    },
    {
        "id": 107,
        "completed": "AQ==",
        "current_play_time": 1898,
        "profile_id": 3796,
        "runtime": 1947,
        "tv_show_id": 26,
        "user_id": 3980,
        "video_id": 102
    },
    {
        "id": 108,
        "completed": "AQ==",
        "current_play_time": 1584,
        "profile_id": 3796,
        "runtime": 1594,
        "tv_show_id": 26,
        "user_id": 3980,
        "video_id": 103
    },
    {
        "id": 109,
        "completed": "AA==",
        "current_play_time": 15,
        "profile_id": 3796,
        "runtime": 1489,
        "tv_show_id": 21,
        "user_id": 3980,
        "video_id": 66
    },
    {
        "id": 110,
        "completed": "AA==",
        "current_play_time": 18,
        "profile_id": 3796,
        "runtime": 1265,
        "tv_show_id": 21,
        "user_id": 3980,
        "video_id": 67
    },
    {
        "id": 111,
        "completed": "AA==",
        "current_play_time": 33,
        "profile_id": 3796,
        "runtime": 983,
        "tv_show_id": 21,
        "user_id": 3980,
        "video_id": 69
    }
]);
}
