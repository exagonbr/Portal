const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portal_sabercon',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].now);
    
    // Test if activity_sessions table exists
    const tableCheck = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'activity_sessions' ORDER BY ordinal_position"
    );
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ activity_sessions table exists with columns:');
      tableCheck.rows.forEach(row => {
        console.log(`  - ${row.column_name}`);
      });
    } else {
      console.log('❌ activity_sessions table not found');
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
