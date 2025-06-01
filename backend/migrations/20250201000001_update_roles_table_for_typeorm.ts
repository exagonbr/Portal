import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Primeiro, limpar dados existentes da tabela roles
  await knex('roles').del();
  
  // Atualizar a tabela roles para ser compatível com a entidade TypeORM
  await knex.schema.alterTable('roles', (table) => {
    // Adicionar coluna permissions como JSONB
    table.jsonb('permissions').defaultTo('[]');
    
    // Adicionar coluna active (boolean) para substituir status
    table.boolean('active').defaultTo(true);
    
    // Remover colunas que não são usadas na entidade TypeORM
    table.dropColumn('type');
    table.dropColumn('user_count');
    table.dropColumn('status');
  });

  // Converter o enum name para usar os valores da entidade TypeORM
  await knex.raw(`
    ALTER TABLE roles 
    DROP CONSTRAINT IF EXISTS roles_name_check;
  `);
  
  await knex.raw(`
    ALTER TABLE roles 
    ADD CONSTRAINT roles_name_check 
    CHECK (name IN (
      'SYSTEM_ADMIN', 
      'INSTITUTION_MANAGER', 
      'ACADEMIC_COORDINATOR', 
      'TEACHER', 
      'STUDENT', 
      'GUARDIAN'
    ));
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('roles', (table) => {
    // Reverter as mudanças
    table.dropColumn('permissions');
    table.dropColumn('active');
    
    // Restaurar colunas originais
    table.enum('type', ['system', 'custom']).notNullable().defaultTo('system');
    table.integer('user_count').defaultTo(0);
    table.enum('status', ['active', 'inactive']).defaultTo('active');
  });
  
  // Remover constraint personalizada
  await knex.raw(`
    ALTER TABLE roles 
    DROP CONSTRAINT IF EXISTS roles_name_check;
  `);
} 