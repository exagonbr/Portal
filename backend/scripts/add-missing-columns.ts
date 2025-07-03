/**
 * Script para adicionar colunas que estão faltando nas tabelas
 * Uso: ts-node backend/scripts/add-missing-columns.ts
 */

import knex from 'knex';
import dotenv from 'dotenv';
import knexConfig from '../knexfile';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar conexão com o banco de dados
const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

async function addMissingColumns() {
  console.log('🔍 Verificando colunas faltantes...');
  
  try {
    // Verificar se a tabela roles existe
    const hasRolesTable = await db.schema.hasTable('roles');
    
    if (!hasRolesTable) {
      console.log('❌ Tabela roles não encontrada');
    } else {
      // Verificar se a coluna active existe na tabela roles
      const hasActiveColumn = await db.schema.hasColumn('roles', 'active');
      
      if (!hasActiveColumn) {
        console.log('⚠️ Coluna active não encontrada na tabela roles. Adicionando...');
        
        await db.schema.alterTable('roles', (table) => {
          table.boolean('active').defaultTo(true);
        });
        
        console.log('✅ Coluna active adicionada com sucesso à tabela roles');
      } else {
        console.log('✅ Coluna active já existe na tabela roles');
      }
      
      // Verificar se a coluna permissions existe na tabela roles
      const hasPermissionsColumn = await db.schema.hasColumn('roles', 'permissions');
      
      if (!hasPermissionsColumn) {
        console.log('⚠️ Coluna permissions não encontrada na tabela roles. Adicionando...');
        
        await db.schema.alterTable('roles', (table) => {
          table.jsonb('permissions').defaultTo('[]');
        });
        
        console.log('✅ Coluna permissions adicionada com sucesso à tabela roles');
      } else {
        console.log('✅ Coluna permissions já existe na tabela roles');
      }
    }
    
    console.log('✨ Verificação de colunas faltantes concluída!');
  } catch (error) {
    console.error('❌ Erro ao verificar/adicionar colunas:', error);
    process.exit(1);
  } finally {
    // Fechar conexão com o banco de dados
    await db.destroy();
  }
}

// Executar o script
addMissingColumns().catch(error => {
  console.error('❌ Erro geral:', error);
  process.exit(1);
}); 