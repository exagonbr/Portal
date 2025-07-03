import pkg from 'knex';
const { knex: setupKnex } = pkg;
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import knexfile from '../backend/knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const pg = setupKnex(knexfile[environment]);

const tableMapping: { [mysqlTable: string]: string } = {
  'institution': 'institutions',
  'user': 'user',
  'unit': 'units',
  'school': 'schools',
  'course': 'courses',
  'lesson': 'lessons',
  'class': 'classes',
  'enrollment': 'enrollments',
  'assignment': 'assignments',
  'submission': 'submissions',
  'quiz': 'quizzes',
  'quiz_attempt': 'quiz_attempts',
  'book': 'books',
  'study_group': 'study_groups',
  'group_member': 'group_members',
  'forum_category': 'forum_categories',
  'forum_topic': 'forum_topics',
  'forum_reply': 'forum_replies',
  'notification': 'notifications',
  'user_notification': 'user_notifications',
  'report': 'reports',
  'certificate': 'certificates',
  'tv_show': 'tv_show',
};

async function migrateTable(mysqlTableName: string, pgTableName: string, mysqlConn: mysql.Connection, pgConn: any, transform?: (row: any) => Promise<any>) {
  console.log(`🔄 Migrating from MySQL '${mysqlTableName}' to PostgreSQL '${pgTableName}'...`);
  
  try {
    const [mysqlRows] = await mysqlConn.execute(`SELECT * FROM \`${mysqlTableName}\``);
    
    if ((mysqlRows as any[]).length === 0) {
      console.log(`- Table ${mysqlTableName} is empty in MySQL. Skipping.`);
      return;
    }

    const pgIds = (await pgConn(pgTableName).select('id')).map((r: { id: any; }) => r.id);
    const newRows = (mysqlRows as any[]).filter(row => !pgIds.includes(row.id));

    if (newRows.length === 0) {
      console.log(`- No new rows to migrate for ${pgTableName}.`);
      return;
    }

    console.log(`- Found ${newRows.length} new rows for ${pgTableName}.`);

    const transformedRows = transform ? await Promise.all(newRows.map(transform)) : newRows;

    await pgConn(pgTableName).insert(transformedRows).onConflict('id').merge();
    console.log(`✅ Table ${pgTableName} migrated successfully.`);
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.warn(`- Warning: Table '${mysqlTableName}' does not exist in MySQL. Skipping.`);
    } else {
      throw error;
    }
  }
}

async function main() {
  console.log('🚀 Starting comprehensive data migration from MySQL to PostgreSQL...');

  const mysqlConnection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'sabercon',
  });

  try {
    for (const [mysqlTable, pgTable] of Object.entries(tableMapping)) {
      let transformFunc;
      if (pgTable === 'user') {
        transformFunc = async (row: any) => {
          if (row.password && !row.password.startsWith('$2')) {
            row.password = await bcrypt.hash(row.password, 12);
          }
          return {
            id: row.id,
            email: row.email,
            name: row.name,
            password: row.password,
            role: row.role || 'STUDENT',
            avatar: row.avatar,
            phone: row.phone,
            is_active: row.is_active,
            email_verified: row.email_verified,
            last_login: row.last_login,
            institution_id: row.institution_id,
            school_id: row.school_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        };
      } else if (pgTable === 'institutions') {
        transformFunc = async (row: any) => {
          return {
            id: row.id,
            name: row.name,
            slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
            description: row.description,
            logo: row.logo,
            website: row.website,
            phone: row.phone,
            email: row.email,
            address: row.address ? JSON.parse(row.address) : null,
            settings: row.settings ? JSON.parse(row.settings) : null,
            is_active: row.is_active,
            created_at: row.created_at || row.date_created,
            updated_at: row.updated_at || row.last_updated,
          };
        };
      }
      await migrateTable(mysqlTable, pgTable, mysqlConnection, pg, transformFunc);
    }

    console.log('🎉 Comprehensive data migration completed successfully.');
  } catch (error) {
    console.error('💥 Error during data migration:', error);
    process.exit(1);
  } finally {
    await mysqlConnection.end();
    await pg.destroy();
  }
}

main();