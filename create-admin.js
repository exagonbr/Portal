const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'portal_sabercon',
  user: 'postgres',
  password: 'root',
});

async function createSimpleAdmin() {
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');
    
    // Verificar se a tabela user existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('📋 Criando tabela user...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS "user" (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255),
          full_name VARCHAR(255),
          enabled BOOLEAN DEFAULT true,
          is_admin BOOLEAN DEFAULT false,
          is_manager BOOLEAN DEFAULT false,
          is_teacher BOOLEAN DEFAULT false,
          is_student BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela user criada!');
    }
    
    // Inserir usuário admin
    await client.query(`
      INSERT INTO "user" (email, password, full_name, enabled, is_admin)
      VALUES ('admin@sabercon.edu.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', 'Administrador do Sistema', true, true)
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        enabled = true,
        is_admin = true;
    `);
    
    console.log('✅ Usuário admin criado/atualizado!');
    console.log('📧 Email: admin@sabercon.edu.br');
    console.log('🔑 Senha: password123');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

createSimpleAdmin(); 