'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  await knex.schema.createTable('viewing_status', function(table) {
    // Chave primária
    table.bigIncrements('id').primary();
    
    // Referências principais
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users');
    table.bigInteger('video_id').unsigned().nullable();
    table.bigInteger('tv_show_id').unsigned().nullable();
    table.bigInteger('content_id').unsigned().nullable(); // Para outros tipos de conteúdo
    table.string('content_type', 50).nullable(); // 'video', 'tv_show', 'course', 'lesson', etc.
    
    // Dados de progresso
    table.integer('current_play_time').notNullable().defaultTo(0).comment('Tempo atual em segundos');
    table.integer('total_duration').nullable().comment('Duração total em segundos');
    table.decimal('completion_percentage', 5, 2).defaultTo(0).comment('Percentual assistido');
    table.boolean('completed').defaultTo(false).comment('Se o conteúdo foi completado');
    table.timestamp('completed_at').nullable().comment('Quando foi completado');
    
    // Dados de sessão
    table.integer('watch_sessions_count').defaultTo(0).comment('Número de sessões de visualização');
    table.integer('total_watch_time').defaultTo(0).comment('Tempo total assistido em segundos');
    table.timestamp('last_watched_at').nullable().comment('Última vez que assistiu');
    table.timestamp('started_at').nullable().comment('Quando começou a assistir pela primeira vez');
    
    // Configurações do player
    table.string('quality', 20).nullable().comment('Qualidade do vídeo (720p, 1080p, etc)');
    table.decimal('playback_speed', 3, 2).defaultTo(1.0).comment('Velocidade de reprodução');
    table.string('subtitle_language', 10).nullable().comment('Idioma da legenda');
    table.string('audio_language', 10).nullable().comment('Idioma do áudio');
    table.boolean('auto_play_enabled').defaultTo(true);
    
    // Dados de interação
    table.integer('pauses_count').defaultTo(0).comment('Número de pausas');
    table.integer('seeks_count').defaultTo(0).comment('Número de buscas/pulos');
    table.integer('replay_count').defaultTo(0).comment('Número de vezes que reassistiu');
    table.jsonb('interaction_data').nullable().comment('Dados adicionais de interação');
    
    // Dados do dispositivo
    table.string('device_type', 50).defaultTo('web').comment('web, mobile, tablet, tv');
    table.string('device_id', 255).nullable().comment('ID único do dispositivo');
    table.string('browser', 100).nullable();
    table.string('os', 100).nullable();
    table.string('ip_address', 45).nullable();
    table.string('location', 255).nullable();
    
    // Dados de contexto
    table.bigInteger('course_id').unsigned().nullable();
    table.bigInteger('module_id').unsigned().nullable();
    table.bigInteger('lesson_id').unsigned().nullable();
    table.bigInteger('class_id').unsigned().nullable().references('id').inTable('classes');
    table.bigInteger('institution_id').unsigned().nullable().references('id').inTable('institutions');
    
    // Controle e versionamento
    table.bigInteger('version').defaultTo(1);
    table.boolean('deleted').defaultTo(false);
    
    // Timestamps
    table.timestamps(true, true);
    
    // Índices únicos - um registro por usuário/conteúdo
    table.unique(['user_id', 'video_id'], 'idx_user_video_unique');
    table.unique(['user_id', 'tv_show_id', 'video_id'], 'idx_user_tvshow_video_unique');
    table.unique(['user_id', 'content_type', 'content_id'], 'idx_user_content_unique');
    
    // Índices para performance
    table.index(['user_id', 'completed']);
    table.index(['user_id', 'last_watched_at']);
    table.index(['video_id']);
    table.index(['tv_show_id']);
    table.index(['content_type', 'content_id']);
    table.index(['completed']);
    table.index(['completion_percentage']);
    table.index(['last_watched_at']);
    table.index(['device_type']);
    table.index(['class_id']);
    table.index(['institution_id']);
    table.index(['created_at']);
    table.index(['updated_at']);
  });
  
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
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  
  await knex.raw(`
    CREATE TRIGGER update_viewing_status_completion
    BEFORE INSERT OR UPDATE OF current_play_time, total_duration ON viewing_status
    FOR EACH ROW
    EXECUTE FUNCTION update_viewing_completion_percentage();
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  // Remover triggers primeiro
  await knex.raw('DROP TRIGGER IF EXISTS update_viewing_status_completion ON viewing_status');
  await knex.raw('DROP FUNCTION IF EXISTS update_viewing_completion_percentage()');
  
  // Remover tabela
  await knex.schema.dropTableIfExists('viewing_status');
}; 