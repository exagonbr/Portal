/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: user_role -> user_roles
 * Gerado em: 2025-06-01T17:25:23.289Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('user_roles').del();

  // Insere dados de exemplo do MySQL
  await knex('user_roles').insert([
    {
        "role_id": 1,
        "user_id": 1
    },
    {
        "role_id": 2,
        "user_id": 1
    },
    {
        "role_id": 3,
        "user_id": 1
    },
    {
        "role_id": 4,
        "user_id": 1
    },
    {
        "role_id": 1,
        "user_id": 2
    },
    {
        "role_id": 2,
        "user_id": 2
    },
    {
        "role_id": 3,
        "user_id": 2
    },
    {
        "role_id": 1,
        "user_id": 3
    },
    {
        "role_id": 2,
        "user_id": 3
    },
    {
        "role_id": 3,
        "user_id": 3
    },
    {
        "role_id": 1,
        "user_id": 3978
    },
    {
        "role_id": 2,
        "user_id": 3978
    },
    {
        "role_id": 3,
        "user_id": 3978
    },
    {
        "role_id": 1,
        "user_id": 3979
    },
    {
        "role_id": 2,
        "user_id": 3979
    },
    {
        "role_id": 3,
        "user_id": 3979
    },
    {
        "role_id": 4,
        "user_id": 3979
    },
    {
        "role_id": 1,
        "user_id": 3980
    },
    {
        "role_id": 2,
        "user_id": 3980
    },
    {
        "role_id": 3,
        "user_id": 3980
    },
    {
        "role_id": 1,
        "user_id": 3981
    },
    {
        "role_id": 2,
        "user_id": 3981
    },
    {
        "role_id": 3,
        "user_id": 3981
    },
    {
        "role_id": 1,
        "user_id": 3982
    },
    {
        "role_id": 2,
        "user_id": 3982
    },
    {
        "role_id": 3,
        "user_id": 3982
    },
    {
        "role_id": 1,
        "user_id": 3984
    },
    {
        "role_id": 2,
        "user_id": 3984
    },
    {
        "role_id": 3,
        "user_id": 3984
    },
    {
        "role_id": 1,
        "user_id": 6237
    },
    {
        "role_id": 2,
        "user_id": 6237
    },
    {
        "role_id": 3,
        "user_id": 6237
    },
    {
        "role_id": 3,
        "user_id": 7094
    },
    {
        "role_id": 5,
        "user_id": 7094
    },
    {
        "role_id": 1,
        "user_id": 7095
    },
    {
        "role_id": 2,
        "user_id": 7095
    },
    {
        "role_id": 3,
        "user_id": 7095
    },
    {
        "role_id": 1,
        "user_id": 7097
    },
    {
        "role_id": 2,
        "user_id": 7097
    },
    {
        "role_id": 3,
        "user_id": 7097
    },
    {
        "role_id": 1,
        "user_id": 7103
    },
    {
        "role_id": 2,
        "user_id": 7103
    },
    {
        "role_id": 3,
        "user_id": 7103
    },
    {
        "role_id": 1,
        "user_id": 7113
    },
    {
        "role_id": 2,
        "user_id": 7113
    },
    {
        "role_id": 3,
        "user_id": 7113
    },
    {
        "role_id": 1,
        "user_id": 7114
    },
    {
        "role_id": 2,
        "user_id": 7114
    },
    {
        "role_id": 3,
        "user_id": 7114
    },
    {
        "role_id": 1,
        "user_id": 7121
    },
    {
        "role_id": 2,
        "user_id": 7121
    },
    {
        "role_id": 3,
        "user_id": 7121
    },
    {
        "role_id": 3,
        "user_id": 7123
    },
    {
        "role_id": 5,
        "user_id": 7123
    },
    {
        "role_id": 3,
        "user_id": 7125
    },
    {
        "role_id": 2,
        "user_id": 7134
    },
    {
        "role_id": 3,
        "user_id": 7134
    },
    {
        "role_id": 4,
        "user_id": 7134
    },
    {
        "role_id": 2,
        "user_id": 7135
    },
    {
        "role_id": 3,
        "user_id": 7135
    },
    {
        "role_id": 4,
        "user_id": 7135
    },
    {
        "role_id": 3,
        "user_id": 7136
    },
    {
        "role_id": 3,
        "user_id": 7137
    },
    {
        "role_id": 3,
        "user_id": 7138
    },
    {
        "role_id": 5,
        "user_id": 7138
    },
    {
        "role_id": 3,
        "user_id": 7139
    },
    {
        "role_id": 3,
        "user_id": 7140
    },
    {
        "role_id": 3,
        "user_id": 7141
    },
    {
        "role_id": 3,
        "user_id": 7142
    },
    {
        "role_id": 3,
        "user_id": 7143
    },
    {
        "role_id": 5,
        "user_id": 7143
    },
    {
        "role_id": 3,
        "user_id": 7144
    },
    {
        "role_id": 5,
        "user_id": 7144
    },
    {
        "role_id": 3,
        "user_id": 7145
    },
    {
        "role_id": 3,
        "user_id": 7146
    },
    {
        "role_id": 3,
        "user_id": 7147
    },
    {
        "role_id": 3,
        "user_id": 7148
    },
    {
        "role_id": 3,
        "user_id": 7149
    },
    {
        "role_id": 3,
        "user_id": 7150
    },
    {
        "role_id": 3,
        "user_id": 7151
    },
    {
        "role_id": 3,
        "user_id": 7152
    },
    {
        "role_id": 3,
        "user_id": 7153
    },
    {
        "role_id": 3,
        "user_id": 7154
    },
    {
        "role_id": 3,
        "user_id": 7155
    },
    {
        "role_id": 3,
        "user_id": 7156
    },
    {
        "role_id": 3,
        "user_id": 7157
    },
    {
        "role_id": 3,
        "user_id": 7158
    },
    {
        "role_id": 3,
        "user_id": 7159
    },
    {
        "role_id": 3,
        "user_id": 7160
    },
    {
        "role_id": 3,
        "user_id": 7161
    },
    {
        "role_id": 3,
        "user_id": 7162
    },
    {
        "role_id": 3,
        "user_id": 7168
    },
    {
        "role_id": 5,
        "user_id": 7168
    },
    {
        "role_id": 3,
        "user_id": 7169
    },
    {
        "role_id": 5,
        "user_id": 7169
    },
    {
        "role_id": 3,
        "user_id": 7170
    },
    {
        "role_id": 5,
        "user_id": 7170
    },
    {
        "role_id": 3,
        "user_id": 7171
    },
    {
        "role_id": 5,
        "user_id": 7171
    },
    {
        "role_id": 3,
        "user_id": 7172
    }
]);
}
