#!/usr/bin/env ts-node

import * as mysql from 'mysql2/promise';

const mysqlConfig = {
  host: 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'sabercon',
  password: 'gWg28m8^vffI9X#',
  database: 'sabercon'
};

async function checkViewingStatus() {
  const connection = await mysql.createConnection(mysqlConfig);

  try {
    console.log('\nChecking viewing_status table structure:');
    console.log('=====================================');
    
    // First check if the table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'viewing_status'
    `, [mysqlConfig.database]);
    
    if (Array.isArray(tables) && tables.length === 0) {
      console.log('Table viewing_status does not exist!');
      return;
    }

    // Get table columns
    const [columns] = await connection.execute(`SHOW COLUMNS FROM viewing_status`);
    console.log('Columns:', columns);

    // Get a sample row
    const [sampleRow] = await connection.execute(`
      SELECT * FROM viewing_status LIMIT 1
    `);
    console.log('\nSample row:', sampleRow);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkViewingStatus().catch(console.error);
