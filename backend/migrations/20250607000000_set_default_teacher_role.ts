import type { Knex } from "knex";

/**
 * Esta migração configura o valor padrão para o campo role_id na tabela users
 * para apontar para o ID específico da função TEACHER (Professor).
 * 
 * Isso garante que todos os novos usuários sejam automaticamente criados como professores,
 * a menos que explicitamente especificado de outra forma.
 */
export async function up(knex: Knex): Promise<void> {
  // Atualiza todos os usuários que não têm role_id definido
  // para o ID da role TEACHER especificado
  await knex('users')
    .whereNull('role_id')
    .update({
      role_id: '35f57500-9a89-4318-bc9f-9acad28c2fb6' // ID fixo do papel TEACHER
    });

  // Modifica a estrutura da tabela para tornar role_id não nulo
  // e definir um valor padrão para novos registros
  await knex.schema.alterTable('users', (table) => {
    table.uuid('role_id')
      .notNullable()
      .defaultTo('35f57500-9a89-4318-bc9f-9acad28c2fb6')
      .alter();
  });

  // Atualiza a contagem de usuários na tabela de roles
  const teacherCount = await knex('users')
    .where('role_id', '35f57500-9a89-4318-bc9f-9acad28c2fb6')
    .count('* as count')
    .first();

  await knex('roles')
    .where('id', '35f57500-9a89-4318-bc9f-9acad28c2fb6')
    .update({
      user_count: parseInt(teacherCount?.count as string) || 0
    });
}

export async function down(knex: Knex): Promise<void> {
  // Reverte as alterações na tabela users
  await knex.schema.alterTable('users', (table) => {
    table.uuid('role_id')
      .nullable()
      .alter();
  });

  // Remove o valor padrão - não podemos realmente desfazer a atualização dos usuários
  // pois não sabemos quais tinham role_id nulo anteriormente
} 