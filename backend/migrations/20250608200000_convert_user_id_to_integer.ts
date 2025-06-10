import type { Knex } from 'knex';

/**
 * Migração para converter a tabela User (UUID) para user (inteiro)
 */
export async function up(knex: Knex): Promise<void> {
  try {
    // Verificar se as tabelas existem
    const userCapitalizedExists = await knex.schema.hasTable('User');
    if (!userCapitalizedExists) {
      console.log('❌ Tabela "User" não encontrada.');
      return;
    }
    
    // 1. Renomear a tabela User para User_uuid
    console.log('Renomeando "User" para "User_uuid"...');
    await knex.schema.renameTable('User', 'User_uuid');
    
    // 2. Criar nova tabela "user" com ID como inteiro
    console.log('Criando nova tabela "user" com ID como inteiro...');
    await knex.schema.createTable('user', (table) => {
      table.increments('id').primary();
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
    
    // 3. Copiar dados de User_uuid para user
    console.log('Copiando dados...');
    const users = await knex('User_uuid').select('*');
    console.log(`Encontrados ${users.length} registros para copiar`);
    
    // Inserir registros em lote para melhor performance
    if (users.length > 0) {
      const dataToInsert = users.map(user => ({
        name: user.name,
        email: user.email,
        password: user.password,
        address: user.address,
        phone: user.phone,
        usuario: user.usuario,
        role_id: user.role_id,
        institution_id: user.institution_id,
        school_id: user.school_id,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
      
      await knex('user').insert(dataToInsert);
    }
    
    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error(`❌ Erro durante a migração: ${(error as Error).message}`);
    throw error;
  }
}

export async function down(knex: Knex): Promise<void> {
  // Verificar se a tabela User_uuid existe para restauração
  const userUuidExists = await knex.schema.hasTable('User_uuid');
  if (!userUuidExists) {
    console.log('❌ Não é possível reverter: tabela "User_uuid" não encontrada.');
    return;
  }
  
  // Verificar se a tabela user existe para ser removida
  const userExists = await knex.schema.hasTable('user');
  if (userExists) {
    // Remover a tabela user criada na migração
    await knex.schema.dropTable('user');
  }
  
  // Restaurar a tabela User_uuid para User
  await knex.schema.renameTable('User_uuid', 'User');
  
  console.log('✅ Reversão da migração concluída com sucesso!');
} 