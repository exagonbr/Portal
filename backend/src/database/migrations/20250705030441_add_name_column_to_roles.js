/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Verificar se a coluna já existe
  const hasName = await knex.schema.hasColumn('roles', 'name');
  
  if (!hasName) {
    // Primeiro adicionar a coluna como nullable
    await knex.schema.alterTable('roles', function(table) {
      table.string('name', 255).nullable();
    });
    
    // Verificar se há registros existentes e preencher valores padrão
    const existingRoles = await knex('roles').select('*');
    
    if (existingRoles.length > 0) {
      // Preencher valores padrão para registros existentes
      for (let i = 0; i < existingRoles.length; i++) {
        const role = existingRoles[i];
        const defaultName = role.description || `ROLE_${role.id}`;
        await knex('roles').where('id', role.id).update({ name: defaultName });
      }
    }
    
    // Adicionar alguns roles padrão se a tabela estiver vazia
    const rolesCount = await knex('roles').count('* as count').first();
    
    if (parseInt(rolesCount.count) === 0) {
      await knex('roles').insert([
        { name: 'SYSTEM_ADMIN', description: 'Administrador do Sistema', is_active: true },
        { name: 'INSTITUTION_MANAGER', description: 'Gerente da Instituição', is_active: true },
        { name: 'COORDINATOR', description: 'Coordenador Acadêmico', is_active: true },
        { name: 'TEACHER', description: 'Professor', is_active: true },
        { name: 'STUDENT', description: 'Estudante', is_active: true },
        { name: 'GUARDIAN', description: 'Responsável pelo Estudante', is_active: true }
      ]);
    }
    
    // Agora tornar a coluna NOT NULL
    await knex.schema.alterTable('roles', function(table) {
      table.string('name', 255).notNullable().alter();
    });
  }
  
  return Promise.resolve();
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('roles', function(table) {
    table.dropColumn('name');
  });
};
