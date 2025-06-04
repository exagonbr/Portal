#!/usr/bin/env ts-node

import * as knex from 'knex';
import config from '../knexfile';

const knexConfig = config[process.env.NODE_ENV || 'development'];

console.log('🧹 LIMPANDO MIGRATIONS CORROMPIDAS');
console.log('=================================');

async function cleanMigrations() {
  const db = knex.default(knexConfig);

  try {
    console.log('\n1️⃣ Verificando se tabela knex_migrations existe...');
    
    const hasTable = await db.schema.hasTable('knex_migrations');
    
    if (hasTable) {
      console.log('✅ Tabela knex_migrations encontrada');
      
      // Mostrar migrations atuais
      const currentMigrations = await db('knex_migrations').select('*');
      console.log(`📊 ${currentMigrations.length} migrations registradas no banco`);
      
      // Limpar tabela de migrations
      console.log('\n2️⃣ Limpando tabela knex_migrations...');
      await db('knex_migrations').del();
      console.log('✅ Tabela knex_migrations limpa');
      
    } else {
      console.log('⚠️ Tabela knex_migrations não existe (normal para DB novo)');
    }

    console.log('\n3️⃣ Verificando se tabela knex_migrations_lock existe...');
    const hasLockTable = await db.schema.hasTable('knex_migrations_lock');
    
    if (hasLockTable) {
      console.log('✅ Tabela knex_migrations_lock encontrada');
      await db('knex_migrations_lock').del();
      console.log('✅ Tabela knex_migrations_lock limpa');
    } else {
      console.log('⚠️ Tabela knex_migrations_lock não existe');
    }

    await db.destroy();

    console.log('\n🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('================================');
    console.log('✅ Migrations corrompidas removidas');
    console.log('✅ Sistema pronto para migration fresh');
    
  } catch (error) {
    console.error('\n❌ ERRO DURANTE LIMPEZA:', error);
    await db.destroy();
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanMigrations();
}

export default cleanMigrations; 