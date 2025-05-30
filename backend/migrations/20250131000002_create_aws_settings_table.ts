import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('aws_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('access_key_id').notNullable();
    table.string('secret_access_key').notNullable(); // Encrypted
    table.string('region').notNullable().defaultTo('sa-east-1');
    table.string('s3_bucket_name');
    table.string('cloudwatch_namespace').defaultTo('Portal/Metrics');
    table.integer('update_interval').defaultTo(30);
    table.boolean('enable_real_time_updates').defaultTo(true);
    table.boolean('is_active').defaultTo(true);
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('updated_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
    
    // Índices para performance
    table.index(['is_active']);
    table.index(['region']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('aws_settings');
} 