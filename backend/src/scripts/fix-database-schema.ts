#!/usr/bin/env node

import { db } from '../database/index';

console.log('🔧 Script de Correção da Estrutura do Banco de Dados\n');

async function checkTableStructure(tableName: string): Promise<string[] | null> {
  console.log(`🔍 Verificando estrutura da tabela ${tableName}...`);
  
  try {
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable(tableName);
    if (!tableExists) {
      console.log(`❌ Tabela '${tableName}' não existe!`);
      return null;
    }

    // Obter informações das colunas
    const columns = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = ? AND table_schema = current_schema()
      ORDER BY ordinal_position
    `, [tableName]);

    console.log(`📋 Colunas encontradas na tabela ${tableName}:`);
    const columnNames: string[] = [];
    
    if (columns.rows && columns.rows.length > 0) {
      columns.rows.forEach((col: any) => {
        columnNames.push(col.column_name);
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    return columnNames;
  } catch (error) {
    console.error(`❌ Erro ao verificar tabela ${tableName}:`, (error as Error).message);
    return null;
  }
}

async function fixUsersTable(): Promise<boolean> {
  console.log('\n🔧 Corrigindo tabela users...');
  
  try {
    const columns = await checkTableStructure('users');
    if (!columns) return false;

    const hasIsActive = columns.includes('is_active');
    const hasEnabled = columns.includes('enabled');

    console.log(`\n📊 Status das colunas de ativação:`);
    console.log(`  - is_active: ${hasIsActive ? '✅' : '❌'}`);
    console.log(`  - enabled: ${hasEnabled ? '✅' : '❌'}`);

    if (!hasIsActive) {
      console.log('\n🔧 Adicionando coluna is_active...');
      
      await db.schema.alterTable('users', (table) => {
        table.boolean('is_active').defaultTo(true);
      });
      
      if (hasEnabled) {
        await db.raw(`UPDATE users SET is_active = enabled WHERE enabled IS NOT NULL`);
        console.log('✅ Dados migrados de enabled para is_active');
      } else {
        await db('users').update({ is_active: true });
        console.log('✅ Coluna is_active criada e usuários definidos como ativos');
      }
    } else {
      console.log('✅ Coluna is_active já existe');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela users:', (error as Error).message);
    return false;
  }
}

async function fixInstitutionsTable(): Promise<boolean> {
  console.log('\n🔧 Corrigindo tabela institutions...');
  
  try {
    const columns = await checkTableStructure('institutions');
    if (!columns) return false;

    const hasIsActive = columns.includes('is_active');
    const hasStatus = columns.includes('status');
    const hasActive = columns.includes('active');

    console.log(`\n📊 Status das colunas de ativação na tabela institutions:`);
    console.log(`  - is_active: ${hasIsActive ? '✅' : '❌'}`);
    console.log(`  - status: ${hasStatus ? '✅' : '❌'}`);
    console.log(`  - active: ${hasActive ? '✅' : '❌'}`);

    if (!hasIsActive) {
      console.log('\n🔧 Adicionando coluna is_active...');
      
      if (hasStatus) {
        // Mapear status para is_active
        await db.schema.alterTable('institutions', (table) => {
          table.boolean('is_active').defaultTo(true);
        });
        
        await db.raw(`
          UPDATE institutions 
          SET is_active = CASE 
            WHEN status = 'active' OR status = 'enabled' THEN true
            ELSE false
          END
        `);
        console.log('✅ Dados migrados de status para is_active');
        
      } else if (hasActive) {
        // Mapear active para is_active
        await db.schema.alterTable('institutions', (table) => {
          table.boolean('is_active').defaultTo(true);
        });
        
        await db.raw(`UPDATE institutions SET is_active = active WHERE active IS NOT NULL`);
        console.log('✅ Dados migrados de active para is_active');
        
      } else {
        // Criar coluna is_active
        await db.schema.alterTable('institutions', (table) => {
          table.boolean('is_active').defaultTo(true);
        });
        
        await db('institutions').update({ is_active: true });
        console.log('✅ Coluna is_active criada');
      }
    } else {
      console.log('✅ Coluna is_active já existe na tabela institutions');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela institutions:', (error as Error).message);
    return false;
  }
}

async function testQueries(): Promise<boolean> {
  console.log('\n🧪 Testando consultas após correções...');
  
  try {
    // Testar consulta de usuários
    console.log('🔍 Testando consulta de usuários...');
    const users = await db('users')
      .select('id', 'email', 'is_active')
      .limit(3);
    
    console.log(`✅ Consulta de usuários funcionando - ${users.length} usuários encontrados`);
    users.forEach((user: any) => {
      console.log(`  - ${user.email} (ativo: ${user.is_active})`);
    });

    // Testar consulta de instituições
    console.log('\n🔍 Testando consulta de instituições...');
    const institutions = await db('institutions')
      .select('id', 'name', 'is_active')
      .limit(3);
    
    console.log(`✅ Consulta de instituições funcionando - ${institutions.length} instituições encontradas`);
    institutions.forEach((inst: any) => {
      console.log(`  - ${inst.name} (ativa: ${inst.is_active})`);
    });

    return true;
  } catch (error) {
    console.error('❌ Erro ao testar consultas:', (error as Error).message);
    return false;
  }
}

async function createBackupInfo(): Promise<boolean> {
  console.log('\n💾 Criando informações de backup...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupInfo = {
      timestamp,
      changes: [
        'Adicionada coluna is_active na tabela users',
        'Adicionada coluna is_active na tabela institutions',
        'Migrados dados de colunas existentes para is_active'
      ],
      rollback: [
        'Para reverter: DROP COLUMN is_active das tabelas users e institutions',
        'Consultar backup do banco antes das alterações'
      ]
    };

    console.log('📋 Alterações realizadas:');
    backupInfo.changes.forEach(change => console.log(`  - ${change}`));
    
    console.log('\n🔄 Para reverter (se necessário):');
    backupInfo.rollback.forEach(step => console.log(`  - ${step}`));

    return true;
  } catch (error) {
    console.error('❌ Erro ao criar informações de backup:', (error as Error).message);
    return false;
  }
}

async function main(): Promise<void> {
  console.log('🚀 Iniciando correção da estrutura do banco de dados...\n');

  try {
    // 1. Corrigir tabela users
    const usersFixed = await fixUsersTable();
    
    // 2. Corrigir tabela institutions
    const institutionsFixed = await fixInstitutionsTable();
    
    // 3. Testar consultas
    const queriesWorking = await testQueries();
    
    // 4. Criar informações de backup
    await createBackupInfo();

    console.log('\n' + '='.repeat(50));
    console.log('🎯 RESUMO DAS CORREÇÕES:');
    console.log(`  - Tabela users: ${usersFixed ? '✅' : '❌'}`);
    console.log(`  - Tabela institutions: ${institutionsFixed ? '✅'  : '❌'}`);
    console.log(`  - Consultas funcionando: ${queriesWorking ? '✅' : '❌'}`);

    if (usersFixed && institutionsFixed && queriesWorking) {
      console.log('\n🎉 Todas as correções foram aplicadas com sucesso!');
      console.log('\n📋 PRÓXIMOS PASSOS:');
      console.log('1. Reinicie o backend: npm restart ou pm2 restart');
      console.log('2. Teste as APIs que estavam falhando');
      console.log('3. Verifique se os erros 401/500 foram resolvidos');
    } else {
      console.log('\n⚠️ Algumas correções falharam - verifique os logs acima');
    }

  } catch (error) {
    console.error('\n❌ Erro crítico:', (error as Error).message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

export { 
  fixUsersTable, 
  fixInstitutionsTable, 
  testQueries, 
  checkTableStructure 
}; 