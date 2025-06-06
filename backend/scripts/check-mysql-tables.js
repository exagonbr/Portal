const mysql = require('mysql2/promise');

const config = {
  host: 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'sabercon',
  password: 'gWg28m8^vffI9X#',
  database: 'sabercon'
};

async function listAllTables() {
  const connection = await mysql.createConnection(config);
  try {
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('=== ALL MYSQL TABLES ===');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${Object.values(table)[0]}`);
    });
    
    // Check for certificate related tables
    console.log('\n=== CERTIFICATE RELATED TABLES ===');
    const [certTables] = await connection.execute("SHOW TABLES LIKE '%cert%'");
    certTables.forEach(table => {
      console.log(Object.values(table)[0]);
    });
    
    // Check for any other assessment/achievement tables
    console.log('\n=== ASSESSMENT/ACHIEVEMENT TABLES ===');
    const [assessTables] = await connection.execute("SHOW TABLES LIKE '%assess%'");
    assessTables.forEach(table => {
      console.log(Object.values(table)[0]);
    });
    
    const [achieveTables] = await connection.execute("SHOW TABLES LIKE '%achieve%'");
    achieveTables.forEach(table => {
      console.log(Object.values(table)[0]);
    });
    
    const [awardTables] = await connection.execute("SHOW TABLES LIKE '%award%'");
    awardTables.forEach(table => {
      console.log(Object.values(table)[0]);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

listAllTables();
