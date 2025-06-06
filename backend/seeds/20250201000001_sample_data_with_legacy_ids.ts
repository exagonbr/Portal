import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data (in reverse order of dependencies)
  await knex('audit_logs').del();
  await knex('student_progress').del();
  await knex('user_profiles').del();
  await knex('user_settings').del();
  await knex('notifications').del();
  await knex('quiz_answers').del();
  await knex('reports').del();
  await knex('files').del();
  await knex('collections').del();
  await knex('users').del();
  await knex('roles').del();
  await knex('schools').del();
  await knex('institutions').del();

  // Insert institutions
  const [institutionId] = await knex('institutions').insert([
    {
      name: 'Universidade Federal de Exemplo',
      code: 'UFE',
      description: 'Universidade pública federal',
      address: 'Rua das Universidades, 123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      phone: '(11) 1234-5678',
      email: 'contato@ufe.edu.br',
      website: 'https://www.ufe.edu.br',
      status: 'active'
    }
  ]).returning('id');

  // Insert schools
  const [schoolId] = await knex('schools').insert([
    {
      name: 'Escola de Engenharia',
      code: 'ENG',
      description: 'Escola de Engenharia da UFE',
      address: 'Rua da Engenharia, 456',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      phone: '(11) 1234-5679',
      email: 'engenharia@ufe.edu.br',
      institution_id: institutionId,
      status: 'active'
    }
  ]).returning('id');

  // Insert roles
  const [teacherRoleId] = await knex('roles').insert([
    {
      name: 'TEACHER',
      description: 'Professor',
      type: 'system',
      status: 'active'
    }
  ]).returning('id');

  const [studentRoleId] = await knex('roles').insert([
    {
      name: 'STUDENT',
      description: 'Estudante',
      type: 'system',
      status: 'active'
    }
  ]).returning('id');

  // Insert users with legacy IDs
  const [teacherId] = await knex('users').insert([
    {
      email: 'professor@ufe.edu.br',
      password: '$2b$10$hashedpassword123',
      name: 'Prof. João Silva',
      cpf: '123.456.789-01',
      phone: '(11) 98765-4321',
      birth_date: new Date('1980-05-15'),
      address: 'Rua dos Professores, 789',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      is_active: true,
      role_id: teacherRoleId,
      school_id: schoolId,
      institution_id: institutionId,
      user_id_legacy: 1001 // Legacy MySQL ID
    }
  ]).returning('id');

  const [studentId] = await knex('users').insert([
    {
      email: 'estudante@ufe.edu.br',
      password: '$2b$10$hashedpassword456',
      name: 'Maria Santos',
      cpf: '987.654.321-09',
      phone: '(11) 91234-5678',
      birth_date: new Date('2000-08-20'),
      address: 'Rua dos Estudantes, 321',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      is_active: true,
      role_id: studentRoleId,
      school_id: schoolId,
      institution_id: institutionId,
      user_id_legacy: 2001 // Legacy MySQL ID
    }
  ]).returning('id');

  // Insert collections with legacy IDs
  const [collectionId] = await knex('collections').insert([
    {
      name: 'Curso de Programação Básica',
      description: 'Introdução aos conceitos de programação',
      type: 'videos',
      created_by: teacherId,
      created_by_legacy: 1001, // Legacy MySQL user ID
      institution_id: institutionId,
      is_public: true,
      items_count: 5,
      tags: ['programação', 'básico', 'iniciante']
    }
  ]).returning('id');

  // Insert files with legacy IDs
  const [fileId] = await knex('files').insert([
    {
      name: 'video_aula_01.mp4',
      original_name: 'Aula 01 - Introdução.mp4',
      type: 'video',
      size: 104857600, // 100MB
      size_formatted: '100MB',
      bucket: 'education-videos',
      s3_key: 'videos/aula01_intro.mp4',
      s3_url: 'https://storage.example.com/videos/aula01_intro.mp4',
      description: 'Vídeo de introdução ao curso',
      category: 'professor',
      uploaded_by: teacherId,
      uploaded_by_legacy: 1001, // Legacy MySQL user ID
      is_active: true
    }
  ]).returning('id');

  // Insert notifications with legacy IDs
  await knex('notifications').insert([
    {
      title: 'Bem-vindo ao curso!',
      message: 'Seja bem-vindo ao curso de Programação Básica',
      type: 'info',
      user_id: studentId,
      user_id_legacy: 2001, // Legacy MySQL user ID
      is_read: false
    },
    {
      title: 'Nova aula disponível',
      message: 'A aula "Introdução à Programação" está disponível',
      type: 'announcement',
      user_id: studentId,
      user_id_legacy: 2001, // Legacy MySQL user ID
      is_read: true
    }
  ]);

  // Insert user settings with legacy IDs
  await knex('user_settings').insert([
    {
      user_id: teacherId,
      user_id_legacy: 1001, // Legacy MySQL user ID
      preferences: {
        theme: 'light',
        language: 'pt-BR',
        notifications: {
          email: true,
          push: false
        }
      }
    },
    {
      user_id: studentId,
      user_id_legacy: 2001, // Legacy MySQL user ID
      preferences: {
        theme: 'dark',
        language: 'pt-BR',
        notifications: {
          email: true,
          push: true
        }
      }
    }
  ]);

  // Insert user profiles with legacy IDs
  await knex('user_profiles').insert([
    {
      user_id: teacherId,
      user_id_legacy: 1001, // Legacy MySQL user ID
      bio: 'Professor de Ciência da Computação com 15 anos de experiência',
      avatar_url: 'https://storage.example.com/avatars/professor.jpg',
      social_links: {
        linkedin: 'https://linkedin.com/in/joaosilva',
        twitter: '@profjoao'
      }
    },
    {
      user_id: studentId,
      user_id_legacy: 2001, // Legacy MySQL user ID
      bio: 'Estudante de Engenharia de Software',
      avatar_url: 'https://storage.example.com/avatars/maria.jpg',
      social_links: {
        github: 'https://github.com/mariasantos',
        instagram: '@maria_dev'
      }
    }
  ]);

  // Insert student progress with legacy IDs
  await knex('student_progress').insert([
    {
      student_id: studentId,
      student_id_legacy: 2001, // Legacy MySQL user ID
      content_id: 1, // Assuming content ID 1 exists
      status: 'in_progress',
      completion_percentage: 75,
      time_spent_minutes: 45,
      started_at: new Date('2025-01-15T10:00:00Z'),
      completed_at: null
    }
  ]);

  // Insert audit logs with legacy IDs
  await knex('audit_logs').insert([
    {
      user_id: teacherId,
      user_id_legacy: 1001, // Legacy MySQL user ID
      action: 'CREATE_COLLECTION',
      entity_type: 'collection',
      entity_id: collectionId
    },
    {
      user_id: studentId,
      user_id_legacy: 2001, // Legacy MySQL user ID
      action: 'START_CONTENT',
      entity_type: 'content',
      entity_id: 1
    }
  ]);

  // Insert reports with legacy IDs (if reports table exists)
  const hasReportsTable = await knex.schema.hasTable('reports');
  if (hasReportsTable) {
    await knex('reports').insert([
      {
        title: 'Relatório de Progresso - Janeiro 2025',
        description: 'Relatório mensal de progresso dos estudantes',
        type: 'progress',
        data: {
          total_students: 1,
          completed_courses: 0,
          in_progress_courses: 1,
          average_completion: 75
        },
        generated_by: teacherId,
        generated_by_legacy: 1001 // Legacy MySQL user ID
      }
    ]);
  }

  console.log('✅ Sample data with legacy IDs seeded successfully');
}
