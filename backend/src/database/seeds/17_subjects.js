'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Deleta todos os registros existentes
  await knex('subjects').del();
  
  // Insere as disciplinas
  await knex('subjects').insert([
    {
      id: 1,
      name: 'Matemática',
      code: 'MAT',
      description: 'Estudo de números, formas, padrões e suas relações',
      icon: 'calculator',
      color: '#FF6B6B',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Português',
      code: 'POR',
      description: 'Língua portuguesa, literatura e produção textual',
      icon: 'book',
      color: '#4ECDC4',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Ciências',
      code: 'CIE',
      description: 'Estudo da natureza e fenômenos científicos',
      icon: 'flask',
      color: '#45B7D1',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'História',
      code: 'HIS',
      description: 'Estudo dos eventos e processos históricos',
      icon: 'clock',
      color: '#F7DC6F',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Geografia',
      code: 'GEO',
      description: 'Estudo do espaço geográfico e suas relações',
      icon: 'globe',
      color: '#52C41A',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: 'Inglês',
      code: 'ING',
      description: 'Língua inglesa e cultura anglófona',
      icon: 'language',
      color: '#722ED1',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      name: 'Educação Física',
      code: 'EDF',
      description: 'Atividades físicas, esportes e saúde',
      icon: 'running',
      color: '#FA8C16',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 8,
      name: 'Artes',
      code: 'ART',
      description: 'Expressão artística e cultural',
      icon: 'palette',
      color: '#EB2F96',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 9,
      name: 'Física',
      code: 'FIS',
      description: 'Estudo dos fenômenos físicos e leis da natureza',
      icon: 'atom',
      color: '#13C2C2',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 10,
      name: 'Química',
      code: 'QUI',
      description: 'Estudo da matéria e suas transformações',
      icon: 'beaker',
      color: '#597EF7',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 11,
      name: 'Biologia',
      code: 'BIO',
      description: 'Estudo dos seres vivos e processos vitais',
      icon: 'dna',
      color: '#95DE64',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 12,
      name: 'Filosofia',
      code: 'FIL',
      description: 'Reflexão sobre questões fundamentais da existência',
      icon: 'brain',
      color: '#B37FEB',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 13,
      name: 'Sociologia',
      code: 'SOC',
      description: 'Estudo da sociedade e relações sociais',
      icon: 'users',
      color: '#FF85C0',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 14,
      name: 'Espanhol',
      code: 'ESP',
      description: 'Língua espanhola e cultura hispânica',
      icon: 'language',
      color: '#FFA940',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 15,
      name: 'Informática',
      code: 'INF',
      description: 'Tecnologia da informação e computação',
      icon: 'computer',
      color: '#36CFC9',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};