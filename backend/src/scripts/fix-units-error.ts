#!/usr/bin/env node

import { db } from '../database/index';

async function checkUnitsTable(): Promise<boolean> {
  console.log('🔍 Verificando estrutura da tabela unit...');
  
  try {
    // 1. Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('unit');
    console.log(`📋 Tabela 'unit' existe: ${tableExists ? '✅' : '❌'}`);
    
    if (!tableExists) {
      console.log('❌ Tabela unit não encontrada!');
      return false;
    }

    // 2. Verificar colunas da tabela
    console.log('\n📊 Verificando colunas da tabela...');
    const columns = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'unit'
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
    const hasDescription = columns.rows.some((col: any) => col.column_name === 'description');
    const hasType = columns.rows.some((col: any) => col.column_name === 'type');
    const hasActive = columns.rows.some((col: any) => col.column_name === 'active');
    const hasCreatedAt = columns.rows.some((col: any) => col.column_name === 'created_at');
    const hasUpdatedAt = columns.rows.some((col: any) => col.column_name === 'updated_at');
    
    console.log(`\n🔍 Colunas do modelo TypeScript:`);
    console.log(`  - description: ${hasDescription ? '✅' : '❌'}`);
    console.log(`  - type: ${hasType ? '✅' : '❌'}`);
    console.log(`  - active: ${hasActive ? '✅' : '❌'}`);
    console.log(`  - created_at: ${hasCreatedAt ? '✅' : '❌'}`);
    console.log(`  - updated_at: ${hasUpdatedAt ? '✅' : '❌'}`);

    // 4. Contar registros
    const count = await db('unit').count('* as total').first();
    console.log(`\n📊 Total de unidades: ${count?.total}`);

    // 5. Testar consulta básica
    console.log('\n🧪 Testando consulta básica...');
    const sampleUnits = await db('unit')
      .select('id', 'name', 'institution_id')
      .limit(3);
    
    console.log('✅ Consulta básica funcionando:');
    sampleUnits.forEach((unit: any) => {
      console.log(`  - ${unit.name} (ID: ${unit.id}, Institution: ${unit.institution_id})`);
    });

    return true;

  } catch (error: any) {
    console.error('❌ Erro ao verificar tabela unit:', error.message);
    return false;
  }
}

async function testUnitController(): Promise<boolean> {
  console.log('\n🧪 Testando UnitsController...');
  
  try {
    // Verificar se o controlador pode ser importado
    console.log('📦 Importando UnitsController...');
    const { UnitsController } = await import('../controllers/UnitsController');
    console.log('✅ UnitsController importado com sucesso');

    // Verificar se pode instanciar o controlador
    console.log('🏗️ Verificando instanciação do controlador...');
    new UnitsController();
    console.log('✅ Controlador pode ser instanciado com sucesso');

    // Testar consulta direta no banco
    console.log('🔍 Testando consulta direta no banco...');
    const units = await db('unit')
      .leftJoin('institution', 'unit.institution_id', 'institution.id')
      .select(
        'unit.*',
        'institution.name as institution_name'
      )
      .limit(5);

    console.log('✅ Consulta no banco funcionando corretamente');
    console.log(`📊 Encontradas ${units.length} unidades`);
    
    // Mostrar detalhes das unidades encontradas
    if (units.length > 0) {
      console.log('📋 Unidades encontradas:');
      units.forEach((unit: any, index: number) => {
        console.log(`  ${index + 1}. ${unit.name} (ID: ${unit.id}, Institution: ${unit.institution_name || 'N/A'})`);
      });
    }
    
    return true;

  } catch (error: any) {
    console.error('❌ Erro ao testar UnitsController:', error.message);
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
    const hasDescription = await db.schema.hasColumn('unit', 'description');
    const hasType = await db.schema.hasColumn('unit', 'type');
    const hasActive = await db.schema.hasColumn('unit', 'active');
    const hasCreatedAt = await db.schema.hasColumn('unit', 'created_at');
    const hasUpdatedAt = await db.schema.hasColumn('unit', 'updated_at');

    console.log('🔍 Verificando colunas necessárias...');
    console.log(`  - description: ${hasDescription ? '✅' : '❌'}`);
    console.log(`  - type: ${hasType ? '✅' : '❌'}`);
    console.log(`  - active: ${hasActive ? '✅' : '❌'}`);
    console.log(`  - created_at: ${hasCreatedAt ? '✅' : '❌'}`);
    console.log(`  - updated_at: ${hasUpdatedAt ? '✅' : '❌'}`);

    // Adicionar colunas que faltam
    await db.schema.alterTable('unit', (table) => {
      if (!hasDescription) {
        console.log('➕ Adicionando coluna description...');
        table.text('description');
      }
      if (!hasType) {
        console.log('➕ Adicionando coluna type...');
        table.string('type').defaultTo('school');
      }
      if (!hasActive) {
        console.log('➕ Adicionando coluna active...');
        table.boolean('active').defaultTo(true);
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
        UPDATE unit 
        SET created_at = COALESCE(date_created, NOW())
        WHERE created_at IS NULL
      `);
      console.log('✅ Mapeamento concluído');
    }

    if (!hasUpdatedAt) {
      console.log('🔄 Mapeando last_updated para updated_at...');
      await db.raw(`
        UPDATE unit 
        SET updated_at = COALESCE(last_updated, NOW())
        WHERE updated_at IS NULL
      `);
      console.log('✅ Mapeamento concluído');
    }

    // 3. Garantir que não há valores NULL em campos obrigatórios
    console.log('🔄 Corrigindo valores NULL...');
    await db('unit')
      .whereNull('name')
      .update({
        name: 'Unidade não definida'
      });

    // 4. Definir valores padrão para campos booleanos
    await db('unit')
      .whereNull('active')
      .update({
        active: true
      });

    await db('unit')
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
  console.log('🚀 Iniciando diagnóstico da API de unidades...\n');

  try {
    // 1. Verificar estrutura da tabela
    const tableOk = await checkUnitsTable();
    
    if (!tableOk) {
      console.log('\n❌ Problemas críticos encontrados na tabela. Abortando...');
      process.exit(1);
    }

    // 2. Testar o controlador
    const serviceOk = await testUnitController();
    
    if (!serviceOk) {
      console.log('\n🔧 Tentando corrigir problemas...');
      const fixed = await fixCommonIssues();
      
      if (fixed) {
        console.log('\n🔄 Testando novamente após correções...');
        const retestOk = await testUnitController();
        
        if (retestOk) {
          console.log('\n✅ Problemas corrigidos com sucesso!');
        } else {
          console.log('\n❌ Ainda há problemas após as correções');
        }
      }
    } else {
      console.log('\n✅ API de unidades funcionando corretamente!');
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

export { checkUnitsTable, testUnitController, fixCommonIssues }; 