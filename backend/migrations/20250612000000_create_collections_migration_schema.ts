import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Tabela principal de coleções (migrada do MySQL tv_show)
  await knex.schema.createTable('video_collections', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.integer('mysql_id').nullable().comment('ID original do MySQL para rastreamento');
    table.string('name', 255).notNullable();
    table.text('synopsis').nullable();
    table.string('producer', 255).nullable();
    table.date('release_date').nullable();
    table.date('contract_expiry_date').nullable();
    table.specificType('authors', 'text[]').defaultTo('{}');
    table.specificType('target_audience', 'text[]').defaultTo('{}');
    table.string('total_hours', 20).defaultTo('00:00:00');
    table.string('poster_image_url', 500).nullable();
    table.string('carousel_image_url', 500).nullable();
    table.string('ebook_file_url', 500).nullable();
    table.boolean('use_default_cover_for_videos').defaultTo(true);
    table.double('popularity').nullable();
    table.double('vote_average').nullable();
    table.integer('vote_count').nullable();
    table.string('poster_path', 255).nullable().comment('Campo legado do MySQL');
    table.string('backdrop_path', 255).nullable().comment('Campo legado do MySQL');
    table.string('total_load', 255).nullable().comment('Campo legado do MySQL');
    table.string('manual_support_path', 255).nullable().comment('Campo legado do MySQL');
    table.boolean('deleted').defaultTo(false);
    table.timestamps(true, true);
    
    table.index('mysql_id');
    table.index('name');
    table.index('producer');
    table.index(['deleted', 'popularity']);
  });

  // Tabela de vídeos por módulos
  await knex.schema.createTable('video_modules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('collection_id').notNullable().references('id').inTable('video_collections').onDelete('CASCADE');
    table.integer('module_number').notNullable();
    table.string('title', 255).notNullable();
    table.text('synopsis').notNullable();
    table.integer('release_year').notNullable();
    table.string('duration', 20).notNullable().defaultTo('00:00:00');
    table.string('education_cycle', 100).notNullable();
    table.string('poster_image_url', 500).nullable();
    table.string('video_url', 500).nullable();
    table.integer('order_in_module').notNullable().defaultTo(1);
    table.timestamps(true, true);
    
    table.index(['collection_id', 'module_number']);
    table.index(['collection_id', 'module_number', 'order_in_module']);
    table.unique(['collection_id', 'module_number', 'order_in_module']);
  });

  // Tabela de log de migração
  await knex.schema.createTable('migration_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('source_table', 50).notNullable();
    table.integer('source_id').notNullable();
    table.string('target_table', 50).notNullable();
    table.uuid('target_id').notNullable();
    table.json('migration_data').nullable();
    table.text('notes').nullable();
    table.timestamp('migrated_at').defaultTo(knex.fn.now());
    
    table.index(['source_table', 'source_id']);
    table.index('target_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('migration_log');
  await knex.schema.dropTableIfExists('video_modules');
  await knex.schema.dropTableIfExists('video_collections');
} 