/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deleta TODOS os registros existentes para garantir um estado limpo.
  await knex('roles').del();

  // Insere os papéis fundamentais do sistema.
  await knex('roles').insert([
    { id: 1, name: 'SYSTEM_ADMIN', description: 'Administrador do Sistema', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 2, name: 'INSTITUTION_MANAGER', description: 'Gerente da Instituição', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 3, name: 'COORDINATOR', description: 'Coordenador Acadêmico', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 4, name: 'TEACHER', description: 'Professor', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 5, name: 'STUDENT', description: 'Estudante', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 6, name: 'GUARDIAN', description: 'Responsável pelo Estudante', is_active: true, created_at: new Date(), updated_at: new Date() }
  ]);
};