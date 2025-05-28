import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('notifications', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('message').notNullable();
        table.enum('type', ['info', 'warning', 'success', 'error']).notNullable();
        table.enum('category', ['academic', 'system', 'social', 'administrative']).notNullable();
        table.timestamp('sent_at').nullable();
        table.uuid('sent_by').unsigned().references('id').inTable('users');
        table.json('recipients').notNullable(); // Will store {total, read, unread, roles, specific}
        table.enum('status', ['sent', 'scheduled', 'draft', 'failed']).notNullable();
        table.timestamp('scheduled_for').nullable();
        table.enum('priority', ['low', 'medium', 'high']).notNullable();
        table.timestamps(true, true); // created_at and updated_at
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('notifications');
}
