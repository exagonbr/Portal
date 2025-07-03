import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Criar tabela de tv_shows (coleções de vídeos)
  await knex.schema.createTable('tv_shows', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('synopsis');
    table.text('description');
    table.string('cover_image_url');
    table.string('banner_image_url');
    table.string('trailer_url');
    
    // Metadados da série
    table.integer('total_episodes').defaultTo(0);
    table.integer('total_seasons').defaultTo(1);
    table.integer('total_duration').defaultTo(0); // em segundos
    table.date('release_date');
    table.string('genre');
    table.string('target_audience'); // infantil, juvenil, adulto, etc
    table.string('content_rating'); // livre, 10+, 12+, etc
    
    // Relacionamentos
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    
    // Metadados educacionais
    table.json('education_cycle'); // nível, ciclo, série
    table.json('subjects').defaultTo('[]'); // disciplinas abordadas
    table.json('authors').defaultTo('[]'); // autores/criadores
    table.json('tags').defaultTo('[]'); // tags para busca
    table.string('language').defaultTo('pt-BR');
    table.enum('difficulty_level', ['basic', 'intermediate', 'advanced']).defaultTo('basic');
    
    // Controle de acesso
    table.boolean('is_public').defaultTo(false);
    table.boolean('is_premium').defaultTo(false);
    table.boolean('is_featured').defaultTo(false); // destaque na plataforma
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
    
    // Estatísticas
    table.integer('views_count').defaultTo(0);
    table.integer('likes_count').defaultTo(0);
    table.integer('favorites_count').defaultTo(0);
    table.decimal('rating_average', 3, 2).defaultTo(0);
    table.integer('rating_count').defaultTo(0);
    
    // Metadados de arquivo/produção
    table.json('production_info'); // estúdio, diretor, ano, etc
    table.json('technical_specs'); // qualidade, formato, etc
    
    table.timestamps(true, true);
  });

  // Criar tabela de relacionamento entre tv_shows e videos
  await knex.schema.createTable('tv_show_videos', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tv_show_id').references('id').inTable('tv_shows').onDelete('CASCADE');
    table.uuid('video_id').references('id').inTable('videos').onDelete('CASCADE');
    table.integer('season_number').defaultTo(1);
    table.integer('episode_number').notNullable();
    table.string('episode_title');
    table.text('episode_description');
    table.integer('order_index').notNullable();
    table.timestamps(true, true);
    
    table.unique(['tv_show_id', 'season_number', 'episode_number']);
  });

  // Criar índices para melhor performance
  await knex.schema.alterTable('tv_shows', (table) => {
    table.index(['created_by']);
    table.index(['institution_id']);
    table.index(['status']);
    table.index(['is_public']);
    table.index(['is_featured']);
    table.index(['genre']);
    table.index(['created_at']);
  });

  await knex.schema.alterTable('tv_show_videos', (table) => {
    table.index(['tv_show_id']);
    table.index(['video_id']);
    table.index(['season_number']);
    table.index(['episode_number']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tv_show_videos');
  await knex.schema.dropTableIfExists('tv_shows');
} 