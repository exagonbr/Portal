/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: teacher_subject -> teacher_subjects
 * Gerado em: 2025-06-01T11:50:09.566Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('teacher_subjects').del();

  // Insere dados de exemplo do MySQL
  await knex('teacher_subjects').insert([
    {
        "id": 1,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Polivalente"
    },
    {
        "id": 2,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Infantil"
    },
    {
        "id": 3,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Educação Física"
    },
    {
        "id": 4,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Arte"
    },
    {
        "id": 5,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Matemática"
    },
    {
        "id": 6,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Ciências Naturais"
    },
    {
        "id": 7,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "História"
    },
    {
        "id": 8,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "AEE"
    },
    {
        "id": 9,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Língua Portuguesa"
    },
    {
        "id": 10,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "L.E.Inglês"
    },
    {
        "id": 11,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Língua Inglesa"
    },
    {
        "id": 12,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Geografia"
    },
    {
        "id": 13,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Música"
    },
    {
        "id": 14,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Orientação de Estudos"
    },
    {
        "id": 15,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Movimento"
    },
    {
        "id": 16,
        "is_child": "AA==",
        "is_deleted": "AA==",
        "name": "Ética e Cidadania"
    }
]);
}
