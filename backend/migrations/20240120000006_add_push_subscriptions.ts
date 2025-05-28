import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('push_subscriptions', (table) => {
        table.increments('id').primary();
        table.uuid('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.string('endpoint').notNullable().unique();
        table.string('p256dh').notNullable(); // Public key
        table.string('auth').notNullable(); // Auth secret
        table.boolean('active').defaultTo(true);
        table.timestamp('last_used').nullable();
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('push_subscriptions');
}
