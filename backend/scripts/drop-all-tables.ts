#!/usr/bin/env ts-node

import * as knex from 'knex';
import config from '../knexfile';

const knexConfig = config[process.env.NODE_ENV || 'development'];

console.log('🗑️ REMOVENDO TODAS AS TABELAS');
console.log('=============================');

async function dropAllTables() {
  const db = knex.default(knexConfig);

  try {
    console.log('\n1️⃣ Listando todas as tabelas...');
    
    // Buscar todas as tabelas do schema public
    const tables = await db.raw(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `);

    const tableNames = tables.rows.map((row: any) => row.tablename);
    console.log(`📊 ${tableNames.length} tabelas encontradas:`, tableNames);

    if (tableNames.length === 0) {
      console.log('⚠️ Nenhuma tabela encontrada para remover');
      await db.destroy();
      return;
    }

    console.log('\n2️⃣ Removendo todas as tabelas...');
    
    // Desabilitar verificação de chaves estrangeiras temporariamente
    await db.raw('SET session_replication_role = replica;');
    
    // Dropar todas as tabelas com CASCADE para forçar remoção
    for (const tableName of tableNames) {
      try {
        await db.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
        console.log(`   ✅ Tabela "${tableName}" removida`);
      } catch (error: any) {
        console.log(`   ⚠️ Erro ao remover tabela "${tableName}":`, error.message);
      }
    }

    // Reabilitar verificação de chaves estrangeiras
    await db.raw('SET session_replication_role = DEFAULT;');

    console.log('\n3️⃣ Removendo funções e views...');
    
    // Remover views
    const views = await db.raw(`
      SELECT viewname 
      FROM pg_views 
      WHERE schemaname = 'public'
    `);
    
    for (const view of views.rows) {
      try {
        await db.raw(`DROP VIEW IF EXISTS "${view.viewname}" CASCADE`);
        console.log(`   ✅ View "${view.viewname}" removida`);
      } catch (error: any) {
        console.log(`   ⚠️ Erro ao remover view "${view.viewname}":`, error.message);
      }
    }

    // Remover funções customizadas
    const functions = await db.raw(`
      SELECT proname, oidvectortypes(proargtypes) as args
      FROM pg_proc 
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND proname NOT LIKE 'pg_%'
      AND proname NOT LIKE 'sql_%'
    `);

    for (const func of functions.rows) {
      try {
        await db.raw(`DROP FUNCTION IF EXISTS "${func.proname}"(${func.args}) CASCADE`);
        console.log(`   ✅ Função "${func.proname}" removida`);
      } catch (error: any) {
        console.log(`   ⚠️ Erro ao remover função "${func.proname}":`, error.message);
      }
    }

    console.log('\n4️⃣ Verificação final...');
    const remainingTables = await db.raw(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `);

    console.log(`📊 ${remainingTables.rows.length} tabelas restantes`);

    await db.destroy();

    console.log('\n🎉 REMOÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('===============================');
    console.log('✅ Todas as tabelas removidas');
    console.log('✅ Views e funções limpas');
    console.log('✅ Banco pronto para migration fresh');
    
  } catch (error) {
    console.error('\n❌ ERRO DURANTE REMOÇÃO:', error);
    await db.destroy();
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  dropAllTables();
}

export default dropAllTables; 