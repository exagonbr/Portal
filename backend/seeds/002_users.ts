import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // This seed is now replaced by 006_extended_users.ts
  // Skip this seed to avoid conflicts
  return;
}
