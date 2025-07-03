import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('push_subscriptions', (table) => {
        table.timestamp('last_used');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('push_subscriptions', (table) => {
        table.dropColumn('last_used');
    });
} 