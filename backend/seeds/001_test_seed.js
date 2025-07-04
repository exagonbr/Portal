exports.seed = async function(knex) {
  // Limpar todas as tabelas na ordem correta
  await knex('user_classes').del();
  await knex('classes').del();
  await knex('education_cycles').del();
  await knex('unit').del();
  await knex('user').del();
  await knex('role_permissions').del();
  await knex('permissions').del();
  await knex('roles').del();
  await knex('institution').del();

  console.log('✅ Tabelas limpas com sucesso');

  // 1. Inserir instituições
  const [institution1, institution2] = await knex('institution').insert([
    {
      name: 'Sabercon Educação',
      company_name: 'Sabercon Soluções Educacionais LTDA',
      document: '12.345.678/0001-99',
      accountable_name: 'Sr. Administrador',
      accountable_contact: 'admin@sabercon.edu.br',
      postal_code: '01000-000',
      street: 'Rua do Saber',
      district: 'Centro',
      state: 'SP',
      contract_disabled: false,
      deleted: false,
      contract_term_start: new Date('2024-01-01'),
      contract_term_end: new Date('2029-12-31'),
      has_library_platform: true,
      has_principal_platform: true,
      has_student_platform: true,
      date_created: new Date(),
      last_updated: new Date()
    },
    {
      name: 'Instituto Federal de São Paulo',
      company_name: 'Instituto Federal de Educação, Ciência e Tecnologia de São Paulo',
      document: '98.765.432/0001-11',
      accountable_name: 'Diretoria IFSP',
      accountable_contact: 'diretoria@ifsp.edu.br',
      postal_code: '01109-010',
      street: 'Rua Pedro Vicente',
      district: 'Canindé',
      state: 'SP',
      contract_disabled: false,
      deleted: false,
      contract_term_start: new Date('2023-01-01'),
      contract_term_end: new Date('2028-12-31'),
      has_library_platform: true,
      has_principal_platform: false,
      has_student_platform: true,
      date_created: new Date(),
      last_updated: new Date()
    }
  ]).returning('*');

  console.log(`✅ ${2} instituições inseridas`);

  // 2. Inserir roles
  const [adminRole, managerRole, coordinatorRole, teacherRole, studentRole] = await knex('roles').insert([
    {
      name: 'SYSTEM_ADMIN',
      description: 'Administrador do Sistema - Acesso completo a toda a plataforma',
      is_active: true
    },
    {
      name: 'INSTITUTION_MANAGER',
      description: 'Gestor Institucional - Gerencia operações de uma escola ou unidade educacional',
      is_active: true
    },
    {
      name: 'ACADEMIC_COORDINATOR',
      description: 'Coordenador Acadêmico - Supervisiona ciclos educacionais e departamentos',
      is_active: true
    },
    {
      name: 'TEACHER',
      description: 'Professor - Acessa turmas para gerenciar aulas, notas e comunicação',
      is_active: true
    },
    {
      name: 'STUDENT',
      description: 'Aluno - Acesso ao ambiente de aprendizagem personalizado',
      is_active: true
    }
  ]).returning('*');

  console.log(`✅ ${5} roles inseridas`);

  // 3. Inserir usuários
  const users = await knex('user').insert([
    {
      email: 'admin@sabercon.edu.br',
      password: '$2a$12$CAEPB0QB3PdSAtrX1MewruU1rjW9fTdFgjmxGXllsturmPJkbNPFO', // password123
      full_name: 'Administrador do Sistema Sabercon',
      institution_id: institution1.id,
      role_id: adminRole.id,
      enabled: true,
      is_admin: true,
      is_manager: false,
      is_student: false,
      is_teacher: false,
      date_created: new Date(),
      last_updated: new Date()
    },
    {
      email: 'gestor@sabercon.edu.br',
      password: '$2a$12$CAEPB0QB3PdSAtrX1MewruU1rjW9fTdFgjmxGXllsturmPJkbNPFO',
      full_name: 'Marina Silva Santos - Gestora Institucional',
      institution_id: institution1.id,
      role_id: managerRole.id,
      enabled: true,
      is_admin: false,
      is_manager: true,
      is_student: false,
      is_teacher: false,
      date_created: new Date(),
      last_updated: new Date()
    },
    {
      email: 'coordenador@sabercon.edu.com',
      password: '$2a$12$CAEPB0QB3PdSAtrX1MewruU1rjW9fTdFgjmxGXllsturmPJkbNPFO',
      full_name: 'Luciana Lima Costa - Coordenadora Acadêmica',
      institution_id: institution1.id,
      role_id: coordinatorRole.id,
      enabled: true,
      is_admin: false,
      is_manager: true,
      is_student: false,
      is_teacher: false,
      date_created: new Date(),
      last_updated: new Date()
    },
    {
      email: 'professor@sabercon.edu.br',
      password: '$2a$12$CAEPB0QB3PdSAtrX1MewruU1rjW9fTdFgjmxGXllsturmPJkbNPFO',
      full_name: 'Ricardo Santos Oliveira - Professor',
      institution_id: institution1.id,
      role_id: teacherRole.id,
      enabled: true,
      is_admin: false,
      is_manager: false,
      is_student: false,
      is_teacher: true,
      date_created: new Date(),
      last_updated: new Date()
    },
    {
      email: 'julia.c@ifsp.com',
      password: '$2a$12$CAEPB0QB3PdSAtrX1MewruU1rjW9fTdFgjmxGXllsturmPJkbNPFO',
      full_name: 'Julia Costa Ferreira - Estudante IFSP',
      institution_id: institution2.id,
      role_id: studentRole.id,
      enabled: true,
      is_admin: false,
      is_manager: false,
      is_student: true,
      is_teacher: false,
      date_created: new Date(),
      last_updated: new Date()
    }
  ]).returning('*');

  console.log(`✅ ${users.length} usuários inseridos`);

  // 4. Inserir unidades
  const [unit1, unit2] = await knex('unit').insert([
    {
      name: 'Unidade Central Sabercon',
      institution_id: institution1.id,
      date_created: new Date(),
      last_updated: new Date(),
      deleted: false
    },
    {
      name: 'Campus São Paulo - IFSP',
      institution_id: institution2.id,
      date_created: new Date(),
      last_updated: new Date(),
      deleted: false
    }
  ]).returning('*');

  console.log(`✅ ${2} unidades inseridas`);

  // 5. Inserir ciclos educacionais
  const [cycle1, cycle2, cycle3, cycle4] = await knex('education_cycles').insert([
    {
      name: 'Ensino Fundamental I',
      code: 'EF1',
      description: 'Do 1º ao 5º ano',
      min_age: 6,
      max_age: 10,
      duration_years: 5,
      institution_id: institution1.id
    },
    {
      name: 'Ensino Fundamental II',
      code: 'EF2',
      description: 'Do 6º ao 9º ano',
      min_age: 11,
      max_age: 14,
      duration_years: 4,
      institution_id: institution1.id
    },
    {
      name: 'Ensino Médio',
      code: 'EM',
      description: 'Do 1º ao 3º ano do Ensino Médio',
      min_age: 15,
      max_age: 17,
      duration_years: 3,
      institution_id: institution1.id
    },
    {
      name: 'Técnico em Informática',
      code: 'TI',
      description: 'Curso técnico em informática',
      min_age: 16,
      max_age: 50,
      duration_years: 2,
      institution_id: institution2.id
    }
  ]).returning('*');

  console.log(`✅ ${4} ciclos educacionais inseridos`);

  // 6. Inserir turmas
  const classes = await knex('classes').insert([
    {
      name: '5º Ano A',
      code: '5A2024',
      description: 'Turma do 5º ano do ensino fundamental',
      year: 2024,
      semester: 1,
      max_students: 30,
      current_students: 1,
      unit_id: unit1.id,
      education_cycle_id: cycle1.id
    },
    {
      name: '8º Ano B',
      code: '8B2024',
      description: 'Turma do 8º ano do ensino fundamental',
      year: 2024,
      semester: 1,
      max_students: 32,
      current_students: 0,
      unit_id: unit1.id,
      education_cycle_id: cycle2.id
    },
    {
      name: 'TI 1º Período',
      code: 'TI1-2024',
      description: 'Primeira turma do curso técnico em informática',
      year: 2024,
      semester: 1,
      max_students: 25,
      current_students: 0,
      unit_id: unit2.id,
      education_cycle_id: cycle4.id
    }
  ]).returning('*');

  console.log(`✅ ${classes.length} turmas inseridas`);

  // 7. Associar usuário estudante à turma
  await knex('user_classes').insert([
    {
      user_id: users.find(u => u.email === 'julia.c@ifsp.com').id,
      class_id: classes[2].id,
      enrollment_date: new Date()
    }
  ]);

  console.log('✅ Associações usuário-turma inseridas');

  console.log('\n🎉 SEED CONCLUÍDO COM SUCESSO!');
  console.log('==========================================');
  console.log('Sistema pronto para uso!');
};