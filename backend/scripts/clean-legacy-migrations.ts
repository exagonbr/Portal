/**
 * Script para limpar migrações legadas desnecessárias
 * Uso: ts-node backend/scripts/clean-legacy-migrations.ts
 */

import fs from 'fs';
import path from 'path';
import knex from 'knex';
import dotenv from 'dotenv';
import knexConfig from '../knexfile';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar conexão com o banco de dados
const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

// Arquivos de migração a serem excluídos
const migrationsToDelete = [
  // Migrações do MySQL legadas
  '20250601112600_create_roles_from_mysql.ts',
  '20250601115008_create_roles_from_mysql.ts',
  
  // Seeds legados
  '20250601115008_roles_data_from_mysql.ts',
  '20250601115011_user_roles_data_from_mysql.ts',
  
  // Migrações antigas que foram substituídas
  '20250201000001_update_roles_table_for_typeorm.ts'
];

// Diretórios a serem verificados
const directories = [
  path.resolve(__dirname, '../migrations'),
  path.resolve(__dirname, '../seeds')
];

async function cleanMigrations() {
  console.log('🧹 Iniciando limpeza de migrações legadas...');
  
  // Remover arquivos físicos
  for (const directory of directories) {
    console.log(`\n📁 Verificando diretório: ${directory}`);
    
    if (!fs.existsSync(directory)) {
      console.log(`❌ Diretório não encontrado: ${directory}`);
      continue;
    }
    
    const files = fs.readdirSync(directory);
    
    for (const fileToDelete of migrationsToDelete) {
      if (files.includes(fileToDelete)) {
        const filePath = path.join(directory, fileToDelete);
        
        try {
          fs.unlinkSync(filePath);
          console.log(`✅ Arquivo excluído: ${fileToDelete}`);
        } catch (error) {
          console.error(`❌ Erro ao excluir ${fileToDelete}:`, error);
        }
      }
    }
  }
  
  // Remover registros da tabela knex_migrations
  console.log('\n🗄️  Removendo registros da tabela knex_migrations...');
  
  try {
    // Verificar se a tabela existe
    const hasTable = await db.schema.hasTable('knex_migrations');
    
    if (!hasTable) {
      console.log('ℹ️  Tabela knex_migrations não encontrada no banco de dados');
    } else {
      for (const migration of migrationsToDelete) {
        // Remover .ts da extensão para comparar com o nome no banco
        const migrationName = migration.replace('.ts', '');
        
        // Buscar e deletar o registro da migração
        const deleted = await db('knex_migrations')
          .where('name', 'like', `%${migrationName}%`)
          .del();
        
        if (deleted > 0) {
          console.log(`✅ Registro da migração ${migrationName} removido do banco de dados`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao remover registros da tabela knex_migrations:', error);
  }
  
  console.log('\n✨ Limpeza de migrações legadas concluída!');
  console.log('✅ As migrações antigas foram removidas com sucesso.');
  console.log('ℹ️  As novas migrações já estão prontas para uso.');
  
  // Fechar conexão com o banco de dados
  await db.destroy();
}

// Executar a limpeza
cleanMigrations().catch(error => {
  console.error('❌ Erro ao limpar migrações:', error);
  process.exit(1);
}); 