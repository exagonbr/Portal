import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Criar tabela de videos
  await knex.schema.createTable('videos', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description');
    table.string('video_url').notNullable();
    table.string('thumbnail_url');
    table.integer('duration').notNullable(); // em segundos
    table.string('quality').defaultTo('HD'); // SD, HD, FHD, 4K
    table.string('format').defaultTo('mp4'); // mp4, avi, mkv, etc
    table.bigInteger('file_size'); // em bytes
    table.string('resolution'); // 1920x1080, 1280x720, etc
    
    // Relacionamentos
    table.uuid('module_id').references('id').inTable('modules').onDelete('CASCADE');
    table.uuid('collection_id').references('id').inTable('collections').onDelete('SET NULL');
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    
    // Metadados educacionais
    table.json('education_cycle'); // nível, ciclo, série
    table.json('authors').defaultTo('[]'); // array de autores
    table.json('tags').defaultTo('[]'); // tags para busca
    table.string('subject'); // disciplina
    table.enum('difficulty_level', ['basic', 'intermediate', 'advanced']).defaultTo('basic');
    
    // Controle de acesso
    table.boolean('is_public').defaultTo(false);
    table.boolean('is_premium').defaultTo(false);
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
    
    // Estatísticas
    table.integer('views_count').defaultTo(0);
    table.integer('likes_count').defaultTo(0);
    table.decimal('rating_average', 3, 2).defaultTo(0);
    table.integer('rating_count').defaultTo(0);
    
    table.timestamps(true, true);
  });

  // Criar índices para melhor performance
  await knex.schema.alterTable('videos', (table) => {
    table.index(['module_id']);
    table.index(['collection_id']);
    table.index(['created_by']);
    table.index(['status']);
    table.index(['is_public']);
    table.index(['subject']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('videos');
} 