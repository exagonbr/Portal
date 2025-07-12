import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Criando tabela institutions...');

  // Verificar se a tabela já existe
  const exists = await knex.schema.hasTable('institutions');
  if (exists) {
    console.log('⚠️ Tabela institutions já existe, pulando criação.');
    return;
  }

  await knex.schema.createTable('institutions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('company_name');
    table.string('document');
    table.string('state');
    table.string('district');
    table.string('street');
    table.string('postal_code');
    table.string('accountable_contact');
    table.string('accountable_name');
    table.boolean('contract_disabled').defaultTo(false);
    table.date('contract_term_start');
    table.date('contract_term_end');
    table.boolean('deleted').defaultTo(false);
    table.boolean('has_library_platform').defaultTo(false);
    table.boolean('has_principal_platform').defaultTo(false);
    table.boolean('has_student_platform').defaultTo(false);
    table.string('type').defaultTo('SCHOOL');
    table.timestamps(true, true);
  });

  console.log('✅ Tabela institutions criada com sucesso!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Removendo tabela institutions...');
  await knex.schema.dropTableIfExists('institutions');
  console.log('✅ Tabela institutions removida com sucesso!');
} 