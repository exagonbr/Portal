import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('lessons', (table) => {
    table.string('id').primary();
    table.string('title').notNullable();
    table.enum('type', ['video', 'reading', 'quiz', 'assignment']).notNullable();
    table.string('duration');
    table.integer('xp_reward').defaultTo(0);
    table.boolean('is_completed').defaultTo(false);
    table.text('content');
    table.string('video_url');
    table.string('module_id').notNullable();
    table.integer('order').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    // Índices
    table.index(['title']);
    table.index(['type']);
    table.index(['module_id']);
    table.index(['order']);
    table.index(['is_active']);
    
    // Foreign key
    table.foreign('module_id').references('id').inTable('modules');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('lessons');
}