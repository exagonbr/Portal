/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: tv_show_author -> tv_show_authors
 * Gerado em: 2025-06-01T17:29:32.156Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('tv_show_authors').del();

  // Insere dados de exemplo do MySQL
  await knex('tv_show_authors').insert([
    {
        "tv_show_authors_id": 2,
        "author_id": 26,
        "id": 1
    },
    {
        "tv_show_authors_id": 10,
        "author_id": 14,
        "id": 2
    },
    {
        "tv_show_authors_id": 10,
        "author_id": 11,
        "id": 3
    },
    {
        "tv_show_authors_id": 10,
        "author_id": 16,
        "id": 4
    },
    {
        "tv_show_authors_id": 9,
        "author_id": 17,
        "id": 5
    },
    {
        "tv_show_authors_id": 11,
        "author_id": 14,
        "id": 6
    },
    {
        "tv_show_authors_id": 11,
        "author_id": 16,
        "id": 7
    },
    {
        "tv_show_authors_id": 15,
        "author_id": 15,
        "id": 8
    },
    {
        "tv_show_authors_id": 18,
        "author_id": 28,
        "id": 9
    },
    {
        "tv_show_authors_id": 20,
        "author_id": 22,
        "id": 10
    },
    {
        "tv_show_authors_id": 21,
        "author_id": 28,
        "id": 11
    },
    {
        "tv_show_authors_id": 2,
        "author_id": 29,
        "id": 12
    },
    {
        "tv_show_authors_id": 26,
        "author_id": 17,
        "id": 13
    },
    {
        "tv_show_authors_id": 28,
        "author_id": 30,
        "id": 14
    },
    {
        "tv_show_authors_id": 30,
        "author_id": 12,
        "id": 15
    },
    {
        "tv_show_authors_id": 30,
        "author_id": 17,
        "id": 16
    },
    {
        "tv_show_authors_id": 36,
        "author_id": 13,
        "id": 17
    },
    {
        "tv_show_authors_id": 36,
        "author_id": 24,
        "id": 18
    },
    {
        "tv_show_authors_id": 37,
        "author_id": 31,
        "id": 19
    },
    {
        "tv_show_authors_id": 37,
        "author_id": 15,
        "id": 20
    },
    {
        "tv_show_authors_id": 37,
        "author_id": 28,
        "id": 21
    },
    {
        "tv_show_authors_id": 39,
        "author_id": 12,
        "id": 22
    },
    {
        "tv_show_authors_id": 40,
        "author_id": 17,
        "id": 23
    },
    {
        "tv_show_authors_id": 40,
        "author_id": 12,
        "id": 24
    },
    {
        "tv_show_authors_id": 42,
        "author_id": 17,
        "id": 25
    },
    {
        "tv_show_authors_id": 44,
        "author_id": 16,
        "id": 26
    },
    {
        "tv_show_authors_id": 49,
        "author_id": 31,
        "id": 27
    },
    {
        "tv_show_authors_id": 49,
        "author_id": 28,
        "id": 28
    },
    {
        "tv_show_authors_id": 50,
        "author_id": 33,
        "id": 29
    },
    {
        "tv_show_authors_id": 51,
        "author_id": 32,
        "id": 30
    },
    {
        "tv_show_authors_id": 52,
        "author_id": 20,
        "id": 31
    },
    {
        "tv_show_authors_id": 53,
        "author_id": 15,
        "id": 32
    },
    {
        "tv_show_authors_id": 53,
        "author_id": 28,
        "id": 33
    },
    {
        "tv_show_authors_id": 53,
        "author_id": 31,
        "id": 34
    },
    {
        "tv_show_authors_id": 54,
        "author_id": 25,
        "id": 35
    },
    {
        "tv_show_authors_id": 57,
        "author_id": 28,
        "id": 36
    },
    {
        "tv_show_authors_id": 57,
        "author_id": 31,
        "id": 37
    },
    {
        "tv_show_authors_id": 57,
        "author_id": 15,
        "id": 38
    },
    {
        "tv_show_authors_id": 58,
        "author_id": 19,
        "id": 39
    },
    {
        "tv_show_authors_id": 58,
        "author_id": 28,
        "id": 40
    },
    {
        "tv_show_authors_id": 59,
        "author_id": 7,
        "id": 41
    },
    {
        "tv_show_authors_id": 60,
        "author_id": 23,
        "id": 42
    },
    {
        "tv_show_authors_id": 61,
        "author_id": 20,
        "id": 43
    },
    {
        "tv_show_authors_id": 62,
        "author_id": 8,
        "id": 44
    },
    {
        "tv_show_authors_id": 63,
        "author_id": 31,
        "id": 45
    },
    {
        "tv_show_authors_id": 68,
        "author_id": 30,
        "id": 47
    },
    {
        "tv_show_authors_id": 70,
        "author_id": 28,
        "id": 48
    },
    {
        "tv_show_authors_id": 70,
        "author_id": 15,
        "id": 49
    },
    {
        "tv_show_authors_id": 70,
        "author_id": 31,
        "id": 50
    },
    {
        "tv_show_authors_id": 71,
        "author_id": 21,
        "id": 51
    },
    {
        "tv_show_authors_id": 72,
        "author_id": 25,
        "id": 52
    },
    {
        "tv_show_authors_id": 42,
        "author_id": 12,
        "id": 53
    },
    {
        "tv_show_authors_id": 63,
        "author_id": 28,
        "id": 54
    },
    {
        "tv_show_authors_id": 63,
        "author_id": 15,
        "id": 55
    },
    {
        "tv_show_authors_id": 60,
        "author_id": 18,
        "id": 56
    },
    {
        "tv_show_authors_id": 15,
        "author_id": 28,
        "id": 57
    },
    {
        "tv_show_authors_id": 13,
        "author_id": 33,
        "id": 58
    },
    {
        "tv_show_authors_id": 69,
        "author_id": 32,
        "id": 59
    },
    {
        "tv_show_authors_id": 41,
        "author_id": 33,
        "id": 60
    },
    {
        "tv_show_authors_id": 11,
        "author_id": 33,
        "id": 61
    },
    {
        "tv_show_authors_id": 41,
        "author_id": 32,
        "id": 62
    },
    {
        "tv_show_authors_id": 15,
        "author_id": 31,
        "id": 63
    },
    {
        "tv_show_authors_id": 74,
        "author_id": 31,
        "id": 64
    },
    {
        "tv_show_authors_id": 74,
        "author_id": 28,
        "id": 65
    },
    {
        "tv_show_authors_id": 12,
        "author_id": 33,
        "id": 66
    },
    {
        "tv_show_authors_id": 75,
        "author_id": 28,
        "id": 67
    },
    {
        "tv_show_authors_id": 75,
        "author_id": 31,
        "id": 68
    },
    {
        "tv_show_authors_id": 76,
        "author_id": 31,
        "id": 69
    },
    {
        "tv_show_authors_id": 76,
        "author_id": 28,
        "id": 70
    },
    {
        "tv_show_authors_id": 77,
        "author_id": 8,
        "id": 71
    },
    {
        "tv_show_authors_id": 78,
        "author_id": 36,
        "id": 72
    },
    {
        "tv_show_authors_id": 78,
        "author_id": 35,
        "id": 73
    },
    {
        "tv_show_authors_id": 79,
        "author_id": 33,
        "id": 74
    },
    {
        "tv_show_authors_id": 80,
        "author_id": 33,
        "id": 75
    },
    {
        "tv_show_authors_id": 73,
        "author_id": 34,
        "id": 76
    },
    {
        "tv_show_authors_id": 7,
        "author_id": 32,
        "id": 77
    },
    {
        "tv_show_authors_id": 46,
        "author_id": 1,
        "id": 78
    },
    {
        "tv_show_authors_id": 31,
        "author_id": 1,
        "id": 79
    },
    {
        "tv_show_authors_id": 35,
        "author_id": 1,
        "id": 80
    },
    {
        "tv_show_authors_id": 33,
        "author_id": 33,
        "id": 81
    },
    {
        "tv_show_authors_id": 27,
        "author_id": 33,
        "id": 82
    },
    {
        "tv_show_authors_id": 21,
        "author_id": 31,
        "id": 83
    },
    {
        "tv_show_authors_id": 18,
        "author_id": 31,
        "id": 84
    },
    {
        "tv_show_authors_id": 14,
        "author_id": 1,
        "id": 85
    },
    {
        "tv_show_authors_id": 16,
        "author_id": 1,
        "id": 86
    },
    {
        "tv_show_authors_id": 22,
        "author_id": 1,
        "id": 87
    },
    {
        "tv_show_authors_id": 23,
        "author_id": 1,
        "id": 88
    },
    {
        "tv_show_authors_id": 24,
        "author_id": 1,
        "id": 89
    },
    {
        "tv_show_authors_id": 17,
        "author_id": 1,
        "id": 90
    },
    {
        "tv_show_authors_id": 25,
        "author_id": 1,
        "id": 91
    },
    {
        "tv_show_authors_id": 29,
        "author_id": 1,
        "id": 92
    },
    {
        "tv_show_authors_id": 67,
        "author_id": 1,
        "id": 93
    },
    {
        "tv_show_authors_id": 66,
        "author_id": 1,
        "id": 94
    },
    {
        "tv_show_authors_id": 65,
        "author_id": 1,
        "id": 95
    },
    {
        "tv_show_authors_id": 56,
        "author_id": 1,
        "id": 96
    },
    {
        "tv_show_authors_id": 55,
        "author_id": 1,
        "id": 97
    },
    {
        "tv_show_authors_id": 48,
        "author_id": 1,
        "id": 98
    },
    {
        "tv_show_authors_id": 47,
        "author_id": 1,
        "id": 99
    },
    {
        "tv_show_authors_id": 45,
        "author_id": 1,
        "id": 100
    },
    {
        "tv_show_authors_id": 43,
        "author_id": 1,
        "id": 101
    }
]);
}
