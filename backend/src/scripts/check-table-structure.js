const knex = require('knex');
const knexConfig = require('../../knexfile');

async function checkTableStructure() {
  const db = knex(knexConfig.development);
  
  try {
    console.log('🔍 Verificando estrutura das tabelas...\n');
    
    // Tabelas para verificar
    const tables = ['cookie_signed', 'target_audiences', 'themes', 'user'];
    
    for (const table of tables) {
      console.log(`📋 Tabela: ${table}`);
      console.log('─'.repeat(50));
      
      const columns = await db.raw(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = ?
        ORDER BY ordinal_position
      `, [table]);
      
      if (columns.rows.length === 0) {
        console.log(`❌ Tabela '${table}' não encontrada\n`);
      } else {
        columns.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });
        console.log();
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error.message);
  } finally {
    await db.destroy();
  }
}

checkTableStructure();