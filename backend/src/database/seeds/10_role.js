/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Não deletar roles existentes pois já existem usuários associados
  // await knex('roles').del()
  
  // Verificar se os roles já existem antes de inserir
  const existingRoles = await knex('roles').select('name');
  const existingRoleNames = existingRoles.map(r => r.name);
  
  const rolesToInsert = [
    {
      id: 6,
      name: 'Bibliotecário',
      description: 'Responsável pela gestão da biblioteca digital',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      name: 'Secretário',
      description: 'Responsável pela secretaria escolar',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 8,
      name: 'Monitor',
      description: 'Monitor de turmas e atividades',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ].filter(role => !existingRoleNames.includes(role.name));
  
  if (rolesToInsert.length > 0) {
    await knex('roles').insert(rolesToInsert);
  }
};