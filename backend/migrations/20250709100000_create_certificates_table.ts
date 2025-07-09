import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Criando tabela certificates...');

  // Verificar se a tabela já existe
  const exists = await knex.schema.hasTable('certificates');
  if (exists) {
    console.log('⚠️ Tabela certificates já existe, pulando criação.');
    return;
  }

  await knex.schema.createTable('certificates', (table) => {
    table.increments('id').primary();
    table.string('document').notNullable();
    table.string('license_code').unique().notNullable();
    table.integer('tv_show_id');
    table.string('tv_show_name');
    table.integer('user_id');
    table.decimal('score', 5, 2);
    table.string('path');
    table.boolean('recreate').defaultTo(true);
    table.timestamp('date_created').defaultTo(knex.fn.now());
    table.timestamp('last_updated').defaultTo(knex.fn.now());
    table.index(['document', 'license_code', 'user_id']);
  });

  console.log('✅ Tabela certificates criada com sucesso!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Removendo tabela certificates...');
  await knex.schema.dropTableIfExists('certificates');
  console.log('✅ Tabela certificates removida com sucesso!');
} 