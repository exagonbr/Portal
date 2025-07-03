import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Corrigindo estrutura da tabela institutions...');

  // Verificar se a tabela institutions existe
  const hasInstitutionsTable = await knex.schema.hasTable('institutions');
  
  if (!hasInstitutionsTable) {
    console.log('📦 Criando tabela institutions...');
    await knex.schema.createTable('institutions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('code').unique().notNullable();
      table.enum('type', ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER', 'PUBLIC', 'PRIVATE', 'MIXED']).notNullable().defaultTo('SCHOOL');
      table.text('description').nullable();
      table.string('email').nullable();
      table.string('phone').nullable();
      table.string('website').nullable();
      table.string('address').nullable();
      table.string('city').nullable();
      table.string('state').nullable();
      table.string('zip_code').nullable();
      table.string('logo_url').nullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
    console.log('✅ Tabela institutions criada');
  } else {
    console.log('🔧 Atualizando estrutura da tabela institutions...');
    
    // Verificar e adicionar campos que podem estar faltando
    const columns = await knex('information_schema.columns')
      .where('table_name', 'institutions')
      .andWhere('table_schema', 'public')
      .select('column_name');
    
    const existingColumns = columns.map(col => col.column_name);
    
    await knex.schema.alterTable('institutions', (table) => {
      // Adicionar campos que podem estar faltando
      if (!existingColumns.includes('code')) {
        table.string('code').unique().notNullable();
      }
      
      if (!existingColumns.includes('email')) {
        table.string('email').nullable();
      }
      
      if (!existingColumns.includes('phone')) {
        table.string('phone').nullable();
      }
      
      if (!existingColumns.includes('website')) {
        table.string('website').nullable();
      }
      
      if (!existingColumns.includes('address')) {
        table.string('address').nullable();
      }
      
      if (!existingColumns.includes('city')) {
        table.string('city').nullable();
      }
      
      if (!existingColumns.includes('state')) {
        table.string('state').nullable();
      }
      
      if (!existingColumns.includes('zip_code')) {
        table.string('zip_code').nullable();
      }
      
      if (!existingColumns.includes('logo_url')) {
        table.string('logo_url').nullable();
      }
      
      if (!existingColumns.includes('is_active')) {
        table.boolean('is_active').defaultTo(true);
      }
    });
    
    // Verificar se o tipo está correto
    const hasTypeColumn = await knex.schema.hasColumn('institutions', 'type');
    if (hasTypeColumn) {
      // Atualizar enum do type para incluir todos os valores possíveis
      await knex.raw(`
        ALTER TABLE institutions 
        DROP CONSTRAINT IF EXISTS institutions_type_check;
      `);
      
      await knex.raw(`
        ALTER TABLE institutions 
        ADD CONSTRAINT institutions_type_check 
        CHECK (type IN ('SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER', 'PUBLIC', 'PRIVATE', 'MIXED'));
      `);
    } else {
      await knex.schema.alterTable('institutions', (table) => {
        table.enum('type', ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER', 'PUBLIC', 'PRIVATE', 'MIXED']).notNullable().defaultTo('SCHOOL');
      });
    }
    
    console.log('✅ Estrutura da tabela institutions atualizada');
  }

  // Verificar se há dados na tabela e criar uma instituição padrão se estiver vazia
  const institutionCount = await knex('institutions').count('* as count').first();
  
  if (institutionCount && parseInt(institutionCount.count as string) === 0) {
    console.log('📝 Criando instituição padrão...');
    await knex('institutions').insert({
      id: knex.raw('gen_random_uuid()'),
      name: 'Instituição Padrão',
      code: 'DEFAULT',
      type: 'SCHOOL',
      description: 'Instituição padrão criada automaticamente',
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    });
    console.log('✅ Instituição padrão criada');
  }

  console.log('🎉 Migração da tabela institutions concluída');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Revertendo correções da tabela institutions...');
  
  // Esta migração não deve ser revertida pois pode causar perda de dados
  // Se necessário, remover apenas os campos adicionados
  console.log('⚠️ Reversão não implementada para evitar perda de dados');
} 