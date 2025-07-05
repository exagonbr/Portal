import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Executando migration baseada na estrutura MySQL...');

  // Criar extensão para UUID se não existir
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Tabela: answer
  await knex.schema.createTable('answer', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.timestamp('date_created').notNullable();
    table.string('deleted');
    table.string('is_correct');
    table.timestamp('last_updated');
    table.integer('question_id');
    table.text('reply');
    table.timestamps(true, true);
  });

  // Tabela: author
  await knex.schema.createTable('author', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.text('description').notNullable();
    table.string('email');
    table.string('is_active').defaultTo("b'1'");
    table.string('name').notNullable();
    table.timestamps(true, true);
  });

  // Tabela: certificate
  await knex.schema.createTable('certificate', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.timestamp('date_created').notNullable();
    table.timestamp('last_updated');
    table.string('path');
    table.integer('score');
    table.integer('tv_show_id');
    table.integer('user_id');
    table.string('document');
    table.string('license_code');
    table.string('tv_show_name');
    table.string('recreate').defaultTo("b'1'");
    table.timestamps(true, true);
  });

  // Tabela: cookie_signed
  await knex.schema.createTable('cookie_signed', (table) => {
    table.increments('id').primary();
    table.string('cookie');
    table.timestamps(true, true);
  });

  // Tabela: education_period
  await knex.schema.createTable('education_period', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('description').notNullable();
    table.string('is_active').defaultTo("b'1'");
    table.timestamps(true, true);
  });

  // Tabela: educational_stage
  await knex.schema.createTable('educational_stage', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.timestamp('date_created');
    table.string('deleted').notNullable();
    table.string('grade_1');
    table.string('grade_2');
    table.string('grade_3');
    table.string('grade_4');
    table.string('grade_5');
    table.string('grade_6');
    table.string('grade_7');
    table.string('grade_8');
    table.string('grade_9');
    table.timestamp('last_updated');
    table.string('name').notNullable();
    table.string('uuid');
    table.timestamps(true, true);
  });

  // Tabela: educational_stage_institution
  await knex.schema.createTable('educational_stage_institution', (table) => {
    table.integer('educational_stage_institions_id').notNullable();
    table.integer('institution_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: educational_stage_unit
  await knex.schema.createTable('educational_stage_unit', (table) => {
    table.integer('educational_stage_units_id').notNullable();
    table.integer('unit_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: educational_stage_user
  await knex.schema.createTable('educational_stage_user', (table) => {
    table.integer('educational_stage_users_id').notNullable();
    table.integer('user_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: file
  await knex.schema.createTable('file', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('content_type');
    table.timestamp('date_created').notNullable();
    table.string('extension');
    table.string('external_link');
    table.string('is_default');
    table.string('is_public');
    table.string('label');
    table.timestamp('last_updated').notNullable();
    table.string('local_file');
    table.string('name');
    table.string('original_filename');
    table.string('quality');
    table.string('sha256hex');
    table.integer('size');
    table.string('subtitle_label');
    table.string('subtitle_src_lang');
    table.string('is_subtitled');
    table.timestamps(true, true);
  });

  // Tabela: forgot_password
  await knex.schema.createTable('forgot_password', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('email');
    table.timestamps(true, true);
  });

  // Tabela: generic_video_genre
  await knex.schema.createTable('generic_video_genre', (table) => {
    table.integer('generic_video_genre_id').notNullable();
    table.integer('genre_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: generic_video_tag
  await knex.schema.createTable('generic_video_tag', (table) => {
    table.integer('generic_video_tags_id').notNullable();
    table.integer('tag_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: genre
  await knex.schema.createTable('genre', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.integer('api_id').notNullable();
    table.string('name').notNullable();
    table.timestamps(true, true);
  });

  // Tabela: genre_movie
  await knex.schema.createTable('genre_movie', (table) => {
    table.integer('genre_movies_id').notNullable();
    table.integer('movie_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: genre_tv_show
  await knex.schema.createTable('genre_tv_show', (table) => {
    table.integer('genre_tv_show_id').notNullable();
    table.integer('tv_show_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: institution
  await knex.schema.createTable('institution', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('accountable_contact').notNullable();
    table.string('accountable_name').notNullable();
    table.string('company_name').notNullable();
    table.string('complement');
    table.string('contract_disabled').notNullable();
    table.string('contract_invoice_num');
    table.integer('contract_num');
    table.timestamp('contract_term_end').notNullable();
    table.timestamp('contract_term_start').notNullable();
    table.timestamp('date_created');
    table.string('deleted').notNullable();
    table.string('district').notNullable();
    table.string('document').notNullable();
    table.timestamp('invoice_date');
    table.timestamp('last_updated');
    table.string('name').notNullable();
    table.string('postal_code').notNullable();
    table.string('state').notNullable();
    table.string('street').notNullable();
    table.integer('score');
    table.string('has_library_platform').notNullable();
    table.string('has_principal_platform').notNullable();
    table.string('has_student_platform').notNullable();
    table.timestamps(true, true);
  });

  // Tabela: institution_tv_show
  await knex.schema.createTable('institution_tv_show', (table) => {
    table.uuid('tv_show_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('institution_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: institution_user
  await knex.schema.createTable('institution_user', (table) => {
    table.integer('institution_users_id').notNullable();
    table.integer('user_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: movie_tag
  await knex.schema.createTable('movie_tag', (table) => {
    table.integer('movie_tags_id').notNullable();
    table.integer('tag_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: notification_queue
  await knex.schema.createTable('notification_queue', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.timestamp('date_created').notNullable();
    table.string('description');
    table.string('is_completed');
    table.timestamp('last_updated').notNullable();
    table.integer('movie_id');
    table.integer('tv_show_id');
    table.string('type');
    table.integer('video_to_play_id');
    table.timestamps(true, true);
  });

  // Tabela: profile
  await knex.schema.createTable('profile', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('avatar_color');
    table.string('is_child');
    table.string('is_deleted');
    table.string('profile_language');
    table.string('profile_name');
    table.integer('user_id');
    table.timestamps(true, true);
  });

  // Tabela: profile_target_audience
  await knex.schema.createTable('profile_target_audience', (table) => {
    table.integer('profile_target_audiences_id');
    table.integer('target_audience_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: public
  await knex.schema.createTable('public', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.integer('api_id').notNullable();
    table.string('name').notNullable();
    table.timestamps(true, true);
  });

  // Tabela: public_tv_show
  await knex.schema.createTable('public_tv_show', (table) => {
    table.integer('public_tv_show_id').notNullable();
    table.integer('tv_show_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: question
  await knex.schema.createTable('question', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.timestamp('date_created').notNullable();
    table.string('deleted');
    table.integer('file_id');
    table.timestamp('last_updated');
    table.text('test');
    table.integer('tv_show_id');
    table.integer('episode_id');
    table.timestamps(true, true);
  });

  // Tabela: report
  await knex.schema.createTable('report', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.integer('created_by_id');
    table.timestamp('date_created').notNullable();
    table.string('error_code');
    table.timestamp('last_updated').notNullable();
    table.string('resolved');
    table.integer('video_id');
    table.timestamps(true, true);
  });

  // Tabela: role
  await knex.schema.createTable('role', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('authority').unique();
    table.string('display_name');
    table.timestamps(true, true);
  });

  // Tabela: settings
  await knex.schema.createTable('settings', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('default_value');
    table.text('description');
    table.string('name');
    table.string('required');
    table.string('settings_key').notNullable();
    table.string('settings_type');
    table.string('validation_required');
    table.string('value');
    table.timestamps(true, true);
  });

  // Tabela: tag
  await knex.schema.createTable('tag', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.timestamp('date_created').notNullable();
    table.string('deleted');
    table.timestamp('last_updated').notNullable();
    table.string('name').unique();
    table.timestamps(true, true);
  });

  // Tabela: target_audience
  await knex.schema.createTable('target_audience', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('description').notNullable();
    table.string('is_active').defaultTo("b'1'");
    table.string('name').notNullable();
    table.timestamps(true, true);
  });

  // Tabela: teacher_subject
  await knex.schema.createTable('teacher_subject', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('is_child');
    table.string('is_deleted');
    table.string('name');
    table.string('uuid').unique();
    table.timestamps(true, true);
  });

  // Tabela: theme
  await knex.schema.createTable('theme', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('description').notNullable();
    table.string('is_active').defaultTo("b'1'");
    table.string('name').notNullable();
    table.timestamps(true, true);
  });

  // Tabela: tv_show
  await knex.schema.createTable('tv_show', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('api_id');
    table.integer('backdrop_image_id');
    table.string('backdrop_path');
    table.timestamp('contract_term_end').notNullable();
    table.timestamp('date_created').notNullable();
    table.string('deleted');
    table.timestamp('first_air_date').notNullable();
    table.string('imdb_id');
    table.timestamp('last_updated').notNullable();
    table.string('manual_input');
    table.integer('manual_support_id');
    table.string('manual_support_path');
    table.string('name').notNullable();
    table.string('original_language');
    table.text('overview');
    table.decimal('popularity');
    table.integer('poster_image_id');
    table.string('poster_path');
    table.text('producer');
    table.decimal('vote_average');
    table.integer('vote_count');
    table.string('total_load');
    table.timestamps(true, true);
  });

  // Tabela: tv_show_author
  await knex.schema.createTable('tv_show_author', (table) => {
    table.integer('tv_show_authors_id').notNullable();
    table.integer('author_id');
    table.increments('id').primary();
    table.timestamps(true, true);
  });

  // Tabela: tv_show_target_audience
  await knex.schema.createTable('tv_show_target_audience', (table) => {
    table.integer('tv_show_target_audiences_id');
    table.integer('target_audience_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: unit
  await knex.schema.createTable('unit', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.timestamp('date_created');
    table.string('deleted');
    table.integer('institution_id').notNullable();
    table.timestamp('last_updated');
    table.string('name').notNullable();
    table.string('institution_name');
    table.timestamps(true, true);
  });

  // Tabela: unit_class
  await knex.schema.createTable('unit_class', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.timestamp('date_created');
    table.string('deleted').notNullable();
    table.integer('institution_id').notNullable();
    table.timestamp('last_updated');
    table.string('name').notNullable();
    table.integer('unit_id').notNullable();
    table.string('institution_name');
    table.string('unit_name');
    table.timestamps(true, true);
  });

  // Tabela: user
  await knex.schema.createTable('user', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('account_expired');
    table.string('account_locked');
    table.string('address');
    table.integer('amount_of_media_entries');
    table.timestamp('date_created');
    table.string('deleted');
    table.string('email').notNullable();
    table.string('enabled');
    table.string('full_name').notNullable();
    table.string('invitation_sent');
    table.string('is_admin').notNullable();
    table.string('language');
    table.timestamp('last_updated');
    table.string('password');
    table.string('password_expired');
    table.string('pause_video_on_click');
    table.string('phone');
    table.string('reset_password').notNullable().defaultTo("b'1'");
    table.string('username').unique();
    table.string('uuid');
    table.string('is_manager').notNullable();
    table.integer('type');
    table.string('certificate_path');
    table.string('is_certified').defaultTo("b'0'");
    table.string('is_student').notNullable();
    table.string('is_teacher').notNullable();
    table.integer('institution_id');
    table.string('subject');
    table.integer('subject_data_id');
    table.timestamps(true, true);
  });

  // Tabela: user_activity
  await knex.schema.createTable('user_activity', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('browser');
    table.timestamp('date_created').notNullable();
    table.string('device');
    table.string('ip_address');
    table.timestamp('last_updated');
    table.string('operating_system');
    table.string('type');
    table.integer('user_id');
    table.integer('video_id');
    table.integer('institution_id');
    table.integer('unit_id');
    table.string('fullname');
    table.string('institution_name');
    table.string('is_certified');
    table.string('username');
    table.text('units_data');
    table.text('user_data');
    table.string('populated').notNullable();
    table.string('role');
    table.timestamps(true, true);
  });

  // Tabela: user_answer
  await knex.schema.createTable('user_answer', (table) => {
    table.integer('answer_id').notNullable();
    table.integer('question_id').notNullable();
    table.integer('version');
    table.timestamp('date_created').notNullable();
    table.string('is_correct');
    table.timestamp('last_updated');
    table.integer('score');
    table.integer('user_id');
    table.increments('id').primary();
    table.timestamps(true, true);
  });

  // Tabela: user_genre
  await knex.schema.createTable('user_genre', (table) => {
    table.integer('user_favorite_genres_id').notNullable();
    table.integer('genre_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: user_role
  await knex.schema.createTable('user_role', (table) => {
    table.uuid('role_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: user_unit
  await knex.schema.createTable('user_unit', (table) => {
    table.uuid('unit_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: user_unit_class
  await knex.schema.createTable('user_unit_class', (table) => {
    table.uuid('unit_class_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: video
  await knex.schema.createTable('video', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('api_id');
    table.timestamp('date_created');
    table.string('deleted');
    table.string('imdb_id');
    table.integer('intro_end');
    table.integer('intro_start');
    table.timestamp('last_updated');
    table.string('original_language');
    table.integer('outro_start');
    table.text('overview');
    table.decimal('popularity');
    table.integer('report_count');
    table.decimal('vote_average');
    table.integer('vote_count');
    table.string('class').notNullable();
    table.string('backdrop_path');
    table.integer('poster_image_id');
    table.string('poster_path');
    table.string('release_date');
    table.string('title');
    table.string('trailer_key');
    table.integer('backdrop_image_id');
    table.string('air_date');
    table.string('episode_string');
    table.integer('episode_number');
    table.string('name');
    table.integer('season_episode_merged');
    table.integer('season_number');
    table.integer('show_id');
    table.integer('still_image_id');
    table.string('still_path');
    table.string('duration');
    table.timestamps(true, true);
  });

  // Tabela: video_author
  await knex.schema.createTable('video_author', (table) => {
    table.integer('video_authors_id').notNullable();
    table.integer('author_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: video_education_period
  await knex.schema.createTable('video_education_period', (table) => {
    table.integer('video_periods_id').notNullable();
    table.integer('education_period_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: video_educational_stage
  await knex.schema.createTable('video_educational_stage', (table) => {
    table.integer('video_stages_id').notNullable();
    table.integer('educational_stage_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: video_file
  await knex.schema.createTable('video_file', (table) => {
    table.integer('video_files_id').notNullable();
    table.integer('file_id');
    table.increments('id').primary();
    table.timestamps(true, true);
  });

  // Tabela: video_theme
  await knex.schema.createTable('video_theme', (table) => {
    table.integer('video_themes_id').notNullable();
    table.integer('theme_id');
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps(true, true);
  });

  // Tabela: viewing_status
  await knex.schema.createTable('viewing_status', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.string('completed');
    table.integer('current_play_time').notNullable();
    table.timestamp('date_created');
    table.timestamp('last_updated');
    table.integer('profile_id');
    table.integer('runtime');
    table.integer('tv_show_id');
    table.integer('user_id');
    table.integer('video_id').notNullable();
    table.timestamps(true, true);
  });

  // Tabela: watchlist_entry
  await knex.schema.createTable('watchlist_entry', (table) => {
    table.increments('id').primary();
    table.integer('version');
    table.timestamp('date_created');
    table.string('is_deleted').notNullable();
    table.timestamp('last_updated');
    table.integer('profile_id').notNullable();
    table.integer('tv_show_id');
    table.integer('user_id').notNullable();
    table.integer('video_id');
    table.timestamps(true, true);
  });

  console.log('✅ Migration MySQL baseada executada com sucesso!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Revertendo migration baseada no MySQL...');
  
  await knex.schema.dropTableIfExists('watchlist_entry');
  await knex.schema.dropTableIfExists('viewing_status');
  await knex.schema.dropTableIfExists('video_theme');
  await knex.schema.dropTableIfExists('video_file');
  await knex.schema.dropTableIfExists('video_educational_stage');
  await knex.schema.dropTableIfExists('video_education_period');
  await knex.schema.dropTableIfExists('video_author');
  await knex.schema.dropTableIfExists('video');
  await knex.schema.dropTableIfExists('user_unit_class');
  await knex.schema.dropTableIfExists('user_unit');
  await knex.schema.dropTableIfExists('user_role');
  await knex.schema.dropTableIfExists('user_genre');
  await knex.schema.dropTableIfExists('user_answer');
  await knex.schema.dropTableIfExists('user_activity');
  await knex.schema.dropTableIfExists('user');
  await knex.schema.dropTableIfExists('unit_class');
  await knex.schema.dropTableIfExists('unit');
  await knex.schema.dropTableIfExists('tv_show_target_audience');
  await knex.schema.dropTableIfExists('tv_show_author');
  await knex.schema.dropTableIfExists('tv_show');
  await knex.schema.dropTableIfExists('theme');
  await knex.schema.dropTableIfExists('teacher_subject');
  await knex.schema.dropTableIfExists('target_audience');
  await knex.schema.dropTableIfExists('tag');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('role');
  await knex.schema.dropTableIfExists('report');
  await knex.schema.dropTableIfExists('question');
  await knex.schema.dropTableIfExists('public_tv_show');
  await knex.schema.dropTableIfExists('public');
  await knex.schema.dropTableIfExists('profile_target_audience');
  await knex.schema.dropTableIfExists('profile');
  await knex.schema.dropTableIfExists('notification_queue');
  await knex.schema.dropTableIfExists('movie_tag');
  await knex.schema.dropTableIfExists('institution_user');
  await knex.schema.dropTableIfExists('institution_tv_show');
  await knex.schema.dropTableIfExists('institution');
  await knex.schema.dropTableIfExists('genre_tv_show');
  await knex.schema.dropTableIfExists('genre_movie');
  await knex.schema.dropTableIfExists('genre');
  await knex.schema.dropTableIfExists('generic_video_tag');
  await knex.schema.dropTableIfExists('generic_video_genre');
  await knex.schema.dropTableIfExists('forgot_password');
  await knex.schema.dropTableIfExists('file');
  await knex.schema.dropTableIfExists('educational_stage_user');
  await knex.schema.dropTableIfExists('educational_stage_unit');
  await knex.schema.dropTableIfExists('educational_stage_institution');
  await knex.schema.dropTableIfExists('educational_stage');
  await knex.schema.dropTableIfExists('education_period');
  await knex.schema.dropTableIfExists('cookie_signed');
  await knex.schema.dropTableIfExists('certificate');
  await knex.schema.dropTableIfExists('author');
  await knex.schema.dropTableIfExists('answer');
  
  console.log('✅ Migration revertida com sucesso!');
}
