import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Tabela de grupos de usuários
  await knex.schema.createTable('user_groups', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('color', 7); // Para cores hex como #FF5733
    table.uuid('institution_id').references('id').inTable('institutions').onDelete('CASCADE');
    table.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    table.boolean('is_active').defaultTo(true);
    table.integer('member_count').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Índices
    table.index(['institution_id']);
    table.index(['school_id']);
    table.index(['is_active']);
    table.index(['name']);
  });

  // Tabela de membros dos grupos
  await knex.schema.createTable('group_members', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('group_id').references('id').inTable('user_groups').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.enum('role', ['member', 'admin']).defaultTo('member');
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    table.uuid('added_by').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Constraint para evitar duplicatas
    table.unique(['group_id', 'user_id']);
    
    // Índices
    table.index(['group_id']);
    table.index(['user_id']);
    table.index(['role']);
  });

  // Tabela de permissões dos grupos
  await knex.schema.createTable('group_permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('group_id').references('id').inTable('user_groups').onDelete('CASCADE');
    table.string('permission_key', 100).notNullable();
    table.boolean('allowed').notNullable();
    table.enum('context_type', ['global', 'institution', 'school']).notNullable();
    table.string('context_id'); // UUID como string para flexibilidade
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Constraint para evitar duplicatas
    table.unique(['group_id', 'permission_key', 'context_type', 'context_id']);
    
    // Índices
    table.index(['group_id']);
    table.index(['permission_key']);
    table.index(['context_type', 'context_id']);
  });

  // Tabela de permissões contextuais individuais
  await knex.schema.createTable('contextual_permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('permission_key', 100).notNullable();
    table.boolean('allowed').notNullable();
    table.enum('context_type', ['global', 'institution', 'school']).notNullable();
    table.string('context_id'); // UUID como string para flexibilidade
    table.enum('source', ['direct', 'group', 'role']).defaultTo('direct');
    table.string('source_id'); // ID da fonte (grupo, role, etc)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Constraint para evitar duplicatas
    table.unique(['user_id', 'permission_key', 'context_type', 'context_id', 'source', 'source_id']);
    
    // Índices
    table.index(['user_id']);
    table.index(['permission_key']);
    table.index(['context_type', 'context_id']);
    table.index(['source', 'source_id']);
  });

  // Triggers para atualizar member_count automaticamente
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_group_member_count()
    RETURNS TRIGGER AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE user_groups 
            SET member_count = member_count + 1, updated_at = NOW()
            WHERE id = NEW.group_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE user_groups 
            SET member_count = member_count - 1, updated_at = NOW()
            WHERE id = OLD.group_id;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE TRIGGER trigger_update_group_member_count
    AFTER INSERT OR DELETE ON group_members
    FOR EACH ROW EXECUTE FUNCTION update_group_member_count();
  `);

  // Trigger para atualizar updated_at
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Aplicar trigger em todas as tabelas
  const tables = ['user_groups', 'group_members', 'group_permissions', 'contextual_permissions'];
  
  for (const tableName of tables) {
    await knex.raw(`
      CREATE TRIGGER trigger_${tableName}_updated_at
      BEFORE UPDATE ON ${tableName}
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remover triggers
  await knex.raw('DROP TRIGGER IF EXISTS trigger_update_group_member_count ON group_members;');
  
  const tables = ['user_groups', 'group_members', 'group_permissions', 'contextual_permissions'];
  
  for (const tableName of tables) {
    await knex.raw(`DROP TRIGGER IF EXISTS trigger_${tableName}_updated_at ON ${tableName};`);
  }
  
  // Remover functions
  await knex.raw('DROP FUNCTION IF EXISTS update_group_member_count();');
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column();');
  
  // Remover tabelas na ordem correta
  await knex.schema.dropTableIfExists('contextual_permissions');
  await knex.schema.dropTableIfExists('group_permissions');
  await knex.schema.dropTableIfExists('group_members');
  await knex.schema.dropTableIfExists('user_groups');
}
