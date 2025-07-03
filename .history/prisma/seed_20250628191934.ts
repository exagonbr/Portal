import { knex as setupKnex } from 'knex';
import bcrypt from 'bcrypt';
import { knexfile } from '../backend/knexfile';

// Determine o ambiente (development, production, etc.)
const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];
const db = setupKnex(config);

async function main() {
  console.log('Start seeding with Knex...');

  try {
    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = [
      {
        email: 'admin@sabercon.edu.br',
        name: 'System Admin',
        password: hashedPassword,
        role: 'SYSTEM_ADMIN',
        is_active: true,
      },
      {
        email: 'institution@sabercon.edu.br',
        name: 'Institution Admin',
        password: hashedPassword,
        role: 'INSTITUTION_ADMIN',
        is_active: true,
      },
      {
        email: 'manager@sabercon.edu.br',
        name: 'School Manager',
        password: hashedPassword,
        role: 'SCHOOL_MANAGER',
        is_active: true,
      },
      {
        email: 'teacher@sabercon.edu.br',
        name: 'Teacher',
        password: hashedPassword,
        role: 'TEACHER',
        is_active: true,
      },
      {
        email: 'student@sabercon.edu.br',
        name: 'Student',
        password: hashedPassword,
        role: 'STUDENT',
        is_active: true,
      },
      {
        email: 'guardian@sabercon.edu.br',
        name: 'Guardian',
        password: hashedPassword,
        role: 'GUARDIAN',
        is_active: true,
      },
    ];

    for (const userData of users) {
      await db('user')
        .insert(userData)
        .onConflict('email')
        .merge();
    }

    console.log('Seeding finished successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

main();