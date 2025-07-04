const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deleta TODOS os registros existentes para garantir um estado limpo.
  await knex('user').del();
  
  // Hash da senha padrão
  const defaultPassword = await bcrypt.hash('password123', 12);
  
  const usersToInsert = [
    {
      id: 1,
      email: 'admin@sabercon.edu.br',
      full_name: 'Administrador do Sistema',
      password: defaultPassword,
      username: 'system_admin',
      is_admin: true,
      is_manager: false,
      is_student: false,
      is_teacher: false,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      deleted: false,
      role_id: 1,
      institution_id: 1
    },
    {
      id: 2,
      email: 'guardian@sabercon.edu.br',
      full_name: 'Responsável Padrão',
      password: defaultPassword,
      username: 'guardian_default',
      is_admin: false,
      is_manager: false,
      is_student: false,
      is_teacher: false,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      deleted: false,
      role_id: 5,
      institution_id: 1
    },
    {
      id: 3,
      email: 'teacher@sabercon.edu.br',
      full_name: 'Professor Padrão',
      password: defaultPassword,
      username: 'teacher_default',
      is_admin: false,
      is_manager: false,
      is_student: false,
      is_teacher: true,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      deleted: false,
      role_id: 3,
      institution_id: 1
    },
    {
      id: 4,
      email: 'student@sabercon.edu.br',
      full_name: 'Estudante Padrão',
      password: defaultPassword,
      username: 'student_default',
      is_admin: false,
      is_manager: false,
      is_student: true,
      is_teacher: false,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      deleted: false,
      role_id: 4,
      institution_id: 1
    },
    {
      id: 5,
      email: 'coordinator@sabercon.edu.br',
      full_name: 'Coordenador Padrão',
      password: defaultPassword,
      username: 'coordinator_default',
      is_admin: false,
      is_manager: true,
      is_student: false,
      is_teacher: false,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      deleted: false,
      role_id: 2,
      institution_id: 1
    },
    {
      id: 6,
      email: 'institution.manager@sabercon.edu.br',
      full_name: 'Gerente de Instituição',
      password: defaultPassword,
      username: 'institution_manager',
      is_admin: false,
      is_manager: true,
      is_student: false,
      is_teacher: false,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      deleted: false,
      role_id: 6,
      institution_id: 1
    }
  ];
  
  await knex('user').insert(usersToInsert);
  
  console.log('✅ Usuários padrão criados com sucesso!');
};