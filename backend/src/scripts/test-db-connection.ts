import { AppDataSource } from '../config/typeorm.config';

async function testConnection() {
  try {
    const connection = await AppDataSource.initialize();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await connection.query('SELECT NOW()');
    console.log('✅ Query test successful:', result[0]);
    
    await connection.destroy();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection().catch(console.error);
