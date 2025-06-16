import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Adicionando coluna type à tabela institutions...');

  // Verificar se a coluna já existe antes de tentar adicioná-la
  const hasTypeColumn = await knex.schema.hasColumn('institutions', 'type');
  
  if (!hasTypeColumn) {
    await knex.schema.alterTable('institutions', (table) => {
      table.enum('type', ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER']).notNullable().defaultTo('SCHOOL');
    });
    console.log('✅ Coluna type adicionada à tabela institutions');
  } else {
    console.log('ℹ️ Coluna type já existe na tabela institutions');
  }
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Removendo coluna type da tabela institutions...');
  
  await knex.schema.alterTable('institutions', (table) => {
    table.dropColumn('type');
  });
  
  console.log('✅ Coluna type removida da tabela institutions');
} 