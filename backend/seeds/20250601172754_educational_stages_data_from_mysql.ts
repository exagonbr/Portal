/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: educational_stage -> educational_stages
 * Gerado em: 2025-06-01T17:27:54.279Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('educational_stages').del();

  // Insere dados de exemplo do MySQL
  await knex('educational_stages').insert([
    {
        "id": 1,
        "grade_1": "AQ==",
        "grade_2": "AQ==",
        "grade_3": "AA==",
        "grade_4": "AA==",
        "grade_5": "AA==",
        "grade_6": "AA==",
        "grade_7": "AA==",
        "grade_8": "AA==",
        "grade_9": "AA==",
        "name": "Alfabetização"
    },
    {
        "id": 2,
        "grade_1": "AQ==",
        "grade_2": "AQ==",
        "grade_3": "AQ==",
        "grade_4": "AQ==",
        "grade_5": "AQ==",
        "grade_6": "AA==",
        "grade_7": "AA==",
        "grade_8": "AA==",
        "grade_9": "AA==",
        "name": "Ensino Fundamental I"
    },
    {
        "id": 3,
        "grade_1": "AA==",
        "grade_2": "AA==",
        "grade_3": "AA==",
        "grade_4": "AA==",
        "grade_5": "AA==",
        "grade_6": "AQ==",
        "grade_7": "AQ==",
        "grade_8": "AQ==",
        "grade_9": "AQ==",
        "name": "Ensino Fundamental II"
    },
    {
        "id": 4,
        "grade_1": "AQ==",
        "grade_2": "AQ==",
        "grade_3": "AQ==",
        "grade_4": "AA==",
        "grade_5": "AA==",
        "grade_6": "AA==",
        "grade_7": "AA==",
        "grade_8": "AA==",
        "grade_9": "AA==",
        "name": "Ensino Médio"
    },
    {
        "id": 5,
        "grade_1": "AA==",
        "grade_2": "AA==",
        "grade_3": "AA==",
        "grade_4": "AA==",
        "grade_5": "AA==",
        "grade_6": "AA==",
        "grade_7": "AA==",
        "grade_8": "AA==",
        "grade_9": "AA==",
        "name": "Ensino Superior"
    }
]);
}
