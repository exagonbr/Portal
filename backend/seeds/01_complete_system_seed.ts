import type { Knex } from 'knex';

/**
 * 🌱 SEED: Dados completos para migração MySQL → PostgreSQL
 * 
 * Este seed adiciona dados essenciais para o funcionamento completo do sistema
 */

export async function seed(knex: Knex): Promise<void> {
  console.log('🌱 Iniciando seed completo...');
  
  // 🔐 PERMISSIONS
  console.log('🔐 Inserindo permissões...');
  
  const permissions = [
    // Usuários
    { name: 'Visualizar Usuários', code: 'user.read', resource: 'user', action: 'read' },
    { name: 'Criar Usuários', code: 'user.create', resource: 'user', action: 'create' },
    { name: 'Editar Usuários', code: 'user.update', resource: 'user', action: 'update' },
    { name: 'Deletar Usuários', code: 'user.delete', resource: 'user', action: 'delete' },
    
    // Instituições
    { name: 'Visualizar Instituições', code: 'institution.read', resource: 'institution', action: 'read' },
    { name: 'Criar Instituições', code: 'institution.create', resource: 'institution', action: 'create' },
    { name: 'Editar Instituições', code: 'institution.update', resource: 'institution', action: 'update' },
    { name: 'Deletar Instituições', code: 'institution.delete', resource: 'institution', action: 'delete' },
    
    // Escolas
    { name: 'Visualizar Escolas', code: 'school.read', resource: 'school', action: 'read' },
    { name: 'Criar Escolas', code: 'school.create', resource: 'school', action: 'create' },
    { name: 'Editar Escolas', code: 'school.update', resource: 'school', action: 'update' },
    { name: 'Deletar Escolas', code: 'school.delete', resource: 'school', action: 'delete' },
    
    // Cursos
    { name: 'Visualizar Cursos', code: 'course.read', resource: 'course', action: 'read' },
    { name: 'Criar Cursos', code: 'course.create', resource: 'course', action: 'create' },
    { name: 'Editar Cursos', code: 'course.update', resource: 'course', action: 'update' },
    { name: 'Deletar Cursos', code: 'course.delete', resource: 'course', action: 'delete' },
    
    // Conteúdo
    { name: 'Visualizar Conteúdo', code: 'content.read', resource: 'content', action: 'read' },
    { name: 'Criar Conteúdo', code: 'content.create', resource: 'content', action: 'create' },
    { name: 'Editar Conteúdo', code: 'content.update', resource: 'content', action: 'update' },
    { name: 'Deletar Conteúdo', code: 'content.delete', resource: 'content', action: 'delete' },
    
    // Avaliações
    { name: 'Visualizar Avaliações', code: 'quiz.read', resource: 'quiz', action: 'read' },
    { name: 'Criar Avaliações', code: 'quiz.create', resource: 'quiz', action: 'create' },
    { name: 'Editar Avaliações', code: 'quiz.update', resource: 'quiz', action: 'update' },
    { name: 'Deletar Avaliações', code: 'quiz.delete', resource: 'quiz', action: 'delete' },
    
    // Progresso
    { name: 'Visualizar Progresso', code: 'progress.read', resource: 'progress', action: 'read' },
    { name: 'Atualizar Progresso', code: 'progress.update', resource: 'progress', action: 'update' },
    
    // Relatórios
    { name: 'Visualizar Relatórios', code: 'report.read', resource: 'report', action: 'read' },
    { name: 'Gerar Relatórios', code: 'report.generate', resource: 'report', action: 'generate' },
    
    // Sistema
    { name: 'Configurar Sistema', code: 'system.config', resource: 'system', action: 'config' },
    { name: 'Visualizar Logs', code: 'system.logs', resource: 'system', action: 'logs' },
    { name: 'Migração MySQL', code: 'system.migration', resource: 'system', action: 'migration' },
    
    // Arquivos
    { name: 'Visualizar Arquivos', code: 'file.read', resource: 'file', action: 'read' },
    { name: 'Upload Arquivos', code: 'file.upload', resource: 'file', action: 'upload' },
    { name: 'Deletar Arquivos', code: 'file.delete', resource: 'file', action: 'delete' }
  ];
  
  // Inserir permissões se não existirem
  for (const permission of permissions) {
    await knex('permissions').insert({
      id: knex.raw('gen_random_uuid()'),
      ...permission,
      description: permission.name,
      is_active: true
    }).onConflict('code').ignore();
  }
  
  // 🎭 ROLE PERMISSIONS
  console.log('🎭 Configurando permissões dos roles...');
  
  // Buscar IDs dos roles
  const roles = await knex('roles').select('id', 'code');
  const roleMap = roles.reduce((acc, role) => {
    acc[role.code] = role.id;
    return acc;
  }, {} as Record<string, string>);
  
  // Buscar IDs das permissões
  const permissionsList = await knex('permissions').select('id', 'code');
  const permissionMap = permissionsList.reduce((acc, perm) => {
    acc[perm.code] = perm.id;
    return acc;
  }, {} as Record<string, string>);
  
  // Configurar permissões por role
  const rolePermissions = [
    // SYSTEM_ADMIN - Todas as permissões
    ...Object.values(permissionMap).map(permId => ({
      role_id: roleMap['SYSTEM_ADMIN'],
      permission_id: permId
    })),
    
    // INSTITUTION_MANAGER - Gerenciamento de instituição
    ...[
      'user.read', 'user.create', 'user.update',
      'institution.read', 'institution.update',
      'school.read', 'school.create', 'school.update',
      'course.read', 'course.create', 'course.update',
      'content.read', 'content.create', 'content.update',
      'quiz.read', 'quiz.create', 'quiz.update',
      'progress.read', 'report.read', 'report.generate',
      'file.read', 'file.upload'
    ].map(code => ({
      role_id: roleMap['INSTITUTION_MANAGER'],
      permission_id: permissionMap[code]
    })),
    
    // TEACHER - Ensino e avaliação
    ...[
      'course.read', 'content.read', 'content.create', 'content.update',
      'quiz.read', 'quiz.create', 'quiz.update',
      'progress.read', 'file.read', 'file.upload'
    ].map(code => ({
      role_id: roleMap['TEACHER'],
      permission_id: permissionMap[code]
    })),
    
    // STUDENT - Aprendizagem
    ...[
      'course.read', 'content.read', 'quiz.read', 'progress.read'
    ].map(code => ({
      role_id: roleMap['STUDENT'],
      permission_id: permissionMap[code]
    }))
  ];
  
  // Inserir role permissions
  await knex('role_permissions').insert(rolePermissions.filter(Boolean)).onConflict(['role_id', 'permission_id']).ignore();
  
  // 📧 EMAIL TEMPLATES
  console.log('📧 Inserindo templates de email...');
  
  const emailTemplates = [
    {
      name: 'welcome',
      subject: 'Bem-vindo ao Portal Sabercon!',
      body_html: `
        <h2>Olá {{name}}!</h2>
        <p>Seja bem-vindo ao Portal Sabercon. Sua conta foi criada com sucesso.</p>
        <p>Seus dados de acesso:</p>
        <ul>
          <li>Email: {{email}}</li>
          <li>Senha: {{password}}</li>
        </ul>
        <p>Acesse o sistema em: <a href="{{site_url}}">{{site_url}}</a></p>
        <p>Atenciosamente,<br>Equipe Portal Sabercon</p>
      `,
      body_text: `
        Olá {{name}}!
        
        Seja bem-vindo ao Portal Sabercon. Sua conta foi criada com sucesso.
        
        Seus dados de acesso:
        - Email: {{email}}
        - Senha: {{password}}
        
        Acesse o sistema em: {{site_url}}
        
        Atenciosamente,
        Equipe Portal Sabercon
      `,
      variables: JSON.stringify(['name', 'email', 'password', 'site_url'])
    },
    {
      name: 'password_reset',
      subject: 'Recuperação de Senha - Portal Sabercon',
      body_html: `
        <h2>Recuperação de Senha</h2>
        <p>Olá {{name}},</p>
        <p>Você solicitou a recuperação de senha para sua conta no Portal Sabercon.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <p><a href="{{reset_url}}">Redefinir Senha</a></p>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou esta recuperação, ignore este email.</p>
        <p>Atenciosamente,<br>Equipe Portal Sabercon</p>
      `,
      body_text: `
        Recuperação de Senha
        
        Olá {{name}},
        
        Você solicitou a recuperação de senha para sua conta no Portal Sabercon.
        
        Acesse o link abaixo para redefinir sua senha:
        {{reset_url}}
        
        Este link expira em 1 hora.
        
        Se você não solicitou esta recuperação, ignore este email.
        
        Atenciosamente,
        Equipe Portal Sabercon
      `,
      variables: JSON.stringify(['name', 'reset_url'])
    },
    {
      name: 'course_enrollment',
      subject: 'Inscrição em Curso - {{course_title}}',
      body_html: `
        <h2>Inscrição Confirmada!</h2>
        <p>Olá {{name}},</p>
        <p>Sua inscrição no curso "<strong>{{course_title}}</strong>" foi confirmada com sucesso.</p>
        <p>Detalhes do curso:</p>
        <ul>
          <li>Título: {{course_title}}</li>
          <li>Instrutor: {{instructor_name}}</li>
          <li>Duração: {{duration}} horas</li>
          <li>Data de início: {{start_date}}</li>
        </ul>
        <p>Acesse o curso em: <a href="{{course_url}}">{{course_url}}</a></p>
        <p>Bons estudos!</p>
        <p>Atenciosamente,<br>Equipe Portal Sabercon</p>
      `,
      body_text: `
        Inscrição Confirmada!
        
        Olá {{name}},
        
        Sua inscrição no curso "{{course_title}}" foi confirmada com sucesso.
        
        Detalhes do curso:
        - Título: {{course_title}}
        - Instrutor: {{instructor_name}}
        - Duração: {{duration}} horas
        - Data de início: {{start_date}}
        
        Acesse o curso em: {{course_url}}
        
        Bons estudos!
        
        Atenciosamente,
        Equipe Portal Sabercon
      `,
      variables: JSON.stringify(['name', 'course_title', 'instructor_name', 'duration', 'start_date', 'course_url'])
    },
    {
      name: 'quiz_completed',
      subject: 'Avaliação Concluída - {{quiz_title}}',
      body_html: `
        <h2>Avaliação Concluída!</h2>
        <p>Olá {{name}},</p>
        <p>Você concluiu a avaliação "<strong>{{quiz_title}}</strong>".</p>
        <p>Resultado:</p>
        <ul>
          <li>Pontuação: {{score}}/{{max_score}}</li>
          <li>Percentual: {{percentage}}%</li>
          <li>Status: {{status}}</li>
        </ul>
        <p>{{feedback}}</p>
        <p>Continue seus estudos!</p>
        <p>Atenciosamente,<br>Equipe Portal Sabercon</p>
      `,
      body_text: `
        Avaliação Concluída!
        
        Olá {{name}},
        
        Você concluiu a avaliação "{{quiz_title}}".
        
        Resultado:
        - Pontuação: {{score}}/{{max_score}}
        - Percentual: {{percentage}}%
        - Status: {{status}}
        
        {{feedback}}
        
        Continue seus estudos!
        
        Atenciosamente,
        Equipe Portal Sabercon
      `,
      variables: JSON.stringify(['name', 'quiz_title', 'score', 'max_score', 'percentage', 'status', 'feedback'])
    }
  ];
  
  // Inserir templates
  for (const template of emailTemplates) {
    await knex('email_templates').insert({
      id: knex.raw('gen_random_uuid()'),
      ...template,
      is_active: true
    }).onConflict('name').ignore();
  }
  
  // ⚙️ CONFIGURAÇÕES ADICIONAIS
  console.log('⚙️ Inserindo configurações adicionais...');
  
  const additionalSettings = [
    // Configurações de Email
    {
      key: 'email_enabled',
      value: 'true',
      description: 'Habilitar envio de emails',
      type: 'boolean',
      category: 'email',
      is_public: false
    },
    {
      key: 'email_from_name',
      value: 'Portal Sabercon',
      description: 'Nome do remetente dos emails',
      type: 'string',
      category: 'email',
      is_public: false
    },
    {
      key: 'email_from_address',
      value: 'noreply@portalsabercon.com',
      description: 'Email do remetente',
      type: 'string',
      category: 'email',
      is_public: false
    },
    
    // Configurações de Upload
    {
      key: 'upload_max_size',
      value: '100MB',
      description: 'Tamanho máximo de upload',
      type: 'string',
      category: 'upload',
      is_public: true
    },
    {
      key: 'upload_allowed_types',
      value: '["pdf", "doc", "docx", "mp4", "mp3", "jpg", "jpeg", "png", "gif"]',
      description: 'Tipos de arquivo permitidos',
      type: 'json',
      category: 'upload',
      is_public: true
    },
    
    // Configurações de Curso
    {
      key: 'course_auto_enroll',
      value: 'false',
      description: 'Inscrição automática em cursos',
      type: 'boolean',
      category: 'course',
      is_public: false
    },
    {
      key: 'course_completion_certificate',
      value: 'true',
      description: 'Gerar certificado ao completar curso',
      type: 'boolean',
      category: 'course',
      is_public: true
    },
    
    // Configurações de Quiz
    {
      key: 'quiz_default_time_limit',
      value: '60',
      description: 'Tempo limite padrão para quizzes (minutos)',
      type: 'number',
      category: 'quiz',
      is_public: true
    },
    {
      key: 'quiz_passing_score',
      value: '70',
      description: 'Pontuação mínima para aprovação (%)',
      type: 'number',
      category: 'quiz',
      is_public: true
    },
    
    // Configurações de Segurança
    {
      key: 'session_timeout',
      value: '30',
      description: 'Timeout de sessão (minutos)',
      type: 'number',
      category: 'security',
      is_public: false
    },
    {
      key: 'password_min_length',
      value: '8',
      description: 'Tamanho mínimo da senha',
      type: 'number',
      category: 'security',
      is_public: true
    },
    
    // Configurações de Migração
    {
      key: 'migration_status',
      value: 'ready',
      description: 'Status da migração MySQL',
      type: 'string',
      category: 'migration',
      is_system: true
    },
    {
      key: 'migration_last_run',
      value: new Date().toISOString(),
      description: 'Data da última migração',
      type: 'string',
      category: 'migration',
      is_system: true
    }
  ];
  
  // Inserir configurações
  for (const setting of additionalSettings) {
    await knex('system_settings').insert({
      id: knex.raw('gen_random_uuid()'),
      ...setting
    }).onConflict('key').ignore();
  }
  
  // 🎓 CICLOS EDUCACIONAIS PADRÃO
  console.log('🎓 Inserindo ciclos educacionais...');
  
  const institutionId = '75f57500-9a89-4318-bc9f-9acad28c2fba';
  
  const educationCycles = [
    {
      name: 'Educação Infantil',
      code: 'INFANTIL',
      description: 'Educação Infantil - 0 a 6 anos',
      min_age: 0,
      max_age: 6,
      duration_years: 6,
      institution_id: institutionId
    },
    {
      name: 'Ensino Fundamental I',
      code: 'FUNDAMENTAL_I',
      description: 'Ensino Fundamental I - 1º ao 5º ano',
      min_age: 6,
      max_age: 10,
      duration_years: 5,
      institution_id: institutionId
    },
    {
      name: 'Ensino Fundamental II',
      code: 'FUNDAMENTAL_II',
      description: 'Ensino Fundamental II - 6º ao 9º ano',
      min_age: 10,
      max_age: 14,
      duration_years: 4,
      institution_id: institutionId
    },
    {
      name: 'Ensino Médio',
      code: 'MEDIO',
      description: 'Ensino Médio - 1º ao 3º ano',
      min_age: 14,
      max_age: 18,
      duration_years: 3,
      institution_id: institutionId
    },
    {
      name: 'Ensino Superior',
      code: 'SUPERIOR',
      description: 'Ensino Superior - Graduação',
      min_age: 18,
      max_age: 65,
      duration_years: 4,
      institution_id: institutionId
    }
  ];
  
  // Inserir ciclos
  for (const cycle of educationCycles) {
    await knex('education_cycles').insert({
      id: knex.raw('gen_random_uuid()'),
      ...cycle,
      is_active: true
    }).onConflict(['code', 'institution_id']).ignore();
  }
  
  // 📚 COLEÇÃO PADRÃO
  console.log('📚 Inserindo coleção padrão...');
  
  const defaultCollection = {
    id: knex.raw('gen_random_uuid()'),
    title: 'Biblioteca Migrada do MySQL',
    slug: 'biblioteca-migrada-mysql',
    description: 'Coleção criada automaticamente para organizar conteúdo migrado do MySQL',
    type: 'course',
    category: 'educacional',
    institution_id: institutionId,
    is_active: true,
    metadata: JSON.stringify({
      source: 'mysql_migration',
      migration_date: new Date().toISOString()
    })
  };
  
  await knex('collections').insert([defaultCollection]).onConflict('slug').ignore();
  
  console.log('✅ Seed completo finalizado!');
  console.log(`
📊 RESUMO DO SEED:
  
✅ Permissões criadas: ${permissions.length}
✅ Role permissions configuradas: ${rolePermissions.length}
✅ Templates de email: ${emailTemplates.length}
✅ Configurações do sistema: ${additionalSettings.length}
✅ Ciclos educacionais: ${educationCycles.length}
✅ Coleção padrão: 1

🎯 Sistema pronto para receber dados do MySQL!
  `);
}
