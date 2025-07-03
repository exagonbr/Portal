#!/usr/bin/env node

import { db } from '../database/index';

async function checkInstitutionsTable(): Promise<boolean> {
  console.log('🔍 Verificando estrutura da tabela institutions...');
  
  try {
    // 1. Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('institutions');
    console.log(`📋 Tabela 'institutions' existe: ${tableExists ? '✅' : '❌'}`);
    
    if (!tableExists) {
      console.log('❌ Tabela institutions não encontrada!');
      return false;
    }

    // 2. Verificar colunas da tabela
    console.log('\n📊 Verificando colunas da tabela...');
    const columns = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'institutions'
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

    // 3. Verificar se existe a coluna 'status' ou 'is_active'
    const hasStatus = columns.rows.some((col: any) => col.column_name === 'status');
    const hasIsActive = columns.rows.some((col: any) => col.column_name === 'is_active');
    
    console.log(`\n🔍 Coluna 'status': ${hasStatus ? '✅' : '❌'}`);
    console.log(`🔍 Coluna 'is_active': ${hasIsActive ? '✅' : '❌'}`);

    // 4. Contar registros
    const count = await db('institutions').count('* as total').first();
    console.log(`\n📊 Total de instituições: ${count?.total}`);

    // 5. Testar consulta básica
    console.log('\n🧪 Testando consulta básica...');
    const sampleInstitutions = await db('institutions')
      .select('id', 'name', 'code')
      .limit(3);
    
    console.log('✅ Consulta básica funcionando:');
    sampleInstitutions.forEach((inst: any) => {
      console.log(`  - ${inst.name} (${inst.code})`);
    });

    return true;

  } catch (error: any) {
    console.error('❌ Erro ao verificar tabela institutions:', error.message);
    return false;
  }
}

async function testInstitutionService(): Promise<boolean> {
  console.log('\n🧪 Testando InstitutionService...');
  
  try {
    // Importar dinamicamente o serviço
    const { InstitutionService } = await import('../services/InstitutionService');
    const institutionService = new InstitutionService();

    // Testar consulta com filtros básicos
    console.log('🔍 Testando findInstitutionsWithFilters...');
    const result = await institutionService.findInstitutionsWithFilters({
      page: 1,
      limit: 5
    });

    if (result.success) {
      console.log('✅ InstitutionService funcionando corretamente');
      console.log(`📊 Encontradas ${result.data?.institution?.length || 0} instituições`);
      return true;
    } else {
      console.log('❌ InstitutionService retornou erro:', result.error);
      return false;
    }

  } catch (error: any) {
    console.error('❌ Erro ao testar InstitutionService:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

async function fixCommonIssues(): Promise<boolean> {
  console.log('\n🔧 Tentando corrigir problemas comuns...');

  try {
    // 1. Verificar se falta a coluna 'status' e criar se necessário
    const hasStatus = await db.schema.hasColumn('institutions', 'status');
    
    if (!hasStatus) {
      console.log('➕ Adicionando coluna status...');
      await db.schema.alterTable('institutions', (table) => {
        table.string('status').defaultTo('active');
      });
      console.log('✅ Coluna status adicionada');
    }

    // 2. Migrar dados de is_active para status se necessário
    const hasIsActive = await db.schema.hasColumn('institutions', 'is_active');
    
    if (hasIsActive && hasStatus) {
      console.log('🔄 Migrando dados de is_active para status...');
      await db.raw(`
        UPDATE institutions 
        SET status = CASE 
          WHEN is_active = true THEN 'active'
          ELSE 'inactive'
        END
        WHERE status IS NULL OR status = ''
      `);
      console.log('✅ Migração concluída');
    }

    // 3. Garantir que não há valores NULL em campos obrigatórios
    console.log('🔄 Corrigindo valores NULL...');
    await db('institutions')
      .whereNull('name')
      .orWhereNull('code')
      .update({
        name: 'Nome não definido',
        code: 'CODE_' + Date.now()
      });

    console.log('✅ Problemas comuns corrigidos');
    return true;

  } catch (error: any) {
    console.error('❌ Erro ao corrigir problemas:', error.message);
    return false;
  }
}

async function main(): Promise<void> {
  console.log('🚀 Iniciando diagnóstico da API de instituições...\n');

  try {
    // 1. Verificar estrutura da tabela
    const tableOk = await checkInstitutionsTable();
    
    if (!tableOk) {
      console.log('\n❌ Problemas críticos encontrados na tabela. Abortando...');
      process.exit(1);
    }

    // 2. Testar o serviço
    const serviceOk = await testInstitutionService();
    
    if (!serviceOk) {
      console.log('\n🔧 Tentando corrigir problemas...');
      const fixed = await fixCommonIssues();
      
      if (fixed) {
        console.log('\n🔄 Testando novamente após correções...');
        const retestOk = await testInstitutionService();
        
        if (retestOk) {
          console.log('\n✅ Problemas corrigidos com sucesso!');
        } else {
          console.log('\n❌ Ainda há problemas após as correções');
        }
      }
    } else {
      console.log('\n✅ API de instituições funcionando corretamente!');
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

export { checkInstitutionsTable, testInstitutionService, fixCommonIssues }; 