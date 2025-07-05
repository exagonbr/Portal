const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco baseada nas variáveis de ambiente
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'portal',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log('🔄 Executando SQL...');
    
    const result = await pool.query(sql);
    console.log('✅ SQL executado com sucesso!');
    console.log('📋 Resultado:', result);
    
  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error);
  } finally {
    await pool.end();
  }
}

// Executar o arquivo SQL
const sqlFile = path.join(__dirname, 'add-profile-image-column.sql');
executeSQLFile(sqlFile); 