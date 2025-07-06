import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  console.log('🔍 Verificando tabelas de rastreamento de atividade...')

  // Verificar e atualizar tabela user_activity
  const hasUserActivity = await knex.schema.hasTable('user_activity')
  if (!hasUserActivity) {
    // Criar tabela completamente nova
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
    // Tabela existe, verificar e adicionar colunas que faltam
    console.log('📋 Tabela user_activity já existe, verificando colunas...')
    
    // Verificar se a coluna session_id existe
    const hasSessionId = await knex.schema.hasColumn('user_activity', 'session_id')
    if (!hasSessionId) {
      console.log('➕ Adicionando coluna session_id...')
      await knex.schema.alterTable('user_activity', (table) => {
        table.string('session_id').nullable().index()
      })
    }
    
    // Verificar se a coluna activity_type existe
    const hasActivityType = await knex.schema.hasColumn('user_activity', 'activity_type')
    if (!hasActivityType) {
      console.log('➕ Adicionando coluna activity_type...')
      await knex.schema.alterTable('user_activity', (table) => {
        table.string('activity_type').nullable().index()
      })
      
      // Migrar dados da coluna 'type' para 'activity_type' se existir
      const hasTypeColumn = await knex.schema.hasColumn('user_activity', 'type')
      if (hasTypeColumn) {
        console.log('🔄 Migrando dados de "type" para "activity_type"...')
        await knex.raw(`
          UPDATE user_activity 
          SET activity_type = COALESCE(type, 'system_action')
          WHERE activity_type IS NULL
        `)
      }
    }
    
    // Verificar se a coluna entity_type existe
    const hasEntityType = await knex.schema.hasColumn('user_activity', 'entity_type')
    if (!hasEntityType) {
      console.log('➕ Adicionando coluna entity_type...')
      await knex.schema.alterTable('user_activity', (table) => {
        table.string('entity_type').nullable()
      })
    }
    
    // Verificar se a coluna entity_id existe
    const hasEntityId = await knex.schema.hasColumn('user_activity', 'entity_id')
    if (!hasEntityId) {
      console.log('➕ Adicionando coluna entity_id...')
      await knex.schema.alterTable('user_activity', (table) => {
        table.string('entity_id').nullable()
      })
      
      // Migrar dados da coluna 'video_id' para 'entity_id' se existir
      const hasVideoIdColumn = await knex.schema.hasColumn('user_activity', 'video_id')
      if (hasVideoIdColumn) {
        console.log('🔄 Migrando video_id para entity_id...')
        await knex.raw(`
          UPDATE user_activity 
          SET entity_id = video_id::text, entity_type = 'video'
          WHERE video_id IS NOT NULL AND entity_id IS NULL
        `)
      }
    }
    
    // Verificar se a coluna action existe
    const hasAction = await knex.schema.hasColumn('user_activity', 'action')
    if (!hasAction) {
      console.log('➕ Adicionando coluna action...')
      await knex.schema.alterTable('user_activity', (table) => {
        table.string('action').defaultTo('view').notNullable()
      })
    }
    
    // Verificar se a coluna created_at existe
    const hasCreatedAt = await knex.schema.hasColumn('user_activity', 'created_at')
    if (!hasCreatedAt) {
      console.log('➕ Adicionando coluna created_at...')
      await knex.schema.alterTable('user_activity', (table) => {
        table.timestamp('created_at').defaultTo(knex.fn.now())
      })
    }
    
    // Verificar se a coluna updated_at existe
    const hasUpdatedAt = await knex.schema.hasColumn('user_activity', 'updated_at')
    if (!hasUpdatedAt) {
      console.log('➕ Adicionando coluna updated_at...')
      await knex.schema.alterTable('user_activity', (table) => {
        table.timestamp('updated_at').defaultTo(knex.fn.now())
      })
    }
    
    // Adicionar outras colunas necessárias
    const columnsToCheck = [
      'duration_seconds', 'start_time', 'end_time', 'details', 
      'user_agent', 'device_info', 'location'
    ]
    
    const existingColumns = await knex('information_schema.columns')
      .select('column_name')
      .where('table_name', 'user_activity')
      .where('table_schema', 'public')
    
    const existingColumnNames = existingColumns.map(col => col.column_name)
    const missingColumns = columnsToCheck.filter(col => !existingColumnNames.includes(col))
    
    if (missingColumns.length > 0) {
      console.log(`➕ Adicionando colunas: ${missingColumns.join(', ')}...`)
      await knex.schema.alterTable('user_activity', (table) => {
        if (!existingColumnNames.includes('duration_seconds')) table.integer('duration_seconds').nullable()
        if (!existingColumnNames.includes('start_time')) table.timestamp('start_time').nullable()
        if (!existingColumnNames.includes('end_time')) table.timestamp('end_time').nullable()
        if (!existingColumnNames.includes('details')) table.json('details').nullable()
        if (!existingColumnNames.includes('user_agent')) table.string('user_agent').nullable()
        if (!existingColumnNames.includes('device_info')) table.string('device_info').nullable()
        if (!existingColumnNames.includes('location')) table.string('location').nullable()
      })
    }
    
    console.log('✅ Tabela user_activity atualizada com sucesso!')
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