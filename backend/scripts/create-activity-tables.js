// Script para criar as tabelas de rastreamento de atividade
const knex = require('knex');
const config = require('../knexfile').default;

async function createActivityTables() {
  const environment = process.env.NODE_ENV || 'development';
  const db = knex(config[environment]);

  console.log('🔍 Verificando tabelas de rastreamento de atividade...');

  try {
    // Verificar e criar tabela user_activity
    const hasUserActivity = await db.schema.hasTable('user_activity');
    if (!hasUserActivity) {
      console.log('📊 Criando tabela user_activity...');
      await db.schema.createTable('user_activity', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.string('user_id').notNullable().index();
        table.string('session_id').nullable().index();
        table.string('activity_type').notNullable().index();
        table.string('entity_type').nullable();
        table.string('entity_id').nullable();
        table.string('action').notNullable();
        table.json('details').nullable();
        table.string('ip_address').nullable();
        table.string('user_agent').nullable();
        table.string('device_info').nullable();
        table.string('browser').nullable();
        table.string('operating_system').nullable();
        table.string('location').nullable();
        table.integer('duration_seconds').nullable();
        table.timestamp('start_time').nullable();
        table.timestamp('end_time').nullable();
        table.timestamps(true, true);
        
        // Índices para performance
        table.index(['user_id', 'activity_type']);
        table.index(['user_id', 'created_at']);
        table.index(['activity_type', 'created_at']);
      });
      console.log('✅ Tabela user_activity criada com sucesso!');
    } else {
      console.log('ℹ️ Tabela user_activity já existe');
    }

    // Verificar e criar tabela activity_sessions
    const hasActivitySessions = await db.schema.hasTable('activity_sessions');
    if (!hasActivitySessions) {
      console.log('📊 Criando tabela activity_sessions...');
      await db.schema.createTable('activity_sessions', (table) => {
        table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
        table.string('session_id').notNullable().unique();
        table.string('user_id').notNullable();
        table.timestamp('start_time').defaultTo(db.fn.now());
        table.timestamp('end_time').nullable();
        table.integer('duration_seconds').nullable();
        table.integer('page_views').defaultTo(0);
        table.integer('actions_count').defaultTo(0);
        table.string('ip_address').nullable();
        table.string('user_agent').nullable();
        table.json('device_info').nullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamp('last_activity').defaultTo(db.fn.now());
        table.timestamps(true, true);
        
        // Índices
        table.index(['user_id']);
        table.index(['session_id']);
        table.index(['is_active']);
        table.index(['start_time']);
        table.index(['last_activity']);
      });
      console.log('✅ Tabela activity_sessions criada com sucesso!');
    } else {
      console.log('ℹ️ Tabela activity_sessions já existe');
    }

    console.log('✅ Criação de tabelas de rastreamento de atividade concluída!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas de rastreamento de atividade:', error);
  } finally {
    await db.destroy();
  }
}

createActivityTables()
  .then(() => {
    console.log('Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro na execução do script:', error);
    process.exit(1);
  }); 