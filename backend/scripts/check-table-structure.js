const mysql = require('mysql2/promise');

const config = {
  host: 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'sabercon',
  password: 'gWg28m8^vffI9X#',
  database: 'sabercon'
};

async function checkTableStructures() {
  const connection = await mysql.createConnection(config);
  try {
    // Check video table structure
    console.log('=== VIDEO TABLE STRUCTURE ===');
    const [videoColumns] = await connection.execute('DESCRIBE video');
    videoColumns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });
    
    // Check certificate table structure
    console.log('\n=== CERTIFICATE TABLE STRUCTURE ===');
    const [certColumns] = await connection.execute('DESCRIBE certificate');
    certColumns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });
    
    // Check question table structure
    console.log('\n=== QUESTION TABLE STRUCTURE ===');
    const [questionColumns] = await connection.execute('DESCRIBE question');
    questionColumns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });
    
    // Check answer table structure
    console.log('\n=== ANSWER TABLE STRUCTURE ===');
    const [answerColumns] = await connection.execute('DESCRIBE answer');
    answerColumns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });
    
    // Check user_answer table structure
    console.log('\n=== USER_ANSWER TABLE STRUCTURE ===');
    const [userAnswerColumns] = await connection.execute('DESCRIBE user_answer');
    userAnswerColumns.forEach(col => {
      console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });
    
    // Check if there are any notification tables
    console.log('\n=== NOTIFICATION RELATED TABLES ===');
    const [notifTables] = await connection.execute("SHOW TABLES LIKE '%notif%'");
    notifTables.forEach(table => {
      console.log(Object.values(table)[0]);
    });
    
    // Check notification_queue structure if it exists
    if (notifTables.length > 0) {
      console.log('\n=== NOTIFICATION_QUEUE TABLE STRUCTURE ===');
      const [notifColumns] = await connection.execute('DESCRIBE notification_queue');
      notifColumns.forEach(col => {
        console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkTableStructures();
