import db from '../config/database';

beforeAll(async () => {
  try {
    // Enable uuid-ossp extension for uuid_generate_v4()
    await db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await db.raw('SELECT 1');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
});

afterAll(async () => {
  await db.destroy();
});
