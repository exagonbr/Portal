const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Não vamos deletar usuários existentes pois já existem dados relacionados
  // await knex('user').del();
  
  // Hash das senhas padrão
  const defaultPassword = await bcrypt.hash('password123', 12);
  const adminPassword = await bcrypt.hash('password123', 12);
  
  // Verificar se já existem usuários antes de inserir
  const existingUsers = await knex('user').select('email');
  const existingEmails = existingUsers.map(u => u.email);
  
  const usersToInsert = [
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
  ].filter(user => !existingEmails.includes(user.email));
  
  if (usersToInsert.length > 0) {
    // Ajustar campos para corresponder ao schema real
    const adjustedUsers = usersToInsert.map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      password: user.password,
      username: user.username,
      enabled: user.enabled,
      account_expired: user.account_expired,
      account_locked: user.account_locked,
      password_expired: user.password_expired,
      deleted: user.deleted,
      language: user.language,
      type: user.type,
      institution_id: 1, // Assumindo institution_id 1
      role_id: user.type, // Mapeando type para role_id
      is_admin: user.is_admin,
      is_manager: user.is_manager,
      is_student: user.is_student,
      is_teacher: user.is_teacher,
      is_certified: user.is_certified || false,
      reset_password: user.reset_password,
      invitation_sent: user.invitation_sent,
      subject: user.subject || null,
      date_created: new Date(),
      last_updated: new Date()
    }));
    
    await knex('user').insert(adjustedUsers);
  }
  
  console.log('✅ Usuários padrão criados com sucesso!');
  console.log('📧 Credenciais padrão:');
  console.log('   System Admin: admin@sabercon.edu.br / password123');
  console.log('   Guardian: guardian@sabercon.edu.br / password123');
  console.log('   Teacher: teacher@sabercon.edu.br / password123');
  console.log('   Student: student@sabercon.edu.br / password123');
  console.log('   Coordinator: coordinator@sabercon.edu.br / password123');
  console.log('   Institution Manager: institution.manager@sabercon.edu.br / password123');
};