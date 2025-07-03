#!/usr/bin/env node

import { db } from '../database/index';

async function checkUsersTable(): Promise<boolean> {
  console.log('🔍 Verificando estrutura da tabela users...');
  
  try {
    // 1. Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('users');
    console.log(`📋 Tabela 'users' existe: ${tableExists ? '✅' : '❌'}`);
    
    if (!tableExists) {
      console.log('❌ Tabela users não encontrada!');
      return false;
    }

    // 2. Verificar colunas da tabela
    console.log('\n📊 Verificando colunas da tabela...');
    const columns = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    if (columns.rows && columns.rows.length > 0) {
      console.log('📋 Colunas encontradas:');
      columns.rows.forEach((col: any) => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('❌ Não foi possível obter informações das colunas');
    }

    // 3. Verificar se existem as colunas esperadas pelo modelo
    const hasFullName = columns.rows.some((col: any) => col.column_name === 'full_name');
    const hasRoleId = columns.rows.some((col: any) => col.column_name === 'role_id');
    const hasInstitutionId = columns.rows.some((col: any) => col.column_name === 'institution_id');
    const hasIsActive = columns.rows.some((col: any) => col.column_name === 'is_active');
    const hasEnabled = columns.rows.some((col: any) => col.column_name === 'enabled');
    const hasCreatedAt = columns.rows.some((col: any) => col.column_name === 'created_at');
    const hasUpdatedAt = columns.rows.some((col: any) => col.column_name === 'updated_at');
    const hasDateCreated = columns.rows.some((col: any) => col.column_name === 'date_created');
    const hasLastUpdated = columns.rows.some((col: any) => col.column_name === 'last_updated');
    
    console.log(`\n🔍 Colunas do modelo TypeScript:`);
    console.log(`  - full_name: ${hasFullName ? '✅' : '❌'}`);
    console.log(`  - role_id: ${hasRoleId ? '✅' : '❌'}`);
    console.log(`  - institution_id: ${hasInstitutionId ? '✅' : '❌'}`);
    console.log(`  - is_active: ${hasIsActive ? '✅' : '❌'}`);
    console.log(`  - enabled: ${hasEnabled ? '✅' : '❌'}`);
    console.log(`  - created_at: ${hasCreatedAt ? '✅' : '❌'}`);
    console.log(`  - updated_at: ${hasUpdatedAt ? '✅' : '❌'}`);
    console.log(`  - date_created: ${hasDateCreated ? '✅' : '❌'}`);
    console.log(`  - last_updated: ${hasLastUpdated ? '✅' : '❌'}`);

    // 4. Contar registros
    const count = await db('users').count('* as total').first();
    console.log(`\n📊 Total de usuários: ${count?.total}`);

    // 5. Testar consulta básica
    console.log('\n🧪 Testando consulta básica...');
    const sampleUsers = await db('users')
      .select('id', 'email', 'full_name')
      .limit(3);
    
    console.log('✅ Consulta básica funcionando:');
    sampleUsers.forEach((user: any) => {
      console.log(`  - ${user.full_name || user.email} (ID: ${user.id})`);
    });

    return true;

  } catch (error: any) {
    console.error('❌ Erro ao verificar tabela users:', error.message);
    return false;
  }
}

async function testUserService(): Promise<boolean> {
  console.log('\n🧪 Testando UserService...');
  
  try {
    // Verificar se o serviço pode ser importado
    console.log('📦 Importando UserService...');
    const { UserService } = await import('../services/UserService');
    console.log('✅ UserService importado com sucesso');

    // Instanciar o serviço
    console.log('🏗️ Instanciando serviço...');
    const userService = new UserService();
    console.log('✅ Serviço instanciado com sucesso');

    // Testar consulta com filtros básicos
    console.log('🔍 Testando findUsersWithFilters...');
    const result = await userService.findUsersWithFilters({
      page: 1,
      limit: 5
    });

    if (result.success) {
      console.log('✅ UserService funcionando corretamente');
      console.log(`📊 Encontrados ${result.data?.users?.length || 0} usuários`);
      
      // Mostrar detalhes dos usuários encontrados
      if (result.data?.users && result.data.users.length > 0) {
        console.log('📋 Usuários encontrados:');
        result.data.users.forEach((user: any, index: number) => {
          console.log(`  ${index + 1}. ${user.full_name || user.email} (ID: ${user.id})`);
        });
      }
      
      return true;
    } else {
      console.log('❌ UserService retornou erro:', result.error);
      return false;
    }

  } catch (error: any) {
    console.error('❌ Erro ao testar UserService:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Tentar diagnóstico mais detalhado
    if (error.message.includes('column') || error.message.includes('coluna')) {
      console.log('\n🔍 Erro relacionado a estrutura da tabela detectado');
      console.log('💡 Sugestão: Execute a correção de problemas para ajustar a estrutura');
    }
    
    return false;
  }
}

async function fixCommonIssues(): Promise<boolean> {
  console.log('\n🔧 Tentando corrigir problemas comuns...');

  try {
    // 1. Adicionar colunas que faltam para compatibilidade com o modelo
    const hasFullName = await db.schema.hasColumn('users', 'full_name');
    const hasRoleId = await db.schema.hasColumn('users', 'role_id');
    const hasInstitutionId = await db.schema.hasColumn('users', 'institution_id');
    const hasIsActive = await db.schema.hasColumn('users', 'is_active');
    const hasCreatedAt = await db.schema.hasColumn('users', 'created_at');
    const hasUpdatedAt = await db.schema.hasColumn('users', 'updated_at');

    console.log('🔍 Verificando colunas necessárias...');
    console.log(`  - full_name: ${hasFullName ? '✅' : '❌'}`);
    console.log(`  - role_id: ${hasRoleId ? '✅' : '❌'}`);
    console.log(`  - institution_id: ${hasInstitutionId ? '✅' : '❌'}`);
    console.log(`  - is_active: ${hasIsActive ? '✅' : '❌'}`);
    console.log(`  - created_at: ${hasCreatedAt ? '✅' : '❌'}`);
    console.log(`  - updated_at: ${hasUpdatedAt ? '✅' : '❌'}`);

    // Adicionar colunas que faltam
    await db.schema.alterTable('users', (table) => {
      if (!hasFullName) {
        console.log('➕ Adicionando coluna full_name...');
        table.string('full_name');
      }
      if (!hasRoleId) {
        console.log('➕ Adicionando coluna role_id...');
        table.string('role_id');
      }
      if (!hasInstitutionId) {
        console.log('➕ Adicionando coluna institution_id...');
        table.string('institution_id');
      }
      if (!hasIsActive) {
        console.log('➕ Adicionando coluna is_active...');
        table.boolean('is_active').defaultTo(true);
      }
      if (!hasCreatedAt) {
        console.log('➕ Adicionando coluna created_at...');
        table.timestamp('created_at').defaultTo(db.fn.now());
      }
      if (!hasUpdatedAt) {
        console.log('➕ Adicionando coluna updated_at...');
        table.timestamp('updated_at').defaultTo(db.fn.now());
      }
    });

    // 2. Mapear dados existentes para novos campos
    if (!hasCreatedAt) {
      console.log('🔄 Mapeando date_created para created_at...');
      await db.raw(`
        UPDATE users 
        SET created_at = COALESCE(date_created, NOW())
        WHERE created_at IS NULL
      `);
      console.log('✅ Mapeamento concluído');
    }

    if (!hasUpdatedAt) {
      console.log('🔄 Mapeando last_updated para updated_at...');
      await db.raw(`
        UPDATE users 
        SET updated_at = COALESCE(last_updated, NOW())
        WHERE updated_at IS NULL
      `);
      console.log('✅ Mapeamento concluído');
    }

    if (!hasFullName) {
      console.log('🔄 Mapeando fullName para full_name...');
      await db.raw(`
        UPDATE users 
        SET full_name = COALESCE("fullName", email)
        WHERE full_name IS NULL
      `);
      console.log('✅ Mapeamento concluído');
    }

    if (!hasIsActive) {
      console.log('🔄 Mapeando enabled para is_active...');
      await db.raw(`
        UPDATE users 
        SET is_active = COALESCE(enabled, true)
        WHERE is_active IS NULL
      `);
      console.log('✅ Mapeamento concluído');
    }

    // 3. Garantir que não há valores NULL em campos obrigatórios
    console.log('🔄 Corrigindo valores NULL...');
    await db('users')
      .whereNull('email')
      .update({
        email: 'email@nao-definido.com'
      });

    await db('users')
      .whereNull('full_name')
      .update({
        full_name: 'Nome não definido'
      });

    // 4. Definir valores padrão para campos booleanos
    await db('users')
      .whereNull('is_active')
      .update({
        is_active: true
      });

    await db('users')
      .whereNull('enabled')
      .update({
        enabled: true
      });

    console.log('✅ Problemas comuns corrigidos');
    return true;

  } catch (error: any) {
    console.error('❌ Erro ao corrigir problemas:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

async function main(): Promise<void> {
  console.log('🚀 Iniciando diagnóstico da API de usuários...\n');

  try {
    // 1. Verificar estrutura da tabela
    const tableOk = await checkUsersTable();
    
    if (!tableOk) {
      console.log('\n❌ Problemas críticos encontrados na tabela. Abortando...');
      process.exit(1);
    }

    // 2. Testar o serviço
    const serviceOk = await testUserService();
    
    if (!serviceOk) {
      console.log('\n🔧 Tentando corrigir problemas...');
      const fixed = await fixCommonIssues();
      
      if (fixed) {
        console.log('\n🔄 Testando novamente após correções...');
        const retestOk = await testUserService();
        
        if (retestOk) {
          console.log('\n✅ Problemas corrigidos com sucesso!');
        } else {
          console.log('\n❌ Ainda há problemas após as correções');
        }
      }
    } else {
      console.log('\n✅ API de usuários funcionando corretamente!');
    }

  } catch (error: any) {
    console.error('\n❌ Erro crítico:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

export { checkUsersTable, testUserService, fixCommonIssues }; 