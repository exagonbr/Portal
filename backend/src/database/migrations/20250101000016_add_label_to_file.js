'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function(knex) {
  // Verificar se a tabela file existe
  const hasTable = await knex.schema.hasTable('file');
  
  if (!hasTable) {
    console.log('Tabela file não existe. Pulando migração.');
    return;
  }
  
  // Verificar quais colunas já existem para não duplicar
  const columns = await knex('information_schema.columns')
    .select('column_name')
    .where({
      table_schema: 'public',
      table_name: 'file'
    });
  
  const existingColumns = columns.map(col => col.column_name);
  
  await knex.schema.alterTable('file', function(table) {
    // Adicionar coluna label se não existir
    if (!existingColumns.includes('label')) {
      table.string('label', 100).nullable().comment('Rótulo do arquivo (ex: "Com Legenda", "Sem Legenda")');
    }
    
    // Adicionar coluna is_default se não existir
    if (!existingColumns.includes('is_default')) {
      table.boolean('is_default').defaultTo(false).comment('Indica se este é o arquivo padrão para exibição');
    }
  });
  
  // Criar índices para as novas colunas
  await knex.schema.alterTable('file', function(table) {
    if (!existingColumns.includes('label')) {
      table.index('label');
    }
    
    if (!existingColumns.includes('is_default')) {
      table.index('is_default');
    }
  });
  
  console.log('Migração concluída: colunas label e is_default adicionadas à tabela file.');
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function(knex) {
  const hasTable = await knex.schema.hasTable('file');
  
  if (!hasTable) {
    console.log('Tabela file não existe. Pulando rollback.');
    return;
  }
  
  await knex.schema.alterTable('file', function(table) {
    table.dropColumn('label');
    table.dropColumn('is_default');
  });
  
  console.log('Rollback concluído: colunas label e is_default removidas da tabela file.');
}; 