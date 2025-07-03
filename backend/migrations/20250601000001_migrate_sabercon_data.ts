import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Criar tabelas de mapeamento temporárias para preservar IDs originais
  const hasMappingTable = await knex.schema.hasTable('sabercon_migration_mapping');
  if (!hasMappingTable) {
    await knex.schema.createTable('sabercon_migration_mapping', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('table_name').notNullable();
      table.bigInteger('original_id').notNullable();
      table.uuid('new_id').notNullable();
      table.timestamps(true, true);
      table.unique(['table_name', 'original_id']);
    });
  }

  // 2. Criar/ajustar tabela de autores (mapeamento de author)
  const hasAuthorsTable = await knex.schema.hasTable('authors');
  if (!hasAuthorsTable) {
    await knex.schema.createTable('authors', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.string('email');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  } else {
    // Se a tabela já existe, verificar e adicionar campos que podem estar faltando
    const hasDescription = await knex.schema.hasColumn('authors', 'description');
    
    await knex.schema.alterTable('authors', (table) => {
      if (!hasDescription) {
        table.text('description');
      }
    });
  }

  // 3. Criar tabela de gêneros (mapeamento de genre)
  const hasGenresTable = await knex.schema.hasTable('genres');
  if (!hasGenresTable) {
    await knex.schema.createTable('genres', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.integer('api_id');
      table.text('description');
      table.timestamps(true, true);
    });
  }

  // 4. Criar tabela de tags (mapeamento de tag)
  const hasTagsTable = await knex.schema.hasTable('tags');
  if (!hasTagsTable) {
    await knex.schema.createTable('tags', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 5. Criar tabela de temas (mapeamento de theme)
  const hasThemesTable = await knex.schema.hasTable('themes');
  if (!hasThemesTable) {
    await knex.schema.createTable('themes', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 6. Criar tabela de público-alvo (mapeamento de target_audience)
  const hasTargetAudiencesTable = await knex.schema.hasTable('target_audiences');
  if (!hasTargetAudiencesTable) {
    await knex.schema.createTable('target_audiences', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 7. Criar tabela de períodos educacionais (mapeamento de education_period)
  const hasEducationPeriodsTable = await knex.schema.hasTable('education_periods');
  if (!hasEducationPeriodsTable) {
    await knex.schema.createTable('education_periods', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 8. Estender tabela de usuários para incluir campos do Sabercon
  const hasSaberconIdUsers = await knex.schema.hasColumn('users', 'sabercon_id');
  if (!hasSaberconIdUsers) {
    await knex.schema.alterTable('users', (table) => {
      table.bigInteger('sabercon_id').unique();
      table.boolean('account_expired').defaultTo(false);
      table.boolean('account_locked').defaultTo(false);
      table.integer('amount_of_media_entries').defaultTo(0);
      table.boolean('invitation_sent').defaultTo(false);
      table.boolean('is_admin').defaultTo(false);
      table.boolean('password_expired').defaultTo(false);
      table.boolean('pause_video_on_click').defaultTo(true);
      table.boolean('reset_password').defaultTo(false);
      table.boolean('is_manager').defaultTo(false);
      table.boolean('is_student').defaultTo(false);
      table.boolean('is_teacher').defaultTo(false);
      table.boolean('is_certified').defaultTo(false);
      table.string('certificate_path');
      table.string('subject');
      table.integer('type');
      table.string('username');
      table.string('language').defaultTo('pt');
    });
  }

  // 9. Estender tabela de instituições para incluir campos do Sabercon
  const hasSaberconIdInstitutions = await knex.schema.hasColumn('institutions', 'sabercon_id');
  if (!hasSaberconIdInstitutions) {
    await knex.schema.alterTable('institutions', (table) => {
      table.bigInteger('sabercon_id').unique();
      table.string('accountable_contact');
      table.string('accountable_name');
      table.string('company_name');
      table.string('complement');
      table.boolean('contract_disabled').defaultTo(false);
      table.string('contract_invoice_num');
      table.bigInteger('contract_num');
      table.timestamp('contract_term_end');
      table.timestamp('contract_term_start');
      table.string('district');
      table.string('document');
      table.timestamp('invoice_date');
      table.string('postal_code');
      table.integer('score');
      table.boolean('has_library_platform').defaultTo(false);
      table.boolean('has_principal_platform').defaultTo(false);
      table.boolean('has_student_platform').defaultTo(false);
    });
  }

  // 10. Criar tabela de unidades escolares (mapeamento de unit)
  const hasSchoolUnitsTable = await knex.schema.hasTable('school_units');
  if (!hasSchoolUnitsTable) {
    await knex.schema.createTable('school_units', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.string('name').notNullable();
      table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
      table.string('institution_name');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 11. Criar tabela de turmas escolares (mapeamento de unit_class)
  const hasSchoolClassesTable = await knex.schema.hasTable('school_classes');
  if (!hasSchoolClassesTable) {
    await knex.schema.createTable('school_classes', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.string('name').notNullable();
      table.uuid('school_unit_id').references('id').inTable('school_units').onDelete('CASCADE');
      table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
      table.string('institution_name');
      table.string('unit_name');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 12. Criar tabela de estágios educacionais (mapeamento de educational_stage)
  const hasEducationalStagesTable = await knex.schema.hasTable('educational_stages');
  if (!hasEducationalStagesTable) {
    await knex.schema.createTable('educational_stages', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.string('name').notNullable();
      table.string('uuid');
      table.boolean('grade_1').defaultTo(false);
      table.boolean('grade_2').defaultTo(false);
      table.boolean('grade_3').defaultTo(false);
      table.boolean('grade_4').defaultTo(false);
      table.boolean('grade_5').defaultTo(false);
      table.boolean('grade_6').defaultTo(false);
      table.boolean('grade_7').defaultTo(false);
      table.boolean('grade_8').defaultTo(false);
      table.boolean('grade_9').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 13. Criar tabela de perfis (mapeamento de profile)
  const hasUserProfilesTable = await knex.schema.hasTable('user_profiles');
  if (!hasUserProfilesTable) {
    await knex.schema.createTable('user_profiles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.string('profile_name').notNullable();
      table.string('avatar_color');
      table.boolean('is_child').defaultTo(false);
      table.string('profile_language').defaultTo('pt');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 14. Ajustar tabela de arquivos existente para incluir campos do Sabercon
  const hasFilesTable = await knex.schema.hasTable('files');
  if (hasFilesTable) {
    // Adicionar campos específicos do Sabercon à tabela files existente
    const hasSaberconIdFiles = await knex.schema.hasColumn('files', 'sabercon_id');
    if (!hasSaberconIdFiles) {
      await knex.schema.alterTable('files', (table) => {
        table.bigInteger('sabercon_id').unique();
        table.string('label');
        table.string('external_link');
        table.string('sha256hex', 64);
        table.string('quality', 4);
        table.boolean('is_default').defaultTo(false);
        table.boolean('is_public').defaultTo(false);
        table.boolean('is_subtitled').defaultTo(false);
        table.string('subtitle_label');
        table.string('subtitle_src_lang');
      });
    }
  } else {
    // Se por algum motivo a tabela files não existir, criar como media_files
    await knex.schema.createTable('files', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.string('name');
      table.string('label');
      table.string('content_type');
      table.string('extension');
      table.string('original_filename');
      table.string('local_file');
      table.string('external_link');
      table.bigInteger('size');
      table.string('sha256hex', 64);
      table.string('quality', 4);
      table.boolean('is_default').defaultTo(false);
      table.boolean('is_public').defaultTo(false);
      table.boolean('is_subtitled').defaultTo(false);
      table.string('subtitle_label');
      table.string('subtitle_src_lang');
      table.timestamps(true, true);
    });
  }

  // 15. Criar tabela de shows/séries (mapeamento de tv_show)
  const hasTvShowsTable = await knex.schema.hasTable('tv_shows');
  if (!hasTvShowsTable) {
    await knex.schema.createTable('tv_shows', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.string('name').notNullable();
      table.string('api_id');
      table.string('imdb_id');
      table.text('overview');
      table.string('original_language');
      table.double('popularity');
      table.double('vote_average');
      table.integer('vote_count');
      table.timestamp('first_air_date');
      table.timestamp('contract_term_end');
      table.string('backdrop_path');
      table.string('poster_path');
      table.uuid('backdrop_image_id').references('id').inTable('files').onDelete('SET NULL');
      table.uuid('poster_image_id').references('id').inTable('files').onDelete('SET NULL');
      table.text('producer');
      table.string('total_load');
      table.boolean('manual_input').defaultTo(false);
      table.string('manual_support_path');
      table.uuid('manual_support_id').references('id').inTable('files').onDelete('SET NULL');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 16. Estender tabela de vídeos para incluir campos do Sabercon
  const hasSaberconIdVideos = await knex.schema.hasColumn('videos', 'sabercon_id');
  if (!hasSaberconIdVideos) {
    await knex.schema.alterTable('videos', (table) => {
      table.bigInteger('sabercon_id').unique();
      table.string('api_id');
      table.string('imdb_id');
      table.string('class');
      table.integer('intro_start');
      table.integer('intro_end');
      table.integer('outro_start');
      table.string('original_language');
      table.double('popularity');
      table.double('vote_average');
      table.integer('vote_count');
      table.integer('report_count').defaultTo(0);
      table.text('overview');
      
      // Campos para filmes
      table.string('backdrop_path');
      table.string('poster_path');
      table.string('release_date');
      table.string('title');
      table.string('trailer_key');
      table.uuid('backdrop_image_id').references('id').inTable('files').onDelete('SET NULL');
      table.uuid('poster_image_id').references('id').inTable('files').onDelete('SET NULL');
      
      // Campos para episódios
      table.string('air_date');
      table.string('episode_string');
      table.integer('episode_number');
      table.integer('season_number');
      table.integer('season_episode_merged');
      table.uuid('show_id').references('id').inTable('tv_shows').onDelete('CASCADE');
      table.string('still_path');
      table.uuid('still_image_id').references('id').inTable('files').onDelete('SET NULL');
    });
  }

  // 17. Criar tabela de questionários (mapeamento de question)
  const hasQuestionsTable = await knex.schema.hasTable('questions');
  if (!hasQuestionsTable) {
    await knex.schema.createTable('questions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.text('test').notNullable();
      table.uuid('tv_show_id').references('id').inTable('tv_shows').onDelete('CASCADE');
      table.uuid('episode_id').references('id').inTable('videos').onDelete('CASCADE');
      table.uuid('file_id').references('id').inTable('files').onDelete('SET NULL');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 18. Criar tabela de respostas (mapeamento de answer)
  const hasQuestionAnswersTable = await knex.schema.hasTable('question_answers');
  if (!hasQuestionAnswersTable) {
    await knex.schema.createTable('question_answers', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.text('reply').notNullable();
      table.boolean('is_correct').defaultTo(false);
      table.uuid('question_id').references('id').inTable('questions').onDelete('CASCADE');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 19. Criar tabela de certificados (mapeamento de certificate)
  const hasCertificatesTable = await knex.schema.hasTable('certificates');
  if (!hasCertificatesTable) {
    await knex.schema.createTable('certificates', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.string('path');
      table.string('document');
      table.string('license_code');
      table.string('tv_show_name');
      table.bigInteger('score');
      table.boolean('recreate').defaultTo(false);
      table.uuid('tv_show_id').references('id').inTable('tv_shows').onDelete('SET NULL');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamps(true, true);
    });
  }

  // 20. Criar tabela de status de visualização (mapeamento de viewing_status)
  const hasViewingStatusesTable = await knex.schema.hasTable('viewing_statuses');
  if (!hasViewingStatusesTable) {
    await knex.schema.createTable('viewing_statuses', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.boolean('completed').defaultTo(false);
      table.integer('current_play_time').defaultTo(0);
      table.integer('runtime');
      table.uuid('profile_id').references('id').inTable('user_profiles').onDelete('CASCADE');
      table.uuid('tv_show_id').references('id').inTable('tv_shows').onDelete('SET NULL');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('video_id').references('id').inTable('videos').onDelete('CASCADE');
      table.timestamps(true, true);
    });
  }

  // 21. Criar tabela de lista de observação (mapeamento de watchlist_entry)
  const hasWatchlistEntriesTable = await knex.schema.hasTable('watchlist_entries');
  if (!hasWatchlistEntriesTable) {
    await knex.schema.createTable('watchlist_entries', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.uuid('profile_id').references('id').inTable('user_profiles').onDelete('CASCADE');
      table.uuid('tv_show_id').references('id').inTable('tv_shows').onDelete('SET NULL');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('video_id').references('id').inTable('videos').onDelete('SET NULL');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 22. Criar tabelas de relacionamento many-to-many

  // Relacionamento entre vídeos e arquivos
  const hasVideoFilesTable = await knex.schema.hasTable('video_files');
  if (!hasVideoFilesTable) {
    await knex.schema.createTable('video_files', (table) => {
      table.uuid('video_id').references('id').inTable('videos').onDelete('CASCADE');
      table.uuid('file_id').references('id').inTable('files').onDelete('CASCADE');
      table.primary(['video_id', 'file_id']);
      table.timestamps(true, true);
    });
  }

  // Relacionamento entre vídeos e autores
  const hasVideoAuthorsTable = await knex.schema.hasTable('video_authors');
  if (!hasVideoAuthorsTable) {
    await knex.schema.createTable('video_authors', (table) => {
      table.uuid('video_id').references('id').inTable('videos').onDelete('CASCADE');
      table.uuid('author_id').references('id').inTable('authors').onDelete('CASCADE');
      table.primary(['video_id', 'author_id']);
      table.timestamps(true, true);
    });
  }

  // Relacionamento entre vídeos e temas
  const hasVideoThemesTable = await knex.schema.hasTable('video_themes');
  if (!hasVideoThemesTable) {
    await knex.schema.createTable('video_themes', (table) => {
      table.uuid('video_id').references('id').inTable('videos').onDelete('CASCADE');
      table.uuid('theme_id').references('id').inTable('themes').onDelete('CASCADE');
      table.primary(['video_id', 'theme_id']);
      table.timestamps(true, true);
    });
  }

  // Relacionamento entre vídeos e estágios educacionais
  const hasVideoEducationalStagesTable = await knex.schema.hasTable('video_educational_stages');
  if (!hasVideoEducationalStagesTable) {
    await knex.schema.createTable('video_educational_stages', (table) => {
      table.uuid('video_id').references('id').inTable('videos').onDelete('CASCADE');
      table.uuid('educational_stage_id').references('id').inTable('educational_stages').onDelete('CASCADE');
      table.primary(['video_id', 'educational_stage_id']);
      table.timestamps(true, true);
    });
  }

  // Relacionamento entre vídeos e períodos educacionais
  const hasVideoEducationPeriodsTable = await knex.schema.hasTable('video_education_periods');
  if (!hasVideoEducationPeriodsTable) {
    await knex.schema.createTable('video_education_periods', (table) => {
      table.uuid('video_id').references('id').inTable('videos').onDelete('CASCADE');
      table.uuid('education_period_id').references('id').inTable('education_periods').onDelete('CASCADE');
      table.primary(['video_id', 'education_period_id']);
      table.timestamps(true, true);
    });
  }

  // Relacionamento entre TV shows e autores
  const hasTvShowAuthorsTable = await knex.schema.hasTable('tv_show_authors');
  if (!hasTvShowAuthorsTable) {
    await knex.schema.createTable('tv_show_authors', (table) => {
      table.uuid('tv_show_id').references('id').inTable('tv_shows').onDelete('CASCADE');
      table.uuid('author_id').references('id').inTable('authors').onDelete('CASCADE');
      table.primary(['tv_show_id', 'author_id']);
      table.timestamps(true, true);
    });
  }

  // Relacionamento entre TV shows e público-alvo
  const hasTvShowTargetAudiencesTable = await knex.schema.hasTable('tv_show_target_audiences');
  if (!hasTvShowTargetAudiencesTable) {
    await knex.schema.createTable('tv_show_target_audiences', (table) => {
      table.uuid('tv_show_id').references('id').inTable('tv_shows').onDelete('CASCADE');
      table.uuid('target_audience_id').references('id').inTable('target_audiences').onDelete('CASCADE');
      table.primary(['tv_show_id', 'target_audience_id']);
      table.timestamps(true, true);
    });
  }

  // Relacionamento entre instituições e TV shows
  const hasInstitutionTvShowsTable = await knex.schema.hasTable('institution_tv_shows');
  if (!hasInstitutionTvShowsTable) {
    await knex.schema.createTable('institution_tv_shows', (table) => {
      table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
      table.uuid('tv_show_id').references('id').inTable('tv_shows').onDelete('CASCADE');
      table.primary(['institution_id', 'tv_show_id']);
      table.timestamps(true, true);
    });
  }

  // Relacionamento entre usuários e respostas
  const hasUserQuestionAnswersTable = await knex.schema.hasTable('user_question_answers');
  if (!hasUserQuestionAnswersTable) {
    await knex.schema.createTable('user_question_answers', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.bigInteger('sabercon_id').unique();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('question_id').references('id').inTable('questions').onDelete('CASCADE');
      table.uuid('answer_id').references('id').inTable('question_answers').onDelete('CASCADE');
      table.boolean('is_correct');
      table.bigInteger('score');
      table.timestamps(true, true);
    });
  }

  // Relacionamento entre perfis e público-alvo
  const hasProfileTargetAudiencesTable = await knex.schema.hasTable('profile_target_audiences');
  if (!hasProfileTargetAudiencesTable) {
    await knex.schema.createTable('profile_target_audiences', (table) => {
      table.uuid('profile_id').references('id').inTable('user_profiles').onDelete('CASCADE');
      table.uuid('target_audience_id').references('id').inTable('target_audiences').onDelete('CASCADE');
      table.primary(['profile_id', 'target_audience_id']);
      table.timestamps(true, true);
    });
  }

  // Relacionamento entre usuários e unidades
  const hasUserSchoolUnitsTable = await knex.schema.hasTable('user_school_units');
  if (!hasUserSchoolUnitsTable) {
    await knex.schema.createTable('user_school_units', (table) => {
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('school_unit_id').references('id').inTable('school_units').onDelete('CASCADE');
      table.primary(['user_id', 'school_unit_id']);
      table.timestamps(true, true);
    });
  }

  // Relacionamento entre usuários e turmas
  const hasUserSchoolClassesTable = await knex.schema.hasTable('user_school_classes');
  if (!hasUserSchoolClassesTable) {
    await knex.schema.createTable('user_school_classes', (table) => {
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('school_class_id').references('id').inTable('school_classes').onDelete('CASCADE');
      table.primary(['user_id', 'school_class_id']);
      table.timestamps(true, true);
    });
  }

  // Criar índices para melhor performance apenas se as colunas foram adicionadas
  if (!hasSaberconIdUsers) {
    await knex.schema.alterTable('users', (table) => {
      table.index(['sabercon_id']);
      table.index(['is_student']);
      table.index(['is_teacher']);
      table.index(['is_admin']);
    });
  }

  if (!hasSaberconIdInstitutions) {
    await knex.schema.alterTable('institutions', (table) => {
      table.index(['sabercon_id']);
    });
  }

  if (!hasSaberconIdVideos) {
    await knex.schema.alterTable('videos', (table) => {
      table.index(['sabercon_id']);
      table.index(['show_id']);
      table.index(['class']);
    });
  }

  console.log('Estrutura de migração do Sabercon criada com sucesso!');
}

export async function down(knex: Knex): Promise<void> {
  // Remover tabelas de relacionamento primeiro
  await knex.schema.dropTableIfExists('user_school_classes');
  await knex.schema.dropTableIfExists('user_school_units');
  await knex.schema.dropTableIfExists('profile_target_audiences');
  await knex.schema.dropTableIfExists('user_question_answers');
  await knex.schema.dropTableIfExists('institution_tv_shows');
  await knex.schema.dropTableIfExists('tv_show_target_audiences');
  await knex.schema.dropTableIfExists('tv_show_authors');
  await knex.schema.dropTableIfExists('video_education_periods');
  await knex.schema.dropTableIfExists('video_educational_stages');
  await knex.schema.dropTableIfExists('video_themes');
  await knex.schema.dropTableIfExists('video_authors');
  await knex.schema.dropTableIfExists('video_files');
  
  // Remover tabelas principais criadas por esta migração
  await knex.schema.dropTableIfExists('watchlist_entries');
  await knex.schema.dropTableIfExists('viewing_statuses');
  await knex.schema.dropTableIfExists('certificates');
  await knex.schema.dropTableIfExists('question_answers');
  await knex.schema.dropTableIfExists('questions');
  await knex.schema.dropTableIfExists('tv_shows');
  await knex.schema.dropTableIfExists('user_profiles');
  await knex.schema.dropTableIfExists('educational_stages');
  await knex.schema.dropTableIfExists('school_classes');
  await knex.schema.dropTableIfExists('school_units');
  await knex.schema.dropTableIfExists('education_periods');
  await knex.schema.dropTableIfExists('target_audiences');
  await knex.schema.dropTableIfExists('themes');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('genres');
  
  // Verificar se a tabela authors já existia antes desta migração
  // Se só tem os campos básicos (sem description), foi criada por migração anterior
  // Se tem description, foi criada por esta migração
  const hasAuthorsTable = await knex.schema.hasTable('authors');
  if (hasAuthorsTable) {
    const hasDescription = await knex.schema.hasColumn('authors', 'description');
    if (hasDescription) {
      // Se tem description, remover apenas este campo (tabela existia antes)
      await knex.schema.alterTable('authors', (table) => {
        table.dropColumn('description');
      });
    } else {
      // Se não tem description, foi criada por esta migração
      await knex.schema.dropTableIfExists('authors');
    }
  }
  
  await knex.schema.dropTableIfExists('sabercon_migration_mapping');

  // Remover colunas adicionadas às tabelas existentes
  const hasUsersTable = await knex.schema.hasTable('users');
  if (hasUsersTable) {
    const hasSaberconId = await knex.schema.hasColumn('users', 'sabercon_id');
    if (hasSaberconId) {
      await knex.schema.alterTable('users', (table) => {
        table.dropColumn('sabercon_id');
        table.dropColumn('account_expired');
        table.dropColumn('account_locked');
        table.dropColumn('amount_of_media_entries');
        table.dropColumn('invitation_sent');
        table.dropColumn('is_admin');
        table.dropColumn('password_expired');
        table.dropColumn('pause_video_on_click');
        table.dropColumn('reset_password');
        table.dropColumn('is_manager');
        table.dropColumn('is_student');
        table.dropColumn('is_teacher');
        table.dropColumn('is_certified');
        table.dropColumn('certificate_path');
        table.dropColumn('subject');
        table.dropColumn('type');
        table.dropColumn('username');
        table.dropColumn('language');
      });
    }
  }

  const hasInstitutionsTable = await knex.schema.hasTable('institutions');
  if (hasInstitutionsTable) {
    const hasSaberconId = await knex.schema.hasColumn('institutions', 'sabercon_id');
    if (hasSaberconId) {
      await knex.schema.alterTable('institutions', (table) => {
        table.dropColumn('sabercon_id');
        table.dropColumn('accountable_contact');
        table.dropColumn('accountable_name');
        table.dropColumn('company_name');
        table.dropColumn('complement');
        table.dropColumn('contract_disabled');
        table.dropColumn('contract_invoice_num');
        table.dropColumn('contract_num');
        table.dropColumn('contract_term_end');
        table.dropColumn('contract_term_start');
        table.dropColumn('district');
        table.dropColumn('document');
        table.dropColumn('invoice_date');
        table.dropColumn('postal_code');
        table.dropColumn('score');
        table.dropColumn('has_library_platform');
        table.dropColumn('has_principal_platform');
        table.dropColumn('has_student_platform');
      });
    }
  }

  const hasVideosTable = await knex.schema.hasTable('videos');
  if (hasVideosTable) {
    const hasSaberconId = await knex.schema.hasColumn('videos', 'sabercon_id');
    if (hasSaberconId) {
      await knex.schema.alterTable('videos', (table) => {
        table.dropColumn('sabercon_id');
        table.dropColumn('api_id');
        table.dropColumn('imdb_id');
        table.dropColumn('class');
        table.dropColumn('intro_start');
        table.dropColumn('intro_end');
        table.dropColumn('outro_start');
        table.dropColumn('original_language');
        table.dropColumn('popularity');
        table.dropColumn('vote_average');
        table.dropColumn('vote_count');
        table.dropColumn('report_count');
        table.dropColumn('overview');
        table.dropColumn('backdrop_path');
        table.dropColumn('poster_path');
        table.dropColumn('release_date');
        table.dropColumn('title');
        table.dropColumn('trailer_key');
        table.dropColumn('backdrop_image_id');
        table.dropColumn('poster_image_id');
        table.dropColumn('air_date');
        table.dropColumn('episode_string');
        table.dropColumn('episode_number');
        table.dropColumn('season_number');
        table.dropColumn('season_episode_merged');
        table.dropColumn('show_id');
        table.dropColumn('still_path');
        table.dropColumn('still_image_id');
      });
    }
  }

  // Remover colunas adicionadas à tabela files (mas não dropar a tabela)
  const hasFilesTable = await knex.schema.hasTable('files');
  if (hasFilesTable) {
    const hasSaberconId = await knex.schema.hasColumn('files', 'sabercon_id');
    if (hasSaberconId) {
      await knex.schema.alterTable('files', (table) => {
        table.dropColumn('sabercon_id');
        table.dropColumn('label');
        table.dropColumn('external_link');
        table.dropColumn('sha256hex');
        table.dropColumn('quality');
        table.dropColumn('is_default');
        table.dropColumn('is_public');
        table.dropColumn('is_subtitled');
        table.dropColumn('subtitle_label');
        table.dropColumn('subtitle_src_lang');
      });
    }
  }
} 