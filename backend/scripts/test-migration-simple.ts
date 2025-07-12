import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testMigration() {
  console.log('🔍 Testing MySQL to PostgreSQL migration...');
  
  // Test MySQL connection
  try {
    const mysqlConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
      user: process.env.MYSQL_USER || 'sabercon',
      password: process.env.MYSQL_PASSWORD || 'gWg28m8^vffI9X#',
      database: process.env.MYSQL_DATABASE || 'sabercon',
      port: Number(process.env.MYSQL_PORT) || 3306
    });
    
    console.log('✅ MySQL connection successful');
    
    // Test query
    const [rows] = await mysqlConnection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`📊 MySQL users count: ${(rows as any[])[0].count}`);
    
    await mysqlConnection.end();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
  }
  
  // Test PostgreSQL connection
  try {
    const pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'portal_sabercon',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
    });
    
    console.log('✅ PostgreSQL connection successful');
    
    // Test if users table exists
    const result = await pgPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (result.rows[0].exists) {
      const countResult = await pgPool.query('SELECT COUNT(*) as count FROM users');
      console.log(`📊 PostgreSQL users count: ${countResult.rows[0].count}`);
    } else {
      console.log('⚠️ Users table not found in PostgreSQL');
    }
    
    await pgPool.end();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
  }
}

testMigration().catch(console.error);
