/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deleta TODOS os registros existentes para garantir um estado limpo.
  await knex('user_roles').del();
  
  const now = new Date();
  
  const userRolesToInsert = [
    {
      id: 1,
      user_id: 1, // admin@sabercon.edu.br
      role_id: 1, // Admin
      institution_id: 1,
      unit_id: null,
      assigned_at: now,
      expires_at: null, // Sem expiração para admin
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      user_id: 2, // guardian@sabercon.edu.br
      role_id: 5, // Guardian
      institution_id: 1,
      unit_id: null,
      assigned_at: now,
      expires_at: null,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 3,
      user_id: 3, // teacher@sabercon.edu.br
      role_id: 3, // Teacher
      institution_id: 1,
      unit_id: null,
      assigned_at: now,
      expires_at: null,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 4,
      user_id: 4, // student@sabercon.edu.br
      role_id: 4, // Student
      institution_id: 1,
      unit_id: null,
      assigned_at: now,
      expires_at: null,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 5,
      user_id: 5, // coordinator@sabercon.edu.br
      role_id: 2, // Manager/Coordinator
      institution_id: 1,
      unit_id: null,
      assigned_at: now,
      expires_at: null,
      is_active: true,
      created_at: now,
      updated_at: now
    },
    {
      id: 6,
      user_id: 6, // institution.manager@sabercon.edu.br
      role_id: 6, // Institution Manager
      institution_id: 1,
      unit_id: null,
      assigned_at: now,
      expires_at: null,
      is_active: true,
      created_at: now,
      updated_at: now
    }
  ];
  
  await knex('user_roles').insert(userRolesToInsert);
  
  console.log('✅ Relacionamentos usuário-role criados com sucesso!');
};