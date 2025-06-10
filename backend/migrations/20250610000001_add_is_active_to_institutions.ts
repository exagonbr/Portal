import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if the column already exists
  const hasIsActiveColumn = await knex.schema.hasColumn('institutions', 'is_active');
  
  if (!hasIsActiveColumn) {
    await knex.schema.alterTable('institutions', (table) => {
      // Add is_active column with default value based on status
      table.boolean('is_active').defaultTo(knex.raw(`CASE WHEN status = 'active' THEN true ELSE false END`));
    });
    
    // Update is_active based on status for existing records
    await knex.raw(`
      UPDATE institutions 
      SET is_active = CASE WHEN status = 'active' THEN true ELSE false END
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Check if the column exists before trying to drop it
  const hasIsActiveColumn = await knex.schema.hasColumn('institutions', 'is_active');
  
  if (hasIsActiveColumn) {
    await knex.schema.alterTable('institutions', (table) => {
      table.dropColumn('is_active');
    });
  }
}