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
      .select('id', 'name', 'company_name', 'document')
      .limit(3);
    
    console.log('✅ Consulta básica funcionando:');
    sampleInstitutions.forEach((inst: any) => {
      console.log(`  - ${inst.name} | ${inst.company_name} (Doc: ${inst.document})`);
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
    // Verificar se o serviço pode ser importado
    console.log('📦 Importando InstitutionService...');
    const { InstitutionService } = await import('../services/InstitutionService');
    console.log('✅ InstitutionService importado com sucesso');

    // Instanciar o serviço
    console.log('🏗️ Instanciando serviço...');
    const institutionService = new InstitutionService();
    console.log('✅ Serviço instanciado com sucesso');

    // Testar consulta com filtros básicos
    console.log('🔍 Testando findInstitutionsWithFilters...');
    const result = await institutionService.findInstitutionsWithFilters({
      page: 1,
      limit: 5
    });

    if (result.success) {
      console.log('✅ InstitutionService funcionando corretamente');
      console.log(`📊 Encontradas ${result.data?.institution?.length || 0} instituições`);
      
      // Mostrar detalhes das instituições encontradas
      if (result.data?.institution && result.data.institution.length > 0) {
        console.log('📋 Instituições encontradas:');
        result.data.institution.forEach((inst: any, index: number) => {
          console.log(`  ${index + 1}. ${inst.name} (ID: ${inst.id})`);
        });
      }
      
      return true;
    } else {
      console.log('❌ InstitutionService retornou erro:', result.error);
      return false;
    }

  } catch (error: any) {
    console.error('❌ Erro ao testar InstitutionService:', error.message);
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
    const hasCode = await db.schema.hasColumn('institutions', 'code');
    const hasIsActive = await db.schema.hasColumn('institutions', 'is_active');
    const hasType = await db.schema.hasColumn('institutions', 'type');
    const hasCreatedAt = await db.schema.hasColumn('institutions', 'created_at');
    const hasUpdatedAt = await db.schema.hasColumn('institutions', 'updated_at');

    console.log('🔍 Verificando colunas necessárias...');
    console.log(`  - code: ${hasCode ? '✅' : '❌'}`);
    console.log(`  - is_active: ${hasIsActive ? '✅' : '❌'}`);
    console.log(`  - type: ${hasType ? '✅' : '❌'}`);
    console.log(`  - created_at: ${hasCreatedAt ? '✅' : '❌'}`);
    console.log(`  - updated_at: ${hasUpdatedAt ? '✅' : '❌'}`);

    // Adicionar colunas que faltam
    await db.schema.alterTable('institutions', (table) => {
      if (!hasCode) {
        console.log('➕ Adicionando coluna code...');
        table.string('code').unique();
      }
      if (!hasIsActive) {
        console.log('➕ Adicionando coluna is_active...');
        table.boolean('is_active').defaultTo(true);
      }
      if (!hasType) {
        console.log('➕ Adicionando coluna type...');
        table.string('type').defaultTo('SCHOOL');
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

    // 2. Gerar códigos únicos para instituições que não têm
    if (!hasCode) {
      console.log('🔄 Gerando códigos únicos para instituições...');
      const institutions = await db('institutions').select('id', 'name', 'document');
      
      for (const inst of institutions) {
        // Gerar código baseado no documento ou nome
        let code = '';
        if (inst.document) {
          code = `INST_${inst.document.replace(/[^0-9]/g, '').substring(0, 8)}`;
        } else {
          code = `INST_${inst.name.replace(/\s+/g, '_').toUpperCase().substring(0, 10)}_${inst.id}`;
        }
        
        await db('institutions').where('id', inst.id).update({ code });
      }
      console.log('✅ Códigos gerados');
    }

    // 3. Garantir que não há valores NULL em campos obrigatórios
    console.log('🔄 Corrigindo valores NULL...');
    await db('institutions')
      .whereNull('name')
      .update({
        name: 'Nome não definido'
      });

    // 4. Definir valores padrão para campos booleanos
    await db('institutions')
      .whereNull('is_active')
      .update({
        is_active: true
      });

    await db('institutions')
      .whereNull('contract_disabled')
      .update({
        contract_disabled: false
      });

    await db('institutions')
      .whereNull('deleted')
      .update({
        deleted: false
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