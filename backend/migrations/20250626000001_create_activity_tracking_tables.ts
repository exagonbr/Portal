import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
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
      
      // Migrar video_id para entity_id se necessário
      const hasVideoId = await knex.schema.hasColumn('user_activity', 'video_id')
      if (hasVideoId) {
        console.log('🔄 Migrando video_id para entity_id...')
        await knex.raw(`
          UPDATE user_activity 
          SET entity_type = 'video', entity_id = video_id::text
          WHERE video_id IS NOT NULL AND entity_id IS NULL
        `)
      }
    }
    
    // Verificar se a coluna action existe
    const hasAction = await knex.schema.hasColumn('user_activity', 'action')
    if (!hasAction) {
      console.log('➕ Adicionando coluna action...')
      await knex.schema.alterTable('user_activity', (table) => {
        table.string('action').nullable()
      })
      
      // Preencher action baseado em activity_type
      await knex.raw(`
        UPDATE user_activity 
        SET action = COALESCE(activity_type, type, 'unknown_action')
        WHERE action IS NULL
      `)
    }
    
    // Verificar outras colunas importantes
    const missingColumns: string[] = []
    const columnsToCheck: string[] = [
      'duration_seconds', 'start_time', 'end_time', 'details',
      'ip_address', 'user_agent', 'device_info', 'browser',
      'operating_system', 'location'
    ]
    
    for (const column of columnsToCheck) {
      const hasColumn = await knex.schema.hasColumn('user_activity', column)
      if (!hasColumn) {
        missingColumns.push(column)
      }
    }
    
    if (missingColumns.length > 0) {
      console.log(`➕ Adicionando colunas: ${missingColumns.join(', ')}...`)
      await knex.schema.alterTable('user_activity', (table) => {
        if (missingColumns.includes('duration_seconds')) table.integer('duration_seconds').nullable()
        if (missingColumns.includes('start_time')) table.timestamp('start_time').nullable()
        if (missingColumns.includes('end_time')) table.timestamp('end_time').nullable()
        if (missingColumns.includes('details')) table.json('details').nullable()
        if (missingColumns.includes('ip_address')) table.string('ip_address').nullable()
        if (missingColumns.includes('user_agent')) table.string('user_agent').nullable()
        if (missingColumns.includes('device_info')) table.string('device_info').nullable()
        if (missingColumns.includes('browser')) table.string('browser').nullable()
        if (missingColumns.includes('operating_system')) table.string('operating_system').nullable()
        if (missingColumns.includes('location')) table.string('location').nullable()
      })
    }
    
    console.log('✅ Tabela user_activity atualizada com sucesso!')
  }

  // Criar tabela viewing_status se não existir
  const hasViewingStatus = await knex.schema.hasTable('viewing_status')
  if (!hasViewingStatus) {
    await knex.schema.createTable('viewing_status', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.string('user_id').notNullable()
      table.integer('video_id').notNullable()
      table.integer('tv_show_id').nullable()
      table.string('profile_id').nullable()
      table.integer('current_play_time').defaultTo(0)
      table.integer('runtime').nullable()
      table.boolean('completed').defaultTo(false)
      table.decimal('watch_percentage', 5, 2).defaultTo(0)
      table.integer('last_position').defaultTo(0)
      table.string('quality').nullable()
      table.decimal('playback_speed', 3, 2).defaultTo(1.0)
      table.string('subtitle_language').nullable()
      table.string('audio_language').nullable()
      table.string('device_type').defaultTo('web')
      table.timestamps(true, true)
      
      // Campos legados para compatibilidade
      table.bigint('version').nullable()
      table.timestamp('date_created').nullable()
      table.timestamp('last_updated').nullable()
      
      // Índices e constraints
      table.unique(['user_id', 'video_id'])
      table.index(['user_id'])
      table.index(['video_id'])
      table.index(['tv_show_id'])
      table.index(['completed'])
      table.index(['updated_at'])
    })
  }

  // Criar tabela watchlist_entry se não existir
  const hasWatchlistEntry = await knex.schema.hasTable('watchlist_entry')
  if (!hasWatchlistEntry) {
    await knex.schema.createTable('watchlist_entry', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.string('user_id').notNullable()
      table.integer('video_id').nullable()
      table.integer('tv_show_id').nullable()
      table.string('profile_id').nullable()
      table.timestamp('added_at').defaultTo(knex.fn.now())
      table.boolean('is_deleted').defaultTo(false)
      table.integer('priority').nullable()
      table.text('notes').nullable()
      table.timestamp('reminder_date').nullable()
      table.timestamps(true, true)
      
      // Campos legados para compatibilidade
      table.bigint('version').nullable()
      table.timestamp('date_created').nullable()
      table.timestamp('last_updated').nullable()
      
      // Índices
      table.index(['user_id'])
      table.index(['video_id'])
      table.index(['tv_show_id'])
      table.index(['is_deleted'])
      table.index(['added_at'])
      
      // Constraint: deve ter pelo menos video_id ou tv_show_id
      table.check('video_id IS NOT NULL OR tv_show_id IS NOT NULL')
    })
  }

  // Criar tabela activity_sessions para rastrear sessões de usuário
  const hasActivitySessions = await knex.schema.hasTable('activity_sessions')
  if (!hasActivitySessions) {
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
  }

  // Criar tabela activity_summaries para relatórios agregados
  const hasActivitySummaries = await knex.schema.hasTable('activity_summaries')
  if (!hasActivitySummaries) {
    await knex.schema.createTable('activity_summaries', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.string('user_id').notNullable()
      table.date('date').notNullable()
      table.integer('total_time_seconds').defaultTo(0)
      table.integer('page_views').defaultTo(0)
      table.integer('video_time_seconds').defaultTo(0)
      table.integer('videos_watched').defaultTo(0)
      table.integer('quizzes_attempted').defaultTo(0)
      table.integer('assignments_submitted').defaultTo(0)
      table.integer('login_count').defaultTo(0)
      table.integer('unique_sessions').defaultTo(0)
      table.timestamps(true, true)
      
      // Índices e constraints
      table.unique(['user_id', 'date'])
      table.index(['user_id'])
      table.index(['date'])
      table.index(['user_id', 'date'])
    })
  }

  // Criar views para compatibilidade e relatórios (com verificação de colunas)
  console.log('📊 Criando views para relatórios...')
  
  // Verificar se as colunas necessárias existem antes de criar as views
  const hasSessionIdColumn = await knex.schema.hasColumn('user_activity', 'session_id')
  const hasActivityTypeColumn = await knex.schema.hasColumn('user_activity', 'activity_type')
  const hasCreatedAtColumn = await knex.schema.hasColumn('user_activity', 'created_at')
  const hasEntityTypeColumn = await knex.schema.hasColumn('user_activity', 'entity_type')
  const hasEntityIdColumn = await knex.schema.hasColumn('user_activity', 'entity_id')
  
  let sessionIdField = hasSessionIdColumn ? 'session_id' : 'NULL::text'
  let activityTypeField = hasActivityTypeColumn ? 'activity_type' : 'COALESCE(type, \'unknown\')'
  let createdAtField = hasCreatedAtColumn ? 'created_at' : 'COALESCE(date_created, NOW())'
  
  await knex.raw(`
    CREATE OR REPLACE VIEW v_user_activity_summary AS
    SELECT 
        user_id,
        COUNT(*) as total_activities,
        COUNT(DISTINCT ${sessionIdField}) as unique_sessions,
        COUNT(DISTINCT DATE(${createdAtField})) as active_days,
        COUNT(*) FILTER (WHERE ${activityTypeField} = 'login') as login_count,
        COUNT(*) FILTER (WHERE ${activityTypeField} LIKE 'video_%') as video_activities,
        COUNT(*) FILTER (WHERE ${activityTypeField} LIKE 'quiz_%') as quiz_activities,
        COUNT(*) FILTER (WHERE ${activityTypeField} LIKE 'assignment_%') as assignment_activities,
        MIN(${createdAtField}) as first_activity,
        MAX(${createdAtField}) as last_activity
    FROM user_activity
    GROUP BY user_id;
  `)

  // Criar view de estatísticas de vídeo apenas se viewing_status existir
  const hasViewingStatusTable = await knex.schema.hasTable('viewing_status')
  if (hasViewingStatusTable) {
    let entityTypeCondition = hasEntityTypeColumn ? "ua.entity_type = 'video'" : "TRUE"
    let entityIdCondition = hasEntityIdColumn ? "vs.video_id::text = ua.entity_id" : "vs.video_id = ua.video_id"
    
    console.log('📊 Verificando colunas da tabela viewing_status...')
    
    // Verificar quais colunas existem na tabela viewing_status
    const viewingStatusColumns = await knex('information_schema.columns')
      .select('column_name')
      .where('table_name', 'viewing_status')
      .pluck('column_name')
    
    console.log('📋 Colunas encontradas em viewing_status:', viewingStatusColumns.join(', '))
    
    // Construir campos SELECT dinamicamente baseado nas colunas existentes
    let selectFields = ['vs.user_id', 'vs.video_id']
    let groupByFields = ['vs.user_id', 'vs.video_id']
    
    // Adicionar colunas condicionalmente
    if (viewingStatusColumns.includes('tv_show_id')) {
      selectFields.push('vs.tv_show_id')
      groupByFields.push('vs.tv_show_id')
    }
    
    if (viewingStatusColumns.includes('current_play_time')) {
      selectFields.push('vs.current_play_time')
      groupByFields.push('vs.current_play_time')
    } else if (viewingStatusColumns.includes('current_position')) {
      selectFields.push('vs.current_position as current_play_time')
      groupByFields.push('vs.current_position')
    }
    
    if (viewingStatusColumns.includes('runtime')) {
      selectFields.push('vs.runtime')
      groupByFields.push('vs.runtime')
    } else if (viewingStatusColumns.includes('duration')) {
      selectFields.push('vs.duration as runtime')
      groupByFields.push('vs.duration')
    }
    
    if (viewingStatusColumns.includes('watch_percentage')) {
      selectFields.push('vs.watch_percentage')
      groupByFields.push('vs.watch_percentage')
    } else if (viewingStatusColumns.includes('completion_percentage')) {
      selectFields.push('vs.completion_percentage as watch_percentage')
      groupByFields.push('vs.completion_percentage')
    } else {
      selectFields.push('0 as watch_percentage')
    }
    
    if (viewingStatusColumns.includes('completed')) {
      selectFields.push('vs.completed')
      groupByFields.push('vs.completed')
    }
    
    if (viewingStatusColumns.includes('quality')) {
      selectFields.push('vs.quality')
      groupByFields.push('vs.quality')
    }
    
    if (viewingStatusColumns.includes('playback_speed')) {
      selectFields.push('vs.playback_speed')
      groupByFields.push('vs.playback_speed')
    }
    
    if (viewingStatusColumns.includes('device_type')) {
      selectFields.push('vs.device_type')
      groupByFields.push('vs.device_type')
    }
    
    if (viewingStatusColumns.includes('updated_at')) {
      selectFields.push('vs.updated_at as last_watched')
      groupByFields.push('vs.updated_at')
    } else if (viewingStatusColumns.includes('last_updated')) {
      selectFields.push('vs.last_updated as last_watched')
      groupByFields.push('vs.last_updated')
    }
    
    // Adicionar campos agregados
    selectFields.push('COUNT(ua.id) as total_interactions')
    selectFields.push(`COUNT(*) FILTER (WHERE ${activityTypeField} = 'video_pause') as pause_count`)
    selectFields.push(`COUNT(*) FILTER (WHERE ${activityTypeField} = 'video_seek') as seek_count`)
    
    await knex.raw(`
      CREATE OR REPLACE VIEW v_video_watching_stats AS
      SELECT 
          ${selectFields.join(',\n          ')}
      FROM viewing_status vs
      LEFT JOIN user_activity ua ON vs.user_id = ua.user_id 
          AND ${entityIdCondition}
          AND ${entityTypeCondition}
      GROUP BY ${groupByFields.join(', ')};
    `)
    
    console.log('✅ View v_video_watching_stats criada com sucesso!')
  } else {
    console.log('⚠️  Tabela viewing_status não existe, pulando criação da view v_video_watching_stats')
  }

  // Criar função para atualizar activity_summaries automaticamente apenas se activity_summaries existir
  const hasActivitySummariesTable = await knex.schema.hasTable('activity_summaries')
  if (hasActivitySummariesTable) {
    console.log('⚙️  Criando função de trigger para activity_summaries...')
    
    let activityTypeFieldForTrigger = hasActivityTypeColumn ? 'NEW.activity_type' : 'COALESCE(NEW.type, \'unknown\')'
    let createdAtFieldForTrigger = hasCreatedAtColumn ? 'NEW.created_at' : 'COALESCE(NEW.date_created, NOW())'
    let durationFieldForTrigger = await knex.schema.hasColumn('user_activity', 'duration_seconds') ? 'NEW.duration_seconds' : '0'
    
    await knex.raw(`
      CREATE OR REPLACE FUNCTION update_activity_summary()
      RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO activity_summaries (user_id, date, total_time_seconds, page_views, video_time_seconds, videos_watched, quizzes_attempted, assignments_submitted, login_count, unique_sessions)
          VALUES (
              NEW.user_id,
              DATE(${createdAtFieldForTrigger}),
              COALESCE(${durationFieldForTrigger}, 0),
              CASE WHEN ${activityTypeFieldForTrigger} = 'page_view' THEN 1 ELSE 0 END,
              CASE WHEN ${activityTypeFieldForTrigger} LIKE 'video_%' THEN COALESCE(${durationFieldForTrigger}, 0) ELSE 0 END,
              CASE WHEN ${activityTypeFieldForTrigger} = 'video_complete' THEN 1 ELSE 0 END,
              CASE WHEN ${activityTypeFieldForTrigger} = 'quiz_attempt' THEN 1 ELSE 0 END,
              CASE WHEN ${activityTypeFieldForTrigger} = 'assignment_submit' THEN 1 ELSE 0 END,
              CASE WHEN ${activityTypeFieldForTrigger} = 'login' THEN 1 ELSE 0 END,
              1
          )
          ON CONFLICT (user_id, date) DO UPDATE SET
              total_time_seconds = activity_summaries.total_time_seconds + COALESCE(${durationFieldForTrigger}, 0),
              page_views = activity_summaries.page_views + (CASE WHEN ${activityTypeFieldForTrigger} = 'page_view' THEN 1 ELSE 0 END),
              video_time_seconds = activity_summaries.video_time_seconds + (CASE WHEN ${activityTypeFieldForTrigger} LIKE 'video_%' THEN COALESCE(${durationFieldForTrigger}, 0) ELSE 0 END),
              videos_watched = activity_summaries.videos_watched + (CASE WHEN ${activityTypeFieldForTrigger} = 'video_complete' THEN 1 ELSE 0 END),
              quizzes_attempted = activity_summaries.quizzes_attempted + (CASE WHEN ${activityTypeFieldForTrigger} = 'quiz_attempt' THEN 1 ELSE 0 END),
              assignments_submitted = activity_summaries.assignments_submitted + (CASE WHEN ${activityTypeFieldForTrigger} = 'assignment_submit' THEN 1 ELSE 0 END),
              login_count = activity_summaries.login_count + (CASE WHEN ${activityTypeFieldForTrigger} = 'login' THEN 1 ELSE 0 END),
              updated_at = NOW();
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Criar trigger para atualizar automaticamente os resumos
    await knex.raw(`
      DROP TRIGGER IF EXISTS trigger_update_activity_summary ON user_activity;
      CREATE TRIGGER trigger_update_activity_summary
          AFTER INSERT ON user_activity
          FOR EACH ROW
          EXECUTE FUNCTION update_activity_summary();
    `)
  } else {
    console.log('⚠️  Tabela activity_summaries não existe, pulando criação do trigger')
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remover triggers e funções
  await knex.raw('DROP TRIGGER IF EXISTS trigger_update_activity_summary ON user_activity')
  await knex.raw('DROP FUNCTION IF EXISTS update_activity_summary()')
  
  // Remover views
  await knex.raw('DROP VIEW IF EXISTS v_video_watching_stats')
  await knex.raw('DROP VIEW IF EXISTS v_user_activity_summary')
  
  // Remover tabelas (em ordem reversa devido às dependências)
  await knex.schema.dropTableIfExists('activity_summaries')
  await knex.schema.dropTableIfExists('activity_sessions')
  await knex.schema.dropTableIfExists('watchlist_entry')
  await knex.schema.dropTableIfExists('viewing_status')
  await knex.schema.dropTableIfExists('user_activity')
} 