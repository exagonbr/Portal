const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('users').del();
  
  // Hash das senhas padrão
  const defaultPassword = await bcrypt.hash('password123', 12);
  const adminPassword = await bcrypt.hash('password123', 12);
  
  // Inserir usuários padrão
  await knex('users').insert([
    {
      id: 1,
      email: 'admin@sabercon.edu.br',
      full_name: 'Administrador do Sistema',
      password: adminPassword,
      username: 'system_admin',
      is_admin: true,
      is_manager: true,
      is_student: false,
      is_teacher: false,
      is_guardian: false,
      is_coordinator: false,
      is_institution_manager: false,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: false,
      deleted: false,
      invitation_sent: false,
      is_certified: false,
      is_institution_manage: false,
      language: 'pt-BR',
      type: 1, // Tipo 1 para System Admin
      uuid: 'system-admin-uuid-001',
      date_created: knex.fn.now(),
      last_updated: knex.fn.now()
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
      is_guardian: true,
      is_coordinator: false,
      is_institution_manager: false,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: true,
      deleted: false,
      invitation_sent: false,
      is_certified: false,
      is_institution_manage: false,
      language: 'pt-BR',
      type: 2, // Tipo 2 para Guardian
      uuid: 'guardian-uuid-001',
      date_created: knex.fn.now(),
      last_updated: knex.fn.now()
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
      is_guardian: false,
      is_coordinator: false,
      is_institution_manager: false,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: true,
      deleted: false,
      invitation_sent: false,
      is_certified: true,
      is_institution_manage: false,
      language: 'pt-BR',
      type: 3, // Tipo 3 para Teacher
      uuid: 'teacher-uuid-001',
      subject: 'Matemática',
      date_created: knex.fn.now(),
      last_updated: knex.fn.now()
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
      is_guardian: false,
      is_coordinator: false,
      is_institution_manager: false,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: true,
      deleted: false,
      invitation_sent: false,
      is_certified: false,
      is_institution_manage: false,
      language: 'pt-BR',
      type: 4, // Tipo 4 para Student
      uuid: 'student-uuid-001',
      date_created: knex.fn.now(),
      last_updated: knex.fn.now()
    },
    {
      id: 5,
      email: 'coordinator@sabercon.edu.br',
      full_name: 'Coordenador Padrão',
      password: defaultPassword,
      username: 'coordinator_default',
      is_admin: false,
      is_manager: false,
      is_student: false,
      is_teacher: false,
      is_guardian: false,
      is_coordinator: true,
      is_institution_manager: false,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: true,
      deleted: false,
      invitation_sent: false,
      is_certified: true,
      is_institution_manage: false,
      language: 'pt-BR',
      type: 5, // Tipo 5 para Coordinator
      uuid: 'coordinator-uuid-001',
      date_created: knex.fn.now(),
      last_updated: knex.fn.now()
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
      is_guardian: false,
      is_coordinator: false,
      is_institution_manager: true,
      enabled: true,
      account_expired: false,
      account_locked: false,
      password_expired: false,
      reset_password: true,
      deleted: false,
      invitation_sent: false,
      is_certified: false,
      is_institution_manage: true,
      language: 'pt-BR',
      type: 6, // Tipo 6 para Institution Manager
      uuid: 'institution-manager-uuid-001',
      date_created: knex.fn.now(),
      last_updated: knex.fn.now()
    }
  ]);
  
  console.log('✅ Usuários padrão criados com sucesso!');
  console.log('📧 Credenciais padrão:');
  console.log('   System Admin: admin@sabercon.edu.br / password123');
  console.log('   Guardian: guardian@sabercon.edu.br / password123');
  console.log('   Teacher: teacher@sabercon.edu.br / password123');
  console.log('   Student: student@sabercon.edu.br / password123');
  console.log('   Coordinator: coordinator@sabercon.edu.br / password123');
  console.log('   Institution Manager: manager@sabercon.edu.br / password123');
};