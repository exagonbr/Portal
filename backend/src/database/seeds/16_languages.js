'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Deleta todos os registros existentes
  await knex('languages').del();
  
  // Insere os idiomas
  await knex('languages').insert([
    {
      id: 1,
      name: 'Português',
      code: 'pt-BR',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'English',
      code: 'en-US',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Español',
      code: 'es-ES',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Français',
      code: 'fr-FR',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Deutsch',
      code: 'de-DE',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: 'Italiano',
      code: 'it-IT',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      name: '中文',
      code: 'zh-CN',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 8,
      name: '日本語',
      code: 'ja-JP',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};