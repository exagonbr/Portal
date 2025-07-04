/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpar dados existentes
  await knex('notification_queue').del();
  
  // Inserir dados básicos
  await knex('notification_queue').insert([
    {
      name: 'Notification_queue Padrão 1',
      description: 'Registro padrão criado automaticamente',
      is_active: true
    },
    {
      name: 'Notification_queue Padrão 2',
      description: 'Segundo registro padrão criado automaticamente',
      is_active: true
    }
  ]);
  
  console.log('✅ Seed notification_queue executado com sucesso');
};