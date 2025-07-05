const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'portal_sabercon',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
});

async function createUserTable() {
  const client = await pool.connect();
  try {
    console.log('🔧 Criando tabela user...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        full_name VARCHAR(255),
        enabled BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Tabela user criada com sucesso!');
    
    // Inserir um usuário teste se não existir
    await client.query(`
      INSERT INTO "user" (email, password, full_name, enabled, is_active)
      VALUES ('admin@sabercon.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', true, true)
      ON CONFLICT (email) DO NOTHING;
    `);
    
    console.log('✅ Usuário admin criado!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createUserTable(); 