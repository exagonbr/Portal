import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  console.log('🔧 Corrigindo estrutura da tabela roles...');

  // Primeiro, vamos verificar se a tabela roles já tem a estrutura correta
  const hasCorrectStructure = await knex.schema.hasColumn('roles', 'status');
  
  if (!hasCorrectStructure) {
    console.log('📝 Alterando estrutura da tabela roles...');
    
    // Renomear a tabela atual para backup
    await knex.schema.renameTable('roles', 'roles_backup');
    
    // Criar nova tabela roles com a estrutura correta
    await knex.schema.createTable('roles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable().unique();
      table.text('description');
      table.enum('type', ['system', 'custom']).notNullable().defaultTo('system');
      table.integer('user_count').defaultTo(0);
      table.enum('status', ['active', 'inactive']).defaultTo('active');
      table.boolean('active').defaultTo(true);
      table.timestamps(true, true);
    });

    console.log('✅ Nova tabela roles criada com estrutura correta');

    // Migrar dados da tabela antiga se existirem
    const oldRoles = await knex('roles_backup').select('*');
    
    if (oldRoles.length > 0) {
      console.log(`📋 Migrando ${oldRoles.length} roles da tabela antiga...`);
      
      for (const oldRole of oldRoles) {
        await knex('roles').insert({
          id: knex.raw('gen_random_uuid()'),
          name: oldRole.authority || oldRole.display_name || `role_${oldRole.id}`,
          description: oldRole.display_name || null,
          type: 'system',
          user_count: 0,
          status: 'active',
          active: true,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        });
      }
      
      console.log('✅ Dados migrados com sucesso');
    }

    // Inserir roles padrão se não existirem
    const existingRoles = await knex('roles').select('name');
    const existingRoleNames = existingRoles.map(r => r.name);

    const defaultRoles = [
      {
        name: 'ADMIN',
        description: 'Administrador do Sistema',
        type: 'system',
        status: 'active',
        active: true
      },
      {
        name: 'TEACHER',
        description: 'Professor',
        type: 'system',
        status: 'active',
        active: true
      },
      {
        name: 'STUDENT',
        description: 'Estudante',
        type: 'system',
        status: 'active',
        active: true
      },
      {
        name: 'GUARDIAN',
        description: 'Responsável',
        type: 'system',
        status: 'active',
        active: true
      },
      {
        name: 'COORDINATOR',
        description: 'Coordenador',
        type: 'system',
        status: 'active',
        active: true
      }
    ];

    for (const role of defaultRoles) {
      if (!existingRoleNames.includes(role.name)) {
        await knex('roles').insert({
          id: knex.raw('gen_random_uuid()'),
          ...role,
          user_count: 0,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        });
        console.log(`✅ Role ${role.name} criada`);
      }
    }
  }

  // Verificar se a tabela users tem a coluna role_id
  const usersHasRoleId = await knex.schema.hasColumn('users', 'role_id');
  
  if (!usersHasRoleId) {
    console.log('📝 Adicionando coluna role_id na tabela users...');
    
    await knex.schema.alterTable('users', (table) => {
      table.uuid('role_id').references('id').inTable('roles').onDelete('SET NULL');
    });
    
    console.log('✅ Coluna role_id adicionada na tabela users');
  }

  // Criar tabela permissions se não existir
  const permissionsExists = await knex.schema.hasTable('permissions');
  
  if (!permissionsExists) {
    console.log('📝 Criando tabela permissions...');
    
    await knex.schema.createTable('permissions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable().unique();
      table.string('resource').notNullable();
      table.string('action').notNullable();
      table.text('description');
      table.timestamps(true, true);
    });
    
    console.log('✅ Tabela permissions criada');
  }

  // Criar tabela role_permissions se não existir
  const rolePermissionsExists = await knex.schema.hasTable('role_permissions');
  
  if (!rolePermissionsExists) {
    console.log('📝 Criando tabela role_permissions...');
    
    await knex.schema.createTable('role_permissions', (table) => {
      table.uuid('role_id').references('id').inTable('roles').onDelete('CASCADE');
      table.uuid('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
      table.primary(['role_id', 'permission_id']);
      table.timestamps(true, true);
    });
    
    console.log('✅ Tabela role_permissions criada');
  }

  console.log('🎉 Migração da estrutura de roles concluída com sucesso!');
}

export async function down(knex: Knex): Promise<void> {
  console.log('⏪ Revertendo migração da estrutura de roles...');

  // Verificar se existe backup
  const backupExists = await knex.schema.hasTable('roles_backup');
  
  if (backupExists) {
    // Remover tabela atual
    await knex.schema.dropTableIfExists('role_permissions');
    await knex.schema.dropTableIfExists('permissions');
    await knex.schema.dropTableIfExists('roles');
    
    // Restaurar backup
    await knex.schema.renameTable('roles_backup', 'roles');
    
    console.log('✅ Estrutura anterior restaurada');
  } else {
    console.log('⚠️ Backup não encontrado, mantendo estrutura atual');
  }
} 