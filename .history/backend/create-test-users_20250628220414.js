const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { db } = require('./src/database/connection');

async function createTestUsers() {
  console.log('👥 Criando usuários de teste com novos roles...\n');

  const saltRounds = 12;
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const testUsers = [
    {
      id: uuidv4(),
      email: 'admin@sabercon.edu.br',
      password: hashedPassword,
      full_name: 'Administrador do Sistema',
      is_admin: true,
      is_institution_manager: false,
      is_coordinator: false,
      is_guardian: false,
      is_teacher: false,
      is_student: false,
      enabled: true,
      date_created: new Date().toISOString(),
      last_updated: new Date().toISOString()
    },
    {
      id: uuidv4(),
      email: 'manager@sabercon.edu.br',
      password: hashedPassword,
      full_name: 'Gerente de Instituição',
      is_admin: false,
      is_institution_manager: true,
      is_coordinator: false,
      is_guardian: false,
      is_teacher: false,
      is_student: false,
      enabled: true,
      date_created: new Date().toISOString(),
      last_updated: new Date().toISOString()
    },
    {
      id: uuidv4(),
      email: 'coordinator@sabercon.edu.br',
      password: hashedPassword,
      full_name: 'Coordenador Acadêmico',
      is_admin: false,
      is_institution_manager: false,
      is_coordinator: true,
      is_guardian: false,
      is_teacher: false,
      is_student: false,
      enabled: true,
      date_created: new Date().toISOString(),
      last_updated: new Date().toISOString()
    },
    {
      id: uuidv4(),
      email: 'guardian@sabercon.edu.br',
      password: hashedPassword,
      full_name: 'Responsável Teste',
      is_admin: false,
      is_institution_manager: false,
      is_coordinator: false,
      is_guardian: true,
      is_teacher: false,
      is_student: false,
      enabled: true,
      date_created: new Date().toISOString(),
      last_updated: new Date().toISOString()
    },
    {
      id: uuidv4(),
      email: 'teacher@sabercon.edu.br',
      password: hashedPassword,
      full_name: 'Professor Teste',
      is_admin: false,
      is_institution_manager: false,
      is_coordinator: false,
      is_guardian: false,
      is_teacher: true,
      is_student: false,
      enabled: true,
      date_created: new Date().toISOString(),
      last_updated: new Date().toISOString()
    },
    {
      id: uuidv4(),
      email: 'student@sabercon.edu.br',
      password: hashedPassword,
      full_name: 'Estudante Teste',
      is_admin: false,
      is_institution_manager: false,
      is_coordinator: false,
      is_guardian: false,
      is_teacher: false,
      is_student: true,
      enabled: true,
      date_created: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }
  ];

  try {
    for (const user of testUsers) {
      // Verificar se o usuário já existe
      const existingUser = await db('users')
        .where('email', user.email)
        .first();

      if (existingUser) {
        console.log(`🔄 Atualizando usuário existente: ${user.email}`);
        await db('users')
          .where('email', user.email)
          .update({
            password: user.password,
            full_name: user.full_name,
            is_admin: user.is_admin,
            is_institution_manager: user.is_institution_manager,
            is_coordinator: user.is_coordinator,
            is_guardian: user.is_guardian,
            is_teacher: user.is_teacher,
            is_student: user.is_student,
            enabled: user.enabled,
            last_updated: user.last_updated
          });
      } else {
        console.log(`➕ Criando novo usuário: ${user.email}`);
        await db('users').insert(user);
      }

      // Determinar role para exibição
      let role = 'STUDENT';
      if (user.is_admin) role = 'SYSTEM_ADMIN';
      else if (user.is_institution_manager) role = 'INSTITUTION_MANAGER';
      else if (user.is_coordinator) role = 'COORDINATOR';
      else if (user.is_guardian) role = 'GUARDIAN';
      else if (user.is_teacher) role = 'TEACHER';

      console.log(`✅ ${user.email} - ${role} - ${user.full_name}`);
    }

    console.log('\n🎯 USUÁRIOS DE TESTE CRIADOS COM SUCESSO!');
    console.log('\n📋 Credenciais para teste:');
    console.log('Email: admin@sabercon.edu.br | Senha: password123 | Role: SYSTEM_ADMIN');
    console.log('Email: manager@sabercon.edu.br | Senha: password123 | Role: INSTITUTION_MANAGER');
    console.log('Email: coordinator@sabercon.edu.br | Senha: password123 | Role: COORDINATOR');
    console.log('Email: guardian@sabercon.edu.br | Senha: password123 | Role: GUARDIAN');
    console.log('Email: teacher@sabercon.edu.br | Senha: password123 | Role: TEACHER');
    console.log('Email: student@sabercon.edu.br | Senha: password123 | Role: STUDENT');

    console.log('\n🚀 Agora você pode testar o login com qualquer um desses usuários!');

  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
  } finally {
    await db.destroy();
  }
}

createTestUsers();