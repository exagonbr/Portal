import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Verificando se precisa adicionar coluna type à tabela institutions...');

  // A migração anterior já cria a tabela institutions com a coluna type
  // Esta migração não é mais necessária, mas vamos mantê-la para compatibilidade
  
  // Verificar se a tabela existe
  const hasTable = await knex.schema.hasTable('institutions');
  
  if (hasTable) {
    // Verificar se a coluna já existe
    const hasTypeColumn = await knex.schema.hasColumn('institutions', 'type');
    
    if (!hasTypeColumn) {
      await knex.schema.alterTable('institutions', (table) => {
        table.enum('type', ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER']).notNullable().defaultTo('SCHOOL');
      });
      console.log('✅ Coluna type adicionada à tabela institutions');
    } else {
      console.log('ℹ️ Coluna type já existe na tabela institutions');
    }
  } else {
    console.log('⚠️ Tabela institutions não existe ainda');
  }
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Verificando se precisa remover coluna type da tabela institutions...');
  
  const hasTable = await knex.schema.hasTable('institutions');
  
  if (hasTable) {
    const hasTypeColumn = await knex.schema.hasColumn('institutions', 'type');
    
    if (hasTypeColumn) {
      await knex.schema.alterTable('institutions', (table) => {
        table.dropColumn('type');
      });
      console.log('✅ Coluna type removida da tabela institutions');
    }
  }
}