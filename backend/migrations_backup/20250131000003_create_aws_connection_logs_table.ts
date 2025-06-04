import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('aws_connection_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('aws_settings_id').references('id').inTable('aws_settings').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('region').notNullable();
    table.string('service').notNullable(); // 'cloudwatch', 's3', 'connection_test', etc.
    table.boolean('success').notNullable();
    table.text('message');
    table.text('error_details');
    table.integer('response_time_ms');
    table.string('ip_address');
    table.string('user_agent');
    table.json('request_metadata'); // Para dados adicionais como endpoint, parâmetros, etc.
    table.timestamps(true, true);
    
    // Índices para performance e consultas
    table.index(['aws_settings_id']);
    table.index(['user_id']);
    table.index(['success']);
    table.index(['service']);
    table.index(['region']);
    table.index(['created_at']);
    table.index(['success', 'created_at']); // Índice composto para dashboard
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('aws_connection_logs');
} 