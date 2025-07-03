/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: notification_queue -> notification_queue
 * Gerado em: 2025-06-01T17:25:19.519Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('notification_queue').del();

  // Insere dados de exemplo do MySQL
  await knex('notification_queue').insert([
    {
        "id": 10,
        "description": "Praticas Educativas",
        "is_completed": "AA==",
        "movie_id": null,
        "tv_show_id": 38,
        "type": "old",
        "video_to_play_id": 167
    },
    {
        "id": 11,
        "description": "Educação Ambiental",
        "is_completed": "AA==",
        "movie_id": null,
        "tv_show_id": 16,
        "type": "old",
        "video_to_play_id": 41
    },
    {
        "id": 12,
        "description": "Temas Contemporâneos",
        "is_completed": "AA==",
        "movie_id": null,
        "tv_show_id": 32,
        "type": "old",
        "video_to_play_id": 138
    },
    {
        "id": 13,
        "description": "Emilia Ferreiro na Escola",
        "is_completed": "AA==",
        "movie_id": null,
        "tv_show_id": 66,
        "type": "old",
        "video_to_play_id": 390
    },
    {
        "id": 14,
        "description": "Neurociência e o Aprendizado",
        "is_completed": "AA==",
        "movie_id": null,
        "tv_show_id": 45,
        "type": "old",
        "video_to_play_id": 214
    },
    {
        "id": 15,
        "description": "Educação 4.0",
        "is_completed": "AA==",
        "movie_id": null,
        "tv_show_id": 28,
        "type": "newRelease",
        "video_to_play_id": 110
    },
    {
        "id": 16,
        "description": "Ensino das Relações Étnico Racial",
        "is_completed": "AA==",
        "movie_id": null,
        "tv_show_id": 62,
        "type": "newRelease",
        "video_to_play_id": 366
    },
    {
        "id": 17,
        "description": "Inovação na Educação",
        "is_completed": "AA==",
        "movie_id": null,
        "tv_show_id": 53,
        "type": "newRelease",
        "video_to_play_id": 282
    },
    {
        "id": 18,
        "description": "INTELIGÊNCIA EMOCIONAL NA RESOLUÇÃO DE CONFLITOS",
        "is_completed": "AA==",
        "movie_id": null,
        "tv_show_id": 71,
        "type": "newRelease",
        "video_to_play_id": 456
    },
    {
        "id": 19,
        "description": "SALA DE AULA INVERTIDA",
        "is_completed": "AA==",
        "movie_id": null,
        "tv_show_id": 33,
        "type": "newRelease",
        "video_to_play_id": 145
    },
    {
        "id": 20,
        "description": "Nova Coleção",
        "is_completed": "AQ==",
        "movie_id": null,
        "tv_show_id": 28,
        "type": null,
        "video_to_play_id": null
    }
]);
}
