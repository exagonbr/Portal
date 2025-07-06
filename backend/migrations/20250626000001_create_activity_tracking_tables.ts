import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  console.log('🔍 Verificando tabelas de rastreamento de atividade...')

  // Criar tabela user_activity se não existir
  const hasUserActivity = await knex.schema.hasTable('user_activity')
  if (!hasUserActivity) {
    console.log('📊 Criando tabela user_activity...')
    await knex.schema.createTable('user_activity', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.string('user_id').notNullable().index()
      table.string('session_id').nullable().index()
      table.string('activity_type').notNullable().index()
      table.string('entity_type').nullable()
      table.string('entity_id').nullable()
      table.string('action').notNullable()
      table.json('details').nullable()
      table.string('ip_address').nullable()
      table.string('user_agent').nullable()
      table.string('device_info').nullable()
      table.string('browser').nullable()
      table.string('operating_system').nullable()
      table.string('location').nullable()
      table.integer('duration_seconds').nullable()
      table.timestamp('start_time').nullable()
      table.timestamp('end_time').nullable()
      table.timestamps(true, true)
      
      // Campos legados para compatibilidade com sistema antigo
      table.bigint('version').nullable()
      table.timestamp('date_created').nullable()
      table.timestamp('last_updated').nullable()
      table.string('type').nullable() // Mapeia para activity_type
      table.integer('video_id').nullable()
      table.string('institution_id').nullable()
      table.string('unit_id').nullable()
      table.string('fullname').nullable()
      table.string('institution_name').nullable()
      table.boolean('is_certified').nullable()
      table.string('username').nullable()
      
      // Índices para performance
      table.index(['user_id', 'activity_type'])
      table.index(['user_id', 'created_at'])
      table.index(['activity_type', 'created_at'])
      table.index(['session_id', 'created_at'])
      table.index(['entity_type', 'entity_id'])
      table.index(['date_created']) // Para compatibilidade com sistema antigo
    })
    console.log('✅ Tabela user_activity criada com sucesso!')
  } else {
    console.log('ℹ️ Tabela user_activity já existe')
  }

  // Criar tabela activity_sessions para rastrear sessões de usuário
  const hasActivitySessions = await knex.schema.hasTable('activity_sessions')
  if (!hasActivitySessions) {
    console.log('📊 Criando tabela activity_sessions...')
    await knex.schema.createTable('activity_sessions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.string('session_id').notNullable().unique()
      table.string('user_id').notNullable()
      table.timestamp('start_time').defaultTo(knex.fn.now())
      table.timestamp('end_time').nullable()
      table.integer('duration_seconds').nullable()
      table.integer('page_views').defaultTo(0)
      table.integer('actions_count').defaultTo(0)
      table.string('ip_address').nullable()
      table.string('user_agent').nullable()
      table.json('device_info').nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('last_activity').defaultTo(knex.fn.now())
      table.timestamps(true, true)
      
      // Índices
      table.index(['user_id'])
      table.index(['session_id'])
      table.index(['is_active'])
      table.index(['start_time'])
      table.index(['last_activity'])
    })
    console.log('✅ Tabela activity_sessions criada com sucesso!')
  } else {
    console.log('ℹ️ Tabela activity_sessions já existe')
  }

  console.log('✅ Migração de tabelas de rastreamento de atividade concluída!')
}

export async function down(knex: Knex): Promise<void> {
  // Reverter as alterações na ordem inversa
  await knex.schema.dropTableIfExists('activity_sessions')
  await knex.schema.dropTableIfExists('activity_summaries')
  await knex.schema.dropTableIfExists('user_activity')
  
  console.log('✅ Rollback de tabelas de rastreamento de atividade concluído!')
} 