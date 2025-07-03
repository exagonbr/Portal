import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Adicionando coluna type à tabela institution...');

  // Verificar se a coluna já existe antes de tentar adicioná-la
  const hasTypeColumn = await knex.schema.hasColumn('institution', 'type');
  
  if (!hasTypeColumn) {
    await knex.schema.alterTable('institution', (table) => {
      table.enum('type', ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER']).notNullable().defaultTo('SCHOOL');
    });
    console.log('✅ Coluna type adicionada à tabela institution');
  } else {
    console.log('ℹ️ Coluna type já existe na tabela institution');
  }
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Removendo coluna type da tabela institution...');
  
  await knex.schema.alterTable('institution', (table) => {
    table.dropColumn('type');
  });
  
  console.log('✅ Coluna type removida da tabela institution');
} 