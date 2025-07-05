const knex = require('knex');
const knexConfigFile = require('../knexfile.js');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

// Obter a configuração correta do knexfile
const knexConfig = knexConfigFile.default || knexConfigFile;

async function checkTableStructure() {
  console.log('🔍 VERIFICANDO ESTRUTURA DAS TABELAS\n');
  
  let db = null;
  
  try {
    // Conectar ao banco
    console.log('🔌 Conectando ao banco de dados...');
    db = knex(knexConfig.development);
    console.log('✅ Conectado ao PostgreSQL!\n');
    
    // Verificar se as tabelas existem
    const tables = ['user', 'User', 'users', 'roles', 'institution'];
    
    for (const tableName of tables) {
      const exists = await db.schema.hasTable(tableName);
      console.log(`📋 Tabela "${tableName}": ${exists ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
      
      if (exists) {
        try {
          // Obter informações das colunas
          const columns = await db(tableName).columnInfo();
          console.log(`   📊 Colunas da tabela "${tableName}":`);
          
          Object.keys(columns).forEach(colName => {
            const col = columns[colName];
            console.log(`      • ${colName}: ${col.type} ${col.nullable ? '(nullable)' : '(not null)'} ${col.defaultValue ? `default: ${col.defaultValue}` : ''}`);
          });
          
          // Verificar se há dados na tabela
          const count = await db(tableName).count('* as total').first();
          console.log(`   📈 Registros: ${count.total}`);
          
        } catch (error) {
          console.log(`   ❌ Erro ao obter informações da tabela ${tableName}: ${error.message}`);
        }
      }
      console.log('');
    }
    
    // Verificar constraints e índices
    console.log('🔗 VERIFICANDO CONSTRAINTS E ÍNDICES\n');
    
    try {
      // Verificar foreign keys
      const foreignKeys = await db.raw(`
        SELECT 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE 
          tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name IN ('user', 'User', 'users')
      `);
      
      console.log('🔗 Foreign Keys encontradas:');
      foreignKeys.rows.forEach(fk => {
        console.log(`   • ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
      
    } catch (error) {
      console.log(`❌ Erro ao verificar foreign keys: ${error.message}`);
    }
    
    // Verificar tipos de dados específicos
    console.log('\n🔍 VERIFICANDO TIPOS DE DADOS ESPECÍFICOS\n');
    
    try {
      const dataTypes = await db.raw(`
        SELECT 
          table_name, 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM 
          information_schema.columns 
        WHERE 
          table_name IN ('user', 'User', 'users', 'roles', 'institution')
          AND column_name IN ('id', 'role_id', 'institution_id', 'user_id')
        ORDER BY 
          table_name, column_name
      `);
      
      console.log('📊 Tipos de dados das colunas de ID:');
      dataTypes.rows.forEach(col => {
        console.log(`   • ${col.table_name}.${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${col.column_default ? `default: ${col.column_default}` : ''}`);
      });
      
    } catch (error) {
      console.log(`❌ Erro ao verificar tipos de dados: ${error.message}`);
    }
    
  } catch (error) {
    console.log('\n❌ ERRO DURANTE A VERIFICAÇÃO:');
    console.log(error.message);
    console.log('\nStack trace:');
    console.log(error.stack);
  } finally {
    // Fechar conexão
    if (db) {
      await db.destroy();
    }
  }
}

// Executar script
if (require.main === module) {
  checkTableStructure()
    .then(() => {
      console.log('\n✅ Verificação finalizada.');
      process.exit(0);
    })
    .catch(err => {
      console.log('\n❌ Erro fatal:', err.message);
      process.exit(1);
    });
}

module.exports = { checkTableStructure }; 