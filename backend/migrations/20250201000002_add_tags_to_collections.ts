import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🔄 Adding tags column to collections table...');

  // Add tags column if it does not exist
  const hasTagsColumn = await knex.schema.hasColumn('collections', 'tags');
  if (!hasTagsColumn) {
    await knex.schema.alterTable('collections', (table) => {
      table.specificType('tags', 'text[]').defaultTo('{}');
    });
  }

  // Create GIN index for tags if it does not exist
  const indexExists = await knex.raw(`
    SELECT to_regclass('public.idx_collections_tags') IS NOT NULL AS exists;
  `);
  if (!indexExists.rows[0].exists) {
    await knex.raw('CREATE INDEX idx_collections_tags ON collections USING gin(tags)');
  }

  console.log('✅ Added tags column to collections table successfully!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Removing tags column from collections table...');

  // Drop the index first
  await knex.raw('DROP INDEX IF EXISTS idx_collections_tags');

  // Remove the column
  await knex.schema.alterTable('collections', (table) => {
    table.dropColumn('tags');
  });

  console.log('✅ Removed tags column from collections table successfully!');
}
