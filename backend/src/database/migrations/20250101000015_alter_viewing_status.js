'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  // Verificar se a tabela viewing_status existe
  const hasTable = await knex.schema.hasTable('viewing_status');
  
  if (!hasTable) {
    console.log('Tabela viewing_status não existe. Pulando migração.');
    return;
  }
  
  // Verificar quais colunas já existem para não duplicar
  const columns = await knex('information_schema.columns')
    .select('column_name')
    .where({
      table_schema: 'public',
      table_name: 'viewing_status'
    });
  
  const existingColumns = columns.map(col => col.column_name);
  
  await knex.schema.alterTable('viewing_status', function(table) {
    // Garantir que as colunas básicas existam
    if (!existingColumns.includes('user_id')) {
      table.bigInteger('user_id').unsigned().nullable();
    }
    
    if (!existingColumns.includes('video_id')) {
      table.bigInteger('video_id').unsigned().nullable();
    }
    
    if (!existingColumns.includes('tv_show_id')) {
      table.bigInteger('tv_show_id').unsigned().nullable();
    }
    
    if (!existingColumns.includes('current_play_time')) {
      table.integer('current_play_time').notNullable().defaultTo(0);
    }
    
    // Campos para tipos de conteúdo genéricos
    if (!existingColumns.includes('content_id')) {
      table.bigInteger('content_id').unsigned().nullable().comment('ID de outros tipos de conteúdo');
    }
    
    if (!existingColumns.includes('content_type')) {
      table.string('content_type', 50).nullable().comment('Tipo de conteúdo: video, tv_show, course, lesson, etc');
    }
    
    // Campos de progresso adicionais
    if (!existingColumns.includes('total_duration')) {
      table.integer('total_duration').nullable().comment('Duração total em segundos');
    }
    
    if (!existingColumns.includes('completion_percentage')) {
      table.decimal('completion_percentage', 5, 2).defaultTo(0).comment('Percentual assistido');
    }
    
    if (!existingColumns.includes('completed_at')) {
      table.timestamp('completed_at').nullable().comment('Quando foi completado');
    }
    
    // Dados de sessão
    if (!existingColumns.includes('watch_sessions_count')) {
      table.integer('watch_sessions_count').defaultTo(0).comment('Número de sessões de visualização');
    }
    
    if (!existingColumns.includes('total_watch_time')) {
      table.integer('total_watch_time').defaultTo(0).comment('Tempo total assistido em segundos');
    }
    
    if (!existingColumns.includes('last_watched_at')) {
      table.timestamp('last_watched_at').nullable().comment('Última vez que assistiu');
    }
    
    if (!existingColumns.includes('started_at')) {
      table.timestamp('started_at').nullable().comment('Quando começou a assistir pela primeira vez');
    }
    
    // Configurações do player
    if (!existingColumns.includes('quality')) {
      table.string('quality', 20).nullable().comment('Qualidade do vídeo (720p, 1080p, etc)');
    }
    
    if (!existingColumns.includes('playback_speed')) {
      table.decimal('playback_speed', 3, 2).defaultTo(1.0).comment('Velocidade de reprodução');
    }
    
    if (!existingColumns.includes('subtitle_language')) {
      table.string('subtitle_language', 10).nullable().comment('Idioma da legenda');
    }
    
    if (!existingColumns.includes('audio_language')) {
      table.string('audio_language', 10).nullable().comment('Idioma do áudio');
    }
    
    if (!existingColumns.includes('auto_play_enabled')) {
      table.boolean('auto_play_enabled').defaultTo(true);
    }
    
    // Dados de interação
    if (!existingColumns.includes('pauses_count')) {
      table.integer('pauses_count').defaultTo(0).comment('Número de pausas');
    }
    
    if (!existingColumns.includes('seeks_count')) {
      table.integer('seeks_count').defaultTo(0).comment('Número de buscas/pulos');
    }
    
    if (!existingColumns.includes('replay_count')) {
      table.integer('replay_count').defaultTo(0).comment('Número de vezes que reassistiu');
    }
    
    if (!existingColumns.includes('interaction_data')) {
      table.jsonb('interaction_data').nullable().comment('Dados adicionais de interação');
    }
    
    // Dados do dispositivo
    if (!existingColumns.includes('device_type')) {
      table.string('device_type', 50).defaultTo('web').comment('web, mobile, tablet, tv');
    }
    
    if (!existingColumns.includes('device_id')) {
      table.string('device_id', 255).nullable().comment('ID único do dispositivo');
    }
    
    if (!existingColumns.includes('browser')) {
      table.string('browser', 100).nullable();
    }
    
    if (!existingColumns.includes('os')) {
      table.string('os', 100).nullable();
    }
    
    if (!existingColumns.includes('ip_address')) {
      table.string('ip_address', 45).nullable();
    }
    
    if (!existingColumns.includes('location')) {
      table.string('location', 255).nullable();
    }
    
    // Dados de contexto
    if (!existingColumns.includes('course_id')) {
      table.bigInteger('course_id').unsigned().nullable();
    }
    
    if (!existingColumns.includes('module_id')) {
      table.bigInteger('module_id').unsigned().nullable();
    }
    
    if (!existingColumns.includes('lesson_id')) {
      table.bigInteger('lesson_id').unsigned().nullable();
    }
    
    if (!existingColumns.includes('class_id')) {
      table.bigInteger('class_id').unsigned().nullable();
    }
    
    if (!existingColumns.includes('institution_id')) {
      table.bigInteger('institution_id').unsigned().nullable();
    }
    
    // Controle e versionamento
    if (!existingColumns.includes('deleted')) {
      table.boolean('deleted').defaultTo(false);
    }
    
    // Timestamps modernos
    if (!existingColumns.includes('created_at')) {
      table.timestamp('created_at').defaultTo(knex.fn.now());
    }
    
    if (!existingColumns.includes('updated_at')) {
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    }
  });
  
  // Adicionar índices se não existirem
  const indices = await knex.raw(`
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename = 'viewing_status' 
    AND schemaname = 'public'
  `);
  
  const existingIndices = indices.rows.map(idx => idx.indexname);
  
  // Adicionar índices que não existem
  if (!existingIndices.includes('idx_user_completed')) {
    await knex.schema.alterTable('viewing_status', table => {
      table.index(['user_id', 'completed'], 'idx_user_completed');
    });
  }
  
  if (!existingIndices.includes('idx_user_last_watched')) {
    await knex.schema.alterTable('viewing_status', table => {
      table.index(['user_id', 'last_watched_at'], 'idx_user_last_watched');
    });
  }
  
  if (!existingIndices.includes('idx_content_type_id')) {
    await knex.schema.alterTable('viewing_status', table => {
      table.index(['content_type', 'content_id'], 'idx_content_type_id');
    });
  }
  
  if (!existingIndices.includes('idx_completion_percentage')) {
    await knex.schema.alterTable('viewing_status', table => {
      table.index(['completion_percentage'], 'idx_completion_percentage');
    });
  }
  
  // Criar trigger para atualizar completion_percentage automaticamente
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_viewing_completion_percentage()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.total_duration IS NOT NULL AND NEW.total_duration > 0 THEN
        NEW.completion_percentage = LEAST(100, (NEW.current_play_time::decimal / NEW.total_duration) * 100);
        
        -- Marcar como completo se assistiu 90% ou mais
        IF NEW.completion_percentage >= 90 AND NOT NEW.completed THEN
          NEW.completed = true;
          NEW.completed_at = NOW();
        END IF;
      END IF;
      
      -- Atualizar last_watched_at
      NEW.last_watched_at = NOW();
      
      -- Atualizar updated_at
      NEW.updated_at = NOW();
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  
  // Verificar se o trigger já existe
  const triggerExists = await knex.raw(`
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'update_viewing_status_completion'
  `);
  
  if (triggerExists.rows.length === 0) {
    await knex.raw(`
      CREATE TRIGGER update_viewing_status_completion
      BEFORE INSERT OR UPDATE OF current_play_time, total_duration ON viewing_status
      FOR EACH ROW
      EXECUTE FUNCTION update_viewing_completion_percentage();
    `);
  }
  
  // Migrar dados legados para novos campos
  await knex.raw(`
    UPDATE viewing_status
    SET 
      total_duration = runtime,
      last_watched_at = COALESCE(last_updated, date_created, NOW()),
      started_at = date_created,
      created_at = COALESCE(date_created, NOW()),
      updated_at = COALESCE(last_updated, NOW())
    WHERE 
      runtime IS NOT NULL 
      AND total_duration IS NULL;
  `);
  
  await knex.raw(`
    UPDATE viewing_status
    SET completion_percentage = 
      CASE 
        WHEN runtime > 0 AND current_play_time IS NOT NULL 
        THEN LEAST(100, (current_play_time::decimal / runtime) * 100)
        ELSE 0
      END
    WHERE 
      runtime > 0 
      AND completion_percentage = 0;
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  // Não removeremos colunas para manter compatibilidade com dados existentes
  
  // Remover triggers
  await knex.raw('DROP TRIGGER IF EXISTS update_viewing_status_completion ON viewing_status');
  await knex.raw('DROP FUNCTION IF EXISTS update_viewing_completion_percentage()');
  
  // Remover índices adicionados
  await knex.schema.alterTable('viewing_status', table => {
    table.dropIndex([], 'idx_user_completed');
    table.dropIndex([], 'idx_user_last_watched');
    table.dropIndex([], 'idx_content_type_id');
    table.dropIndex([], 'idx_completion_percentage');
  }).catch(e => console.log('Erro ao remover índices:', e));
}; 