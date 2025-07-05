const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'portal_sabercon',
  user: 'postgres',
  password: 'root',
});

async function createUsersTable() {
  try {
    await client.connect();
    console.log('Conectado ao PostgreSQL');
    
    const sql = `
      CREATE TABLE IF NOT EXISTS "users" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        full_name VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        is_admin BOOLEAN DEFAULT false,
        is_manager BOOLEAN DEFAULT false,
        is_teacher BOOLEAN DEFAULT false,
        is_student BOOLEAN DEFAULT false,
        institution_id INTEGER,
        role_id INTEGER,
        address VARCHAR(255),
        phone VARCHAR(255),
        username VARCHAR(255) UNIQUE,
        google_id VARCHAR(255) UNIQUE,
        profile_image VARCHAR(500),
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(sql);
    console.log('Tabela users criada!');
    
    const insertSql = `
      INSERT INTO "users" (email, password, full_name, enabled, is_admin, is_manager, is_teacher, is_student)
      VALUES ('admin@sabercon.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', true, true, false, false, false)
      ON CONFLICT (email) DO NOTHING;
    `;
    
    await client.query(insertSql);
    console.log('Usuário admin criado!');
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await client.end();
  }
}

createUsersTable(); 