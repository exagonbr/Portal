import pkg from 'knex';
const { knex: setupKnex } = pkg;
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import knexfile from '../backend/knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const pg = setupKnex(knexfile[environment]);

async function main() {
  console.log('🚀 Discovering MySQL schema...');

  const mysqlConnection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'sabercon',
  });

  try {
    console.log('🔍 Fetching table list from MySQL...');
    const [tablesResult] = await mysqlConnection.execute('SHOW TABLES');
    const mysqlTableNames = (tablesResult as any[]).map(row => Object.values(row)[0]);
    
    console.log('✅ Found the following tables in MySQL database:');
    console.log(mysqlTableNames);
    console.log('Please use this list to adjust the migration script.');

  } catch (error) {
    console.error('💥 Error during MySQL schema discovery:', error);
    process.exit(1);
  } finally {
    await mysqlConnection.end();
    await pg.destroy();
  }
}

main();