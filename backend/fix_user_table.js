#!/usr/bin/env node

console.log('🔧 Iniciando correção da tabela user...');

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portal_sabercon',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
});

async function fixUserTable() {
  const client = await pool.connect();
  
  try {
    console.log('📋 Criando tabela user...');
    
    // Criar tabela user
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        full_name VARCHAR(255),
        name VARCHAR(255),
        enabled BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        is_admin BOOLEAN DEFAULT false,
        is_manager BOOLEAN DEFAULT false,
        is_teacher BOOLEAN DEFAULT false,
        is_student BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Tabela user criada com sucesso!');
    
    // Inserir usuário admin se não existir
    const adminExists = await client.query('SELECT id FROM "user" WHERE email = $1', ['admin@sabercon.com']);
    
    if (adminExists.rows.length === 0) {
      await client.query(`
        INSERT INTO "user" (email, password, full_name, name, enabled, is_active, is_admin) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ['admin@sabercon.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'Admin', true, true, true]);
      
      console.log('👤 Usuário admin criado: admin@sabercon.com');
    } else {
      console.log('👤 Usuário admin já existe');
    }
    
    // Verificar se a tabela foi criada
    const result = await client.query('SELECT COUNT(*) FROM "user"');
    console.log(`📊 Total de usuários: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixUserTable().catch(console.error); 