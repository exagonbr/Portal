#!/usr/bin/env ts-node

import * as mysql from 'mysql2/promise';

const mysqlConfig = {
  host: 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'sabercon',
  password: 'gWg28m8^vffI9X#',
  database: 'sabercon'
};

async function checkTables() {
  const connection = await mysql.createConnection(mysqlConfig);

  try {
    const tables = [
      'role',
      'user',
      'tv_show',
      'educational_stage',
      'unit_class',
      'file',
      'tag',
      'user_activity'
    ];

    for (const table of tables) {
      console.log(`\nTable: ${table}`);
      console.log('='.repeat(40));
      
      const [columns] = await connection.execute(`SHOW COLUMNS FROM ${table}`);
      console.log(columns);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkTables().catch(console.error);
