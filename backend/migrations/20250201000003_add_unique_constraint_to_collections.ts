import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🔄 Adding unique constraint to collections table...');

  // Check if the constraint already exists
  const constraintExists = await knex.raw(`
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE constraint_name = 'collections_name_institution_id_unique' 
      AND table_name = 'collections'
    ) AS exists;
  `);

  if (!constraintExists.rows[0].exists) {
    await knex.schema.alterTable('collections', (table) => {
      table.unique(['name', 'institution_id'], 'collections_name_institution_id_unique');
    });
  }

  console.log('✅ Added unique constraint to collections table successfully!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Removing unique constraint from collections table...');

  await knex.schema.alterTable('collections', (table) => {
    table.dropUnique(['name', 'institution_id'], 'collections_name_institution_id_unique');
  });

  console.log('✅ Removed unique constraint from collections table successfully!');
}
