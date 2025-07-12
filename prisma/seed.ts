import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanupTables() {
  console.log('🗑️ Limpando tabelas existentes...');
  const tablesToClean = [
    'tv_show',
    'activity_sessions',
    'activity_submissions',
    'activities',
    'schools',
    'users'
  ];

  for (const table of tablesToClean) {
    try {
      const deleteQuery = `DELETE FROM "${table}";`;
      await prisma.$executeRawUnsafe(deleteQuery);
      // Reset the sequence if it exists
      try {
        await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${table}_id_seq" RESTART WITH 1;`);
      } catch (e) {
        // Ignore error if sequence doesn't exist
      }
      console.log(`✓ Tabela ${table} limpa com sucesso`);
    } catch (error) {
      console.warn(`⚠️ Erro ao limpar tabela ${table}:`, error);
    }
  }
}

async function migrateTable(connection: mysql.Connection, tableName: string, transformer: (data: any) => any) {
  try {
    console.log(`Migrando tabela ${tableName}...`);
    const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
    for (const row of rows as any[]) {
      const transformedData = transformer(row);
      await prisma[tableName].create({ data: transformedData });
    }
    console.log(`Tabela ${tableName} migrada com sucesso!`);
  } catch (error) {
    console.error(`Erro ao migrar tabela ${tableName}:`, error);
    throw error;
  }
}

async function main() {
  let mysqlConnection;
  try {
    // Limpar tabelas existentes primeiro
    await cleanupTables();

    // Configuração da conexão MySQL
    mysqlConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'old_database',
      dateStrings: true // Para lidar corretamente com datas
    });

    try {
      // Migrar usuários
      await migrateTable(mysqlConnection, 'users', (user: any) => ({
        email: user.email,
        full_name: user.name || user.full_name || 'Nome não informado',
        password: user.password.startsWith('$2') ? user.password : bcrypt.hashSync(user.password, 10),
        is_admin: false,
        is_manager: false,
        is_student: user.is_student || false,
        is_teacher: user.is_teacher || true,
        enabled: user.is_active || true,
        phone: user.phone || null,
        institution_id: user.institution_id || null,
      }));

      // Migrar atividades
      await migrateTable(mysqlConnection, 'activities', (activity: any) => ({
        title: activity.title,
        description: activity.description,
        type: activity.type,
        course_id: activity.course_id,
        class_id: activity.class_id,
        teacher_id: activity.teacher_id,
        due_date: new Date(activity.due_date),
        points: activity.points || 100,
        instructions: activity.instructions,
        attachments: activity.attachments ? JSON.parse(activity.attachments) : null,
        allow_late_submission: activity.allow_late_submission || false,
        active: activity.active !== false,
      }));

      // Migrar submissões de atividades
      await migrateTable(mysqlConnection, 'activity_submissions', (submission: any) => ({
        activity_id: submission.activity_id,
        student_id: submission.student_id,
        content: submission.content,
        attachments: submission.attachments ? JSON.parse(submission.attachments) : null,
        submitted_at: new Date(submission.submitted_at),
        last_modified_at: submission.last_modified_at ? new Date(submission.last_modified_at) : null,
        status: submission.status || 'submitted',
      }));

      // Migrar sessões de atividade
      await migrateTable(mysqlConnection, 'activity_sessions', (session: any) => ({
        session_id: session.session_id,
        user_id: session.user_id,
        start_time: session.start_time ? new Date(session.start_time) : new Date(),
        end_time: session.end_time ? new Date(session.end_time) : null,
        duration_seconds: session.duration_seconds,
        page_views: session.page_views || 0,
        actions_count: session.actions_count || 0,
        ip_address: session.ip_address,
        user_agent: session.user_agent,
        device_info: session.device_info ? JSON.parse(session.device_info) : null,
        is_active: session.is_active !== false,
        last_activity: session.last_activity ? new Date(session.last_activity) : new Date(),
      }));

      // Migrar unidades escolares
      await migrateTable(mysqlConnection, 'schools', (unit: any) => ({
        name: unit.name,
        institution_id: unit.institution_id || null,
        institution_name: unit.institution_name || null,
      }));

      // Migrar shows de TV
      await migrateTable(mysqlConnection, 'tv_show', (show: any) => ({
        api_id: show.api_id,
        backdrop_image_id: show.backdrop_image_id,
        backdrop_path: show.backdrop_path,
        contract_term_end: new Date(show.contract_term_end),
        date_created: new Date(show.date_created),
        deleted: show.deleted || false,
        first_air_date: new Date(show.first_air_date),
        imdb_id: show.imdb_id,
        last_updated: new Date(show.last_updated),
        manual_input: show.manual_input || false,
        manual_support_id: show.manual_support_id,
        manual_support_path: show.manual_support_path,
        name: show.name,
        original_language: show.original_language,
        overview: show.overview,
        popularity: show.popularity,
        poster_image_id: show.poster_image_id,
        poster_path: show.poster_path,
        producer: show.producer,
        vote_average: show.vote_average,
        vote_count: show.vote_count,
        total_load: show.total_load,
      }));

      console.log('Migração concluída com sucesso!');
    } catch (error) {
      console.error('Erro durante a migração:', error);
      throw error;
    } finally {
      await mysqlConnection.end();
    }
  } catch (error) {
    console.error('Erro ao conectar ao MySQL:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });