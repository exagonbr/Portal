import pkg from 'knex';
const { knex: setupKnex } = pkg;
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import knexfile from '../backend/knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const pg = setupKnex(knexfile[environment]);

async function migrateTable(tableName: string, mysqlConn: mysql.Connection, pgConn: any, transform?: (row: any) => Promise<any>) {
  console.log(`🔄 Migrating table: ${tableName}...`);
  const [mysqlRows] = await mysqlConn.execute(`SELECT * FROM ${tableName}`);
  
  if ((mysqlRows as any[]).length === 0) {
    console.log(`- Table ${tableName} is empty in MySQL. Skipping.`);
    return;
  }

  const pgIds = (await pgConn(tableName).select('id')).map((r: { id: any; }) => r.id);
  const newRows = (mysqlRows as any[]).filter(row => !pgIds.includes(row.id));

  if (newRows.length === 0) {
    console.log(`- No new rows to migrate for ${tableName}.`);
    return;
  }

  console.log(`- Found ${newRows.length} new rows for ${tableName}.`);

  const transformedRows = transform ? await Promise.all(newRows.map(transform)) : newRows;

  await pgConn(tableName).insert(transformedRows).onConflict('id').merge();
  console.log(`✅ Table ${tableName} migrated successfully.`);
}

async function main() {
  console.log('🚀 Starting comprehensive data migration from MySQL to PostgreSQL...');

  const mysqlConnection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'old_database',
  });

  try {
    const tables = [
      'institutions', 'schools', 'user', 'courses', 'units', 'lessons',
      'classes', 'enrollments', 'assignments', 'submissions', 'quizzes',
      'quiz_attempts', 'books', 'study_groups', 'group_members',
      'forum_categories', 'forum_topics', 'forum_replies', 'notifications',
      'user_notifications', 'reports', 'certificates', 'tv_show'
    ];

    for (const table of tables) {
      let transformFunc;
      if (table === 'user') {
        transformFunc = async (row: any) => {
          if (row.password && !row.password.startsWith('$2')) {
            row.password = await bcrypt.hash(row.password, 12);
          }
          return row;
        };
      }
      await migrateTable(table, mysqlConnection, pg, transformFunc);
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