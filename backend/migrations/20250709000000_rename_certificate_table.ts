import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🚀 Renomeando tabela certificate para certificates...');
  
  // Verificar se a tabela certificate existe
  const certificateExists = await knex.schema.hasTable('certificate');
  
  if (certificateExists) {
    // Renomear a tabela certificate para certificates
    await knex.schema.renameTable('certificate', 'certificates');
    console.log('✅ Tabela certificate renomeada para certificates com sucesso!');
  } else {
    // Verificar se a tabela certificates já existe
    const certificatesExists = await knex.schema.hasTable('certificates');
    
    if (!certificatesExists) {
      // Se nenhuma das tabelas existir, criar a tabela certificates
      console.log('⚠️ Tabela certificate não encontrada. Criando tabela certificates...');
      
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
      });
      
      console.log('✅ Tabela certificates criada com sucesso!');
    } else {
      console.log('✅ Tabela certificates já existe!');
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔄 Revertendo renomeação da tabela certificates para certificate...');
  
  // Verificar se a tabela certificates existe
  const certificatesExists = await knex.schema.hasTable('certificates');
  
  if (certificatesExists) {
    // Renomear a tabela certificates para certificate
    await knex.schema.renameTable('certificates', 'certificate');
    console.log('✅ Tabela certificates renomeada para certificate com sucesso!');
  } else {
    console.log('⚠️ Tabela certificates não encontrada. Nada a reverter.');
  }
} 