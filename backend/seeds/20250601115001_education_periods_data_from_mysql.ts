/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: education_period -> education_periods
 * Gerado em: 2025-06-01T11:50:02.021Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('education_periods').del();

  // Insere dados de exemplo do MySQL
  await knex('education_periods').insert([
    {
        "id": 1,
        "description": "1° Ciclo - 1ª Fase | 1° Ano | Alfabetização",
        "is_active": "AQ=="
    },
    {
        "id": 2,
        "description": "1° Ciclo - 2ª Fase | 2° Ano | 1ª Série",
        "is_active": "AQ=="
    },
    {
        "id": 3,
        "description": "1° Ciclo - 3ª Fase | 3° Ano | 2ª Série",
        "is_active": "AQ=="
    },
    {
        "id": 4,
        "description": "2° Ciclo - 1ª Fase | 4° Ano | 3ª Série",
        "is_active": "AQ=="
    },
    {
        "id": 5,
        "description": "2° Ciclo - 2ª Fase | 5° Ano | 4ª Série",
        "is_active": "AQ=="
    },
    {
        "id": 6,
        "description": "2° Ciclo - 3ª Fase | 6° Ano | 5ª Série",
        "is_active": "AQ=="
    },
    {
        "id": 7,
        "description": "3° Ciclo - 1ª Fase | 7° Ano | 6ª Série",
        "is_active": "AQ=="
    },
    {
        "id": 8,
        "description": "3° Ciclo - 2ª Fase | 8° Ano | 7ª Série",
        "is_active": "AQ=="
    },
    {
        "id": 9,
        "description": "3° Ciclo - 3ª Fase | 9° Ano | 8ª Série",
        "is_active": "AQ=="
    }
]);
}
