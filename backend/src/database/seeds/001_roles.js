'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Limpar tabela de roles
  await knex('roles').del();
  
  // Inserir roles baseadas no arquivo roles.ts
  await knex('roles').insert([
    {
      id: 1,
      name: 'SYSTEM_ADMIN',
      description: 'Supervisiona toda a infraestrutura da plataforma. Responsável por configurações do sistema, gerenciamento de permissões, integração de instituições, políticas de segurança e garantia da integridade e disponibilidade da plataforma.',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 2,
      name: 'INSTITUTION_MANAGER',
      description: 'Gerencia as operações de uma escola ou unidade educacional específica. Possui acesso administrativo para gerenciar turmas, usuários, horários, análises de desempenho, conteúdo institucional e comunicações internas.',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 3,
      name: 'COORDINATOR',
      description: 'Supervisiona ciclos educacionais específicos ou departamentos. Monitora o progresso acadêmico dos alunos, apoia o desenvolvimento dos professores, coordena a execução do currículo e analisa dados de desempenho.',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 4,
      name: 'TEACHER',
      description: 'Acessa suas turmas designadas para gerenciar registros de presença, notas, planos de aula, recursos instrucionais e comunicação bidirecional com alunos e responsáveis.',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 5,
      name: 'STUDENT',
      description: 'Tem acesso ao seu ambiente de aprendizagem personalizado, incluindo horários de aula, materiais de aprendizagem digital, avaliações, acompanhamento de progresso e mensagens com professores.',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 6,
      name: 'GUARDIAN',
      description: 'Recebe insights detalhados sobre o desempenho acadêmico e comportamental dos alunos sob seus cuidados. Inclui acesso em tempo real a registros de presença, notas, comunicados escolares e comunicação direta com a equipe escolar.',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
}; 