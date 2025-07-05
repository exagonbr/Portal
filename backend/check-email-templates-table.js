const { Pool } = require('pg');
require('dotenv').config();

async function checkTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING
  });

  try {
    console.log('Verificando se a tabela email_templates existe...');
    
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'email_templates'
      );
    `);
    
    const tableExists = result.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ A tabela email_templates JÁ EXISTE no banco de dados.');
      
      // Verificar a estrutura da tabela
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'email_templates';
      `);
      
      console.log('\nEstrutura da tabela:');
      columns.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('❌ A tabela email_templates NÃO EXISTE no banco de dados.');
    }
  } catch (error) {
    console.error('Erro ao verificar a tabela:', error);
  } finally {
    await pool.end();
  }
}

checkTable(); 