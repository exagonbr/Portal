/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: user_answer -> user_question_answers
 * Gerado em: 2025-06-01T17:28:03.226Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('user_question_answers').del();

  // Insere dados de exemplo do MySQL
  await knex('user_question_answers').insert([
    {
        "answer_id": 71,
        "question_id": 19,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 1
    },
    {
        "answer_id": 74,
        "question_id": 20,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 2
    },
    {
        "answer_id": 1464,
        "question_id": 367,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 3
    },
    {
        "answer_id": 1721,
        "question_id": 431,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 4
    },
    {
        "answer_id": 80,
        "question_id": 21,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 5
    },
    {
        "answer_id": 549,
        "question_id": 138,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 6
    },
    {
        "answer_id": 1468,
        "question_id": 368,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 7
    },
    {
        "answer_id": 1721,
        "question_id": 431,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 8
    },
    {
        "answer_id": 2829,
        "question_id": 708,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 9
    },
    {
        "answer_id": 1722,
        "question_id": 432,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 10
    },
    {
        "answer_id": 2832,
        "question_id": 709,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 11
    },
    {
        "answer_id": 1722,
        "question_id": 432,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 12
    },
    {
        "answer_id": 83,
        "question_id": 22,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 13
    },
    {
        "answer_id": 2837,
        "question_id": 710,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 14
    },
    {
        "answer_id": 550,
        "question_id": 139,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 15
    },
    {
        "answer_id": 86,
        "question_id": 23,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 16
    },
    {
        "answer_id": 2839,
        "question_id": 711,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 17
    },
    {
        "answer_id": 93,
        "question_id": 24,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 18
    },
    {
        "answer_id": 2843,
        "question_id": 712,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 19
    },
    {
        "answer_id": 630,
        "question_id": 159,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 20
    },
    {
        "answer_id": 95,
        "question_id": 25,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 21
    },
    {
        "answer_id": 2847,
        "question_id": 713,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 22
    },
    {
        "answer_id": 634,
        "question_id": 160,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 23
    },
    {
        "answer_id": 101,
        "question_id": 26,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 24
    },
    {
        "answer_id": 2853,
        "question_id": 714,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 25
    },
    {
        "answer_id": 640,
        "question_id": 161,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 26
    },
    {
        "answer_id": 1761,
        "question_id": 441,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 27
    },
    {
        "answer_id": 2856,
        "question_id": 715,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 28
    },
    {
        "answer_id": 113,
        "question_id": 29,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 29
    },
    {
        "answer_id": 645,
        "question_id": 162,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 30
    },
    {
        "answer_id": 1762,
        "question_id": 442,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 31
    },
    {
        "answer_id": 2859,
        "question_id": 716,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 32
    },
    {
        "answer_id": 646,
        "question_id": 163,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 33
    },
    {
        "answer_id": 1761,
        "question_id": 441,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 34
    },
    {
        "answer_id": 2864,
        "question_id": 717,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 35
    },
    {
        "answer_id": 651,
        "question_id": 164,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 36
    },
    {
        "answer_id": 2867,
        "question_id": 718,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 37
    },
    {
        "answer_id": 116,
        "question_id": 30,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 38
    },
    {
        "answer_id": 655,
        "question_id": 165,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 39
    },
    {
        "answer_id": 2873,
        "question_id": 719,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 40
    },
    {
        "answer_id": 118,
        "question_id": 31,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 41
    },
    {
        "answer_id": 1762,
        "question_id": 442,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 42
    },
    {
        "answer_id": 2876,
        "question_id": 720,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 43
    },
    {
        "answer_id": 122,
        "question_id": 32,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 44
    },
    {
        "answer_id": 661,
        "question_id": 166,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 45
    },
    {
        "answer_id": 1784,
        "question_id": 447,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 46
    },
    {
        "answer_id": 2879,
        "question_id": 721,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 47
    },
    {
        "answer_id": 129,
        "question_id": 33,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 48
    },
    {
        "answer_id": 1787,
        "question_id": 448,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 49
    },
    {
        "answer_id": 2884,
        "question_id": 722,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 50
    },
    {
        "answer_id": 131,
        "question_id": 34,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 51
    },
    {
        "answer_id": 665,
        "question_id": 167,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 52
    },
    {
        "answer_id": 1784,
        "question_id": 447,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 53
    },
    {
        "answer_id": 144,
        "question_id": 37,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 54
    },
    {
        "answer_id": 668,
        "question_id": 168,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 55
    },
    {
        "answer_id": 1787,
        "question_id": 448,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 56
    },
    {
        "answer_id": 148,
        "question_id": 38,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 57
    },
    {
        "answer_id": 1791,
        "question_id": 449,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 58
    },
    {
        "answer_id": 152,
        "question_id": 39,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 59
    },
    {
        "answer_id": 1791,
        "question_id": 449,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 60
    },
    {
        "answer_id": 672,
        "question_id": 169,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 61
    },
    {
        "answer_id": 2889,
        "question_id": 723,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 62
    },
    {
        "answer_id": 1794,
        "question_id": 450,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 63
    },
    {
        "answer_id": 676,
        "question_id": 170,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 64
    },
    {
        "answer_id": 3229,
        "question_id": 808,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 65
    },
    {
        "answer_id": 1794,
        "question_id": 450,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 66
    },
    {
        "answer_id": 680,
        "question_id": 171,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 67
    },
    {
        "answer_id": 3232,
        "question_id": 809,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 68
    },
    {
        "answer_id": 1800,
        "question_id": 451,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 69
    },
    {
        "answer_id": 683,
        "question_id": 172,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 70
    },
    {
        "answer_id": 688,
        "question_id": 173,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 71
    },
    {
        "answer_id": 3235,
        "question_id": 810,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 72
    },
    {
        "answer_id": 155,
        "question_id": 40,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 73
    },
    {
        "answer_id": 160,
        "question_id": 41,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 74
    },
    {
        "answer_id": 3241,
        "question_id": 811,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 75
    },
    {
        "answer_id": 164,
        "question_id": 42,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 76
    },
    {
        "answer_id": 3242,
        "question_id": 812,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 77
    },
    {
        "answer_id": 168,
        "question_id": 43,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 78
    },
    {
        "answer_id": 3249,
        "question_id": 813,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 79
    },
    {
        "answer_id": 173,
        "question_id": 44,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 80
    },
    {
        "answer_id": 3253,
        "question_id": 814,
        "is_correct": "AA==",
        "score": 0,
        "user_id": 7647,
        "id": 81
    },
    {
        "answer_id": 692,
        "question_id": 174,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 82
    },
    {
        "answer_id": 1800,
        "question_id": 451,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 83
    },
    {
        "answer_id": 695,
        "question_id": 175,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 84
    },
    {
        "answer_id": 175,
        "question_id": 45,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 85
    },
    {
        "answer_id": 3256,
        "question_id": 815,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 86
    },
    {
        "answer_id": 701,
        "question_id": 176,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 87
    },
    {
        "answer_id": 1803,
        "question_id": 452,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 88
    },
    {
        "answer_id": 180,
        "question_id": 46,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 89
    },
    {
        "answer_id": 3258,
        "question_id": 816,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 90
    },
    {
        "answer_id": 702,
        "question_id": 177,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 91
    },
    {
        "answer_id": 183,
        "question_id": 47,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 92
    },
    {
        "answer_id": 3265,
        "question_id": 817,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7647,
        "id": 93
    },
    {
        "answer_id": 707,
        "question_id": 178,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 94
    },
    {
        "answer_id": 188,
        "question_id": 48,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 95
    },
    {
        "answer_id": 3347,
        "question_id": 838,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7138,
        "id": 96
    },
    {
        "answer_id": 711,
        "question_id": 179,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 97
    },
    {
        "answer_id": 192,
        "question_id": 49,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 3980,
        "id": 98
    },
    {
        "answer_id": 3351,
        "question_id": 839,
        "is_correct": "AA==",
        "score": 0,
        "user_id": 7138,
        "id": 99
    },
    {
        "answer_id": 715,
        "question_id": 180,
        "is_correct": "AQ==",
        "score": 50,
        "user_id": 7141,
        "id": 100
    }
]);
}
