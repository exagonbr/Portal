import type { Knex } from 'knex';

/**
 * Migração para restaurar a tabela "user" e atualizar as referências
 */
export async function up(knex: Knex): Promise<void> {
  try {
    // Verificar se existe tabela temporária "user" (pode ter sido criada em uma tentativa anterior)
    const tempUserExists = await knex.schema.hasTable('user');
    if (tempUserExists) {
      console.log('Removendo tabela temporária "user"...');
      await knex.schema.dropTable('user');
    }
    
    // Verificar se a tabela User existe
    const userCapitalizedExists = await knex.schema.hasTable('User');
    if (!userCapitalizedExists) {
      console.log('❌ Tabela "User" não encontrada.');
      return;
    }
    
    // Renomear User para user_temp
    console.log('Renomeando "User" para "user_temp"...');
    await knex.schema.renameTable('User', 'user_temp');
    
    // Criar nova tabela user (usando o esquema que sabemos que funciona)
    console.log('Criando nova tabela "user"...');
    await knex.schema.createTable('user', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.string('address');
      table.string('phone');
      table.string('usuario');
      table.string('role_id');
      table.string('institution_id');
      table.string('school_id');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
    
    // Copiar dados de user_temp para user
    console.log('Copiando dados de user_temp para user...');
    const users = await knex('user_temp').select('*');
    console.log(`Encontrados ${users.length} registros para copiar`);
    
    // Inserir um por um para garantir que todos os campos sejam copiados corretamente
    for (const user of users) {
      await knex('user').insert(user);
    }
    
    // Manter tabela temporária para backup
    console.log('✅ Migração concluída com sucesso!');
  } catch (error: any) {
    console.error(`❌ Erro durante a migração: ${error.message}`);
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  // Verificar se a tabela user_temp existe
  const userTempExists = await knex.schema.hasTable('user_temp');
  if (!userTempExists) {
    console.log('❌ Não é possível reverter: tabela "user_temp" não encontrada.');
    return;
  }
  
  // Verificar se a tabela user existe
  const userExists = await knex.schema.hasTable('user');
  if (userExists) {
    // Remover a tabela user criada na migração
    await knex.schema.dropTable('user');
  }
  
  // Restaurar a tabela user_temp para User
  await knex.schema.renameTable('user_temp', 'User');
  
  console.log('✅ Reversão da migração concluída com sucesso!');
} 