import { knex as setupKnex } from 'knex';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { knexfile } from '../backend/knexfile';

const environment = process.env.NODE_ENV || 'development';
const pgConnection = setupKnex(knexfile[environment]);

async function main() {
  console.log('Starting data migration from MySQL to PostgreSQL...');

  const mysqlConnection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'old_database',
  });

  try {
    // 1. Migrate Institutions
    console.log('Migrating institutions...');
    const [mysqlInstitutions] = await mysqlConnection.execute('SELECT * FROM institutions');
    for (const institution of mysqlInstitutions as any[]) {
      await pgConnection('institutions').insert({
        id: institution.id,
        name: institution.name,
        slug: institution.slug || institution.name.toLowerCase().replace(/\s+/g, '-'),
        description: institution.description,
        logo: institution.logo,
        website: institution.website,
        phone: institution.phone,
        email: institution.email,
        address: institution.address ? JSON.parse(institution.address) : null,
        settings: institution.settings ? JSON.parse(institution.settings) : null,
        is_active: institution.is_active,
        created_at: institution.created_at,
        updated_at: institution.updated_at,
      }).onConflict('id').merge();
    }
    console.log('Institutions migrated.');

    // 2. Migrate Users
    console.log('Migrating users...');
    const [mysqlUsers] = await mysqlConnection.execute('SELECT * FROM users');
    for (const user of mysqlUsers as any[]) {
      const hashedPassword = user.password.startsWith('$2') ? user.password : await bcrypt.hash(user.password, 12);
      await pgConnection('user').insert({
        id: user.id,
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role || 'STUDENT',
        avatar: user.avatar,
        phone: user.phone,
        is_active: user.is_active,
        email_verified: user.email_verified,
        last_login: user.last_login,
        institution_id: user.institution_id,
        school_id: user.school_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }).onConflict('id').merge();
    }
    console.log('Users migrated.');

    console.log('Data migration completed successfully.');
  } catch (error) {
    console.error('Error during data migration:', error);
    process.exit(1);
  } finally {
    await mysqlConnection.end();
    await pgConnection.destroy();
  }
}

main();