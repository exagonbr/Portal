import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Verificando tabela email_templates...');
  
  const tableExists = await knex.schema.hasTable('email_templates');
  
  if (!tableExists) {
    console.log('🚀 Criando tabela email_templates...');
    
    await knex.schema.createTable('email_templates', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable().unique();
      table.text('subject').notNullable();
      table.text('html').notNullable();
      table.text('text').nullable();
      table.string('category', 100).defaultTo('general');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
      
      // Índices
      table.index(['category']);
      table.index(['is_active']);
      table.index(['name']);
    });
    
    console.log('✅ Tabela email_templates criada com sucesso!');
  } else {
    console.log('ℹ️ Tabela email_templates já existe, pulando criação.');
  }
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Removendo tabela email_templates...');
  await knex.schema.dropTableIfExists('email_templates');
  console.log('✅ Tabela email_templates removida!');
}
