/**
 * Script para resetar completamente a tabela de migrações do Knex e limpar o banco de dados
 * Uso: ts-node backend/scripts/reset-migrations.ts
 */

import knex from 'knex';
import dotenv from 'dotenv';
import knexConfig from '../knexfile';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar conexão com o banco de dados
const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

async function resetDatabase() {
  console.log('🔄 Resetando banco de dados...');
  
  try {
    // Usar DROP CASCADE para remover todas as tabelas independentemente de dependências
    await db.raw(`
      DO $$ 
      DECLARE
        tabname text;
      BEGIN
        FOR tabname IN (
          SELECT table_name
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name != 'knex_migrations'
          AND table_name != 'knex_migrations_lock'
        )
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(tabname) || ' CASCADE';
          RAISE NOTICE 'Dropped table %', tabname;
        END LOOP;
      END $$;
    `);
    
    console.log('✅ Todas as tabelas foram removidas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao remover tabelas:', error);
  }
}

async function resetMigrations() {
  console.log('🔄 Resetando migrações...');
  
  try {
    // Verificar se a tabela existe
    const hasTable = await db.schema.hasTable('knex_migrations');
    
    if (!hasTable) {
      console.log('ℹ️  Tabela knex_migrations não encontrada no banco de dados');
    } else {
      // Truncar a tabela de migrações
      await db('knex_migrations').truncate();
      console.log('✅ Tabela knex_migrations limpa com sucesso');
      
      // Truncar a tabela de locks de migrações
      const hasLocksTable = await db.schema.hasTable('knex_migrations_lock');
      if (hasLocksTable) {
        await db('knex_migrations_lock').truncate();
        // Reinserir o registro de lock (desbloqueado)
        await db('knex_migrations_lock').insert({ is_locked: 0 });
        console.log('✅ Tabela knex_migrations_lock resetada com sucesso');
      }
    }
    
    console.log('✨ Reset de migrações concluído!');
  } catch (error) {
    console.error('❌ Erro ao resetar migrações:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await resetDatabase();
    await resetMigrations();
    console.log('✅ Banco de dados e migrações resetados com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o processo de reset:', error);
    process.exit(1);
  } finally {
    // Fechar conexão com o banco de dados
    await db.destroy();
  }
}

// Executar reset
main(); 