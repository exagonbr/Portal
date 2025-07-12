import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
  user: process.env.MYSQL_USER || 'sabercon',
  password: process.env.MYSQL_PASSWORD || 'gWg28m8^vffI9X#',
  database: process.env.MYSQL_DATABASE || 'sabercon',
  port: Number(process.env.MYSQL_PORT) || 3306
};

const POSTGRES_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'portal_sabercon',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
};

async function runMigration() {
  console.log('🚀 Starting MySQL to PostgreSQL migration...');
  
  let mysqlConnection: mysql.Connection | undefined;
  let pgPool: Pool | undefined;
  
  try {
    // Connect to MySQL
    console.log('📡 Connecting to MySQL...');
    mysqlConnection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ MySQL connected');
    
    // Connect to PostgreSQL
    console.log('📡 Connecting to PostgreSQL...');
    pgPool = new Pool(POSTGRES_CONFIG);
    await pgPool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected');
    
    // Get list of tables from MySQL
    console.log('📋 Getting MySQL tables...');
    const [tables] = await mysqlConnection.execute('SHOW TABLES');
    const tableNames = (tables as any[]).map(row => Object.values(row)[0]);
    console.log(`📊 Found ${tableNames.length} tables:`, tableNames);
    
    // Start migration process
    for (const tableName of tableNames.slice(0, 5)) { // Limit to first 5 tables for testing
      console.log(`\n🔄 Migrating table: ${tableName}`);
      
      try {
        // Get table structure
        const [columns] = await mysqlConnection.execute(`DESCRIBE ${tableName}`);
        console.log(`📏 Table ${tableName} has ${(columns as any[]).length} columns`);
        
        // Create PostgreSQL table (simplified)
        let createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (`;
        const columnDefs = (columns as any[]).map((col: any) => {
          let pgType = convertMySQLTypeToPostgreSQL(col.Type);
          let nullable = col.Null === 'YES' ? '' : ' NOT NULL';
          let defaultVal = col.Default ? ` DEFAULT ${col.Default}` : '';
          
          return `"${col.Field}" ${pgType}${nullable}${defaultVal}`;
        });
        
        createTableSQL += columnDefs.join(', ') + ')';
        
        console.log(`📝 Creating table: ${tableName}`);
        await pgPool.query(createTableSQL);
        
        // Copy data (first 100 rows for testing)
        const [rows] = await mysqlConnection.execute(`SELECT * FROM ${tableName} LIMIT 100`);
        if ((rows as any[]).length > 0) {
          console.log(`📦 Copying ${(rows as any[]).length} rows...`);
          
          const columnNames = (columns as any[]).map((col: any) => `"${col.Field}"`);
          const placeholders = columnNames.map((_, i) => `$${i + 1}`).join(', ');
          
          const insertSQL = `INSERT INTO "${tableName}" (${columnNames.join(', ')}) VALUES (${placeholders})`;
          
          for (const row of rows as any[]) {
            try {
              const values = Object.values(row);
              await pgPool.query(insertSQL, values);
            } catch (rowError) {
              console.log(`⚠️ Error inserting row: ${rowError}`);
            }
          }
        }
        
        console.log(`✅ Table ${tableName} migrated successfully`);
        
      } catch (tableError) {
        console.error(`❌ Error migrating table ${tableName}:`, tableError);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (mysqlConnection) await mysqlConnection.end();
    if (pgPool) await pgPool.end();
  }
}

function convertMySQLTypeToPostgreSQL(mysqlType: string): string {
  const type = mysqlType.toLowerCase();
  
  if (type.includes('int')) return 'INTEGER';
  if (type.includes('bigint')) return 'BIGINT';
  if (type.includes('varchar')) return 'VARCHAR(255)';
  if (type.includes('text')) return 'TEXT';
  if (type.includes('datetime')) return 'TIMESTAMP';
  if (type.includes('timestamp')) return 'TIMESTAMP';
  if (type.includes('date')) return 'DATE';
  if (type.includes('time')) return 'TIME';
  if (type.includes('decimal')) return 'DECIMAL';
  if (type.includes('float')) return 'REAL';
  if (type.includes('double')) return 'DOUBLE PRECISION';
  if (type.includes('tinyint(1)')) return 'BOOLEAN';
  if (type.includes('tinyint')) return 'SMALLINT';
  if (type.includes('char')) return 'CHAR(255)';
  if (type.includes('blob')) return 'BYTEA';
  if (type.includes('json')) return 'JSON';
  
  return 'TEXT'; // Default fallback
}

// Run migration
runMigration().catch(console.error);
