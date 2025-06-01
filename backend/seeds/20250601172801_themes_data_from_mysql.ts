/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: theme -> themes
 * Gerado em: 2025-06-01T17:28:01.621Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('themes').del();

  // Insere dados de exemplo do MySQL
  await knex('themes').insert([
    {
        "id": 1,
        "description": "Sabercon",
        "is_active": "AQ==",
        "name": "Sabercon"
    },
    {
        "id": 2,
        "description": "a",
        "is_active": "AA==",
        "name": "A INTELIGêNCIA EMOCIONAL E O SEU PAPEL SIGNIFICATIVO NO NOVO ENSINO MéDIO"
    },
    {
        "id": 3,
        "description": "v",
        "is_active": "AA==",
        "name": "CONSTRUÇãO DE IDENTIDADES"
    },
    {
        "id": 4,
        "description": "c",
        "is_active": "AA==",
        "name": "CONSTRUçãO DO INDIVIDUO"
    },
    {
        "id": 5,
        "description": "c",
        "is_active": "AA==",
        "name": "CONTEMPORANEOS"
    },
    {
        "id": 6,
        "description": "DCF",
        "is_active": "AA==",
        "name": "DIFERENÇAS"
    },
    {
        "id": 7,
        "description": "M",
        "is_active": "AQ==",
        "name": "A INTELIGÊNCIA EMOCIONAL E O SEU PAPEL SIGNIFICATIVO NO NOVO ENSINO MÉDIO"
    },
    {
        "id": 8,
        "description": "E",
        "is_active": "AQ==",
        "name": "CONSTRUÇãO DE IDENTIDADES"
    },
    {
        "id": 9,
        "description": "U",
        "is_active": "AQ==",
        "name": "CONSTRUÇãO DO INDIVIDUO"
    },
    {
        "id": 10,
        "description": "/",
        "is_active": "AQ==",
        "name": "CONTEMPORANEOS"
    },
    {
        "id": 11,
        "description": "P",
        "is_active": "AQ==",
        "name": "DIFERENÇAS"
    },
    {
        "id": 12,
        "description": "A",
        "is_active": "AQ==",
        "name": "EDUCAÇÃO FÍSICA"
    },
    {
        "id": 13,
        "description": "U",
        "is_active": "AQ==",
        "name": "LÍNGUAS E CIÊNCIAS"
    },
    {
        "id": 14,
        "description": "M",
        "is_active": "AQ==",
        "name": "MATEMÁTICA"
    },
    {
        "id": 15,
        "description": "P",
        "is_active": "AQ==",
        "name": "PLURALIDADE SOCIAL"
    },
    {
        "id": 16,
        "description": "P",
        "is_active": "AQ==",
        "name": "PRATICAS EDUCATIVA"
    },
    {
        "id": 17,
        "description": "A",
        "is_active": "AQ==",
        "name": "SEXUALIDADE"
    }
]);
}
