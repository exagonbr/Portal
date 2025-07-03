/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: role -> roles
 * Gerado em: 2025-06-01T17:25:20.847Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('roles').del();

  // Insere dados de exemplo do MySQL
  await knex('roles').insert([
    {
        "id": 1,
        "authority": "ROLE_ADMIN",
        "display_name": "Admin"
    },
    {
        "id": 2,
        "authority": "ROLE_CONTENT_MANAGER",
        "display_name": "Content Manager"
    },
    {
        "id": 3,
        "authority": "ROLE_TRUSTED_USER",
        "display_name": "Trusted User"
    },
    {
        "id": 4,
        "authority": "ROLE_REPORT_MANAGER",
        "display_name": "Report Manager"
    },
    {
        "id": 5,
        "authority": "ROLE_IS_TEACHER",
        "display_name": "Trusted Teacher"
    },
    {
        "id": 6,
        "authority": "ROLE_IS_STUDENT",
        "display_name": "Trusted Student"
    }
]);
}
