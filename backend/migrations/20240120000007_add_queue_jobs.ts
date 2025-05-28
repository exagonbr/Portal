import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('queue_jobs', (table) => {
        table.increments('id').primary();
        table.string('type').notNullable();
        table.jsonb('data').notNullable();
        table.integer('priority').defaultTo(0);
        table.integer('attempts').defaultTo(0);
        table.integer('max_attempts').defaultTo(3);
        table.integer('delay').defaultTo(0);
        table.timestamp('created_at').notNullable();
        table.timestamp('processed_at').nullable();
        table.timestamp('completed_at').nullable();
        table.timestamp('failed_at').nullable();
        table.text('error').nullable();
        table.enum('status', ['pending', 'processing', 'completed', 'failed', 'delayed']).notNullable();
    }).then(() => {
        return knex.schema.raw(`
            CREATE INDEX idx_queue_jobs_status_priority_created 
            ON queue_jobs (status, priority DESC, created_at ASC);
            
            CREATE INDEX idx_queue_jobs_type_status 
            ON queue_jobs (type, status);
        `);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('queue_jobs');
}
