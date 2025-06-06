import mysql from 'mysql2/promise';
import { Knex } from 'knex';
import knex from 'knex';
import knexConfig from '../knexfile.js';

// MySQL connection configuration
const MYSQL_CONFIG = {
  host: 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'sabercon',
  password: 'gWg28m8^vffI9X#',
  database: 'sabercon'
};

// PostgreSQL connection
const pg = knex(knexConfig.development);

interface MigrationStats {
  table: string;
  migrated: number;
  errors: number;
  startTime: Date;
  endTime?: Date;
}

class UnifiedMySQLToPostgresMigrator {
  private mysqlConnection: mysql.Connection | null = null;
  private stats: MigrationStats[] = [];

  async connect(): Promise<void> {
    console.log('🔌 Connecting to MySQL database...');
    this.mysqlConnection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Connected to MySQL');
    
    console.log('🔌 Testing PostgreSQL connection...');
    await pg.raw('SELECT 1');
    console.log('✅ Connected to PostgreSQL');
  }

  async disconnect(): Promise<void> {
    if (this.mysqlConnection) {
      await this.mysqlConnection.end();
      console.log('🔌 Disconnected from MySQL');
    }
    await pg.destroy();
    console.log('🔌 Disconnected from PostgreSQL');
  }

  private async runMigrations(): Promise<void> {
    console.log('🚀 Running PostgreSQL migrations...');
    try {
      await pg.migrate.latest();
      console.log('✅ Migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  private async seedSampleData(): Promise<void> {
    console.log('🌱 Seeding sample data...');
    try {
      await pg.seed.run();
      console.log('✅ Sample data seeded successfully');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  private async migrateInstitutions(): Promise<Map<number, string>> {
    const stats: MigrationStats = {
      table: 'institutions',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating institutions...');
      
      const [institutions] = await this.mysqlConnection!.execute('SELECT * FROM institutions');
      const institutionMap = new Map<number, string>();

      for (const institution of institutions as any[]) {
        try {
          const [insertedId] = await pg('institutions').insert({
            name: institution.name,
            code: institution.code || null,
            description: institution.description || null,
            address: institution.address || null,
            city: institution.city || null,
            state: institution.state || null,
            zip_code: institution.zip_code || null,
            phone: institution.phone || null,
            email: institution.email || null,
            website: institution.website || null,
            status: institution.status || 'active',
            created_at: institution.created_at ? new Date(institution.created_at) : new Date(),
            updated_at: institution.updated_at ? new Date(institution.updated_at) : new Date()
          }).returning('id');

          institutionMap.set(institution.id, insertedId);
          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating institution ${institution.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ Institutions migrated: ${stats.migrated}, errors: ${stats.errors}`);
      
      return institutionMap;
    } catch (error) {
      console.error('❌ Failed to migrate institutions:', error);
      throw error;
    }
  }

  private async migrateSchools(institutionMap: Map<number, string>): Promise<Map<number, string>> {
    const stats: MigrationStats = {
      table: 'schools',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating schools...');
      
      const [schools] = await this.mysqlConnection!.execute('SELECT * FROM schools');
      const schoolMap = new Map<number, string>();

      for (const school of schools as any[]) {
        try {
          const [insertedId] = await pg('schools').insert({
            name: school.name,
            code: school.code || null,
            description: school.description || null,
            address: school.address || null,
            city: school.city || null,
            state: school.state || null,
            zip_code: school.zip_code || null,
            phone: school.phone || null,
            email: school.email || null,
            institution_id: institutionMap.get(school.institution_id) || null,
            status: school.status || 'active',
            created_at: school.created_at ? new Date(school.created_at) : new Date(),
            updated_at: school.updated_at ? new Date(school.updated_at) : new Date()
          }).returning('id');

          schoolMap.set(school.id, insertedId);
          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating school ${school.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ Schools migrated: ${stats.migrated}, errors: ${stats.errors}`);
      
      return schoolMap;
    } catch (error) {
      console.error('❌ Failed to migrate schools:', error);
      throw error;
    }
  }

  private async migrateRoles(): Promise<Map<number, string>> {
    const stats: MigrationStats = {
      table: 'roles',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating roles...');
      
      const [roles] = await this.mysqlConnection!.execute('SELECT * FROM roles');
      const roleMap = new Map<number, string>();

      for (const role of roles as any[]) {
        try {
          const [insertedId] = await pg('roles').insert({
            name: role.name,
            description: role.description || null,
            type: role.type || 'custom',
            status: role.status || 'active',
            created_at: role.created_at ? new Date(role.created_at) : new Date(),
            updated_at: role.updated_at ? new Date(role.updated_at) : new Date()
          }).returning('id');

          roleMap.set(role.id, insertedId);
          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating role ${role.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ Roles migrated: ${stats.migrated}, errors: ${stats.errors}`);
      
      return roleMap;
    } catch (error) {
      console.error('❌ Failed to migrate roles:', error);
      throw error;
    }
  }

  private async migrateUsers(
    institutionMap: Map<number, string>,
    schoolMap: Map<number, string>,
    roleMap: Map<number, string>
  ): Promise<Map<number, string>> {
    const stats: MigrationStats = {
      table: 'users',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating users...');
      
      const [users] = await this.mysqlConnection!.execute('SELECT * FROM users');
      const userMap = new Map<number, string>();

      for (const user of users as any[]) {
        try {
          const [insertedId] = await pg('users').insert({
            email: user.email,
            password: user.password,
            name: user.name,
            cpf: user.cpf || null,
            phone: user.phone || null,
            birth_date: user.birth_date ? new Date(user.birth_date) : null,
            address: user.address || null,
            city: user.city || null,
            state: user.state || null,
            zip_code: user.zip_code || null,
            is_active: user.is_active !== false,
            role_id: roleMap.get(user.role_id) || null,
            school_id: schoolMap.get(user.school_id) || null,
            institution_id: institutionMap.get(user.institution_id) || null,
            user_id_legacy: user.id, // Store original MySQL ID
            created_at: user.created_at ? new Date(user.created_at) : new Date(),
            updated_at: user.updated_at ? new Date(user.updated_at) : new Date()
          }).returning('id');

          userMap.set(user.id, insertedId);
          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating user ${user.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ Users migrated: ${stats.migrated}, errors: ${stats.errors}`);
      
      return userMap;
    } catch (error) {
      console.error('❌ Failed to migrate users:', error);
      throw error;
    }
  }

  private async migrateCollections(userMap: Map<number, string>, institutionMap: Map<number, string>): Promise<void> {
    const stats: MigrationStats = {
      table: 'collections',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating collections...');
      
      const [collections] = await this.mysqlConnection!.execute('SELECT * FROM collections');

      for (const collection of collections as any[]) {
        try {
          await pg('collections').insert({
            name: collection.name,
            description: collection.description || null,
            type: collection.type || 'mixed',
            created_by: userMap.get(collection.created_by) || null,
            created_by_legacy: collection.created_by, // Store original MySQL user ID
            institution_id: institutionMap.get(collection.institution_id) || null,
            is_public: collection.is_public !== false,
            items_count: collection.items_count || 0,
            tags: collection.tags ? JSON.parse(collection.tags) : [],
            created_at: collection.created_at ? new Date(collection.created_at) : new Date(),
            updated_at: collection.updated_at ? new Date(collection.updated_at) : new Date()
          });

          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating collection ${collection.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ Collections migrated: ${stats.migrated}, errors: ${stats.errors}`);
    } catch (error) {
      console.error('❌ Failed to migrate collections:', error);
      throw error;
    }
  }

  private async migrateFiles(userMap: Map<number, string>): Promise<void> {
    const stats: MigrationStats = {
      table: 'files',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating files...');
      
      const [files] = await this.mysqlConnection!.execute('SELECT * FROM files');

      for (const file of files as any[]) {
        try {
          await pg('files').insert({
            name: file.name,
            original_name: file.original_name || file.name,
            type: file.type || 'unknown',
            size: file.size || 0,
            size_formatted: file.size_formatted || '0B',
            bucket: file.bucket || 'default',
            s3_key: file.s3_key || null,
            s3_url: file.s3_url || null,
            description: file.description || null,
            category: file.category || 'general',
            uploaded_by: userMap.get(file.uploaded_by) || null,
            uploaded_by_legacy: file.uploaded_by, // Store original MySQL user ID
            is_active: file.is_active !== false,
            created_at: file.created_at ? new Date(file.created_at) : new Date(),
            updated_at: file.updated_at ? new Date(file.updated_at) : new Date()
          });

          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating file ${file.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ Files migrated: ${stats.migrated}, errors: ${stats.errors}`);
    } catch (error) {
      console.error('❌ Failed to migrate files:', error);
      throw error;
    }
  }

  private async migrateUserRelatedTables(userMap: Map<number, string>): Promise<void> {
    // Migrate notifications
    await this.migrateNotifications(userMap);
    
    // Migrate user settings
    await this.migrateUserSettings(userMap);
    
    // Migrate user profiles
    await this.migrateUserProfiles(userMap);
    
    // Migrate student progress
    await this.migrateStudentProgress(userMap);
    
    // Migrate audit logs
    await this.migrateAuditLogs(userMap);
    
    // Migrate reports
    await this.migrateReports(userMap);
    
    // Migrate quiz answers
    await this.migrateQuizAnswers(userMap);
  }

  private async migrateNotifications(userMap: Map<number, string>): Promise<void> {
    const stats: MigrationStats = {
      table: 'notifications',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating notifications...');
      
      const [notifications] = await this.mysqlConnection!.execute('SELECT * FROM notifications');

      for (const notif of notifications as any[]) {
        try {
          await pg('notifications').insert({
            title: notif.title,
            message: notif.message,
            type: notif.type || 'info',
            user_id: userMap.get(notif.user_id) || null,
            user_id_legacy: notif.user_id, // Store original MySQL user ID
            is_read: notif.is_read === 1,
            metadata: notif.metadata ? JSON.parse(notif.metadata) : null,
            created_at: notif.created_at ? new Date(notif.created_at) : new Date(),
            updated_at: notif.updated_at ? new Date(notif.updated_at) : new Date()
          });

          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating notification ${notif.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ Notifications migrated: ${stats.migrated}, errors: ${stats.errors}`);
    } catch (error) {
      console.error('❌ Failed to migrate notifications:', error);
    }
  }

  private async migrateUserSettings(userMap: Map<number, string>): Promise<void> {
    const stats: MigrationStats = {
      table: 'user_settings',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating user settings...');
      
      const [settings] = await this.mysqlConnection!.execute('SELECT * FROM user_settings');

      for (const setting of settings as any[]) {
        try {
          await pg('user_settings').insert({
            user_id: userMap.get(setting.user_id) || null,
            user_id_legacy: setting.user_id, // Store original MySQL user ID
            preferences: setting.preferences ? JSON.parse(setting.preferences) : {},
            language: setting.language || 'pt-BR',
            timezone: setting.timezone || 'America/Sao_Paulo',
            email_notifications: setting.email_notifications !== false,
            push_notifications: setting.push_notifications !== false,
            created_at: setting.created_at ? new Date(setting.created_at) : new Date(),
            updated_at: setting.updated_at ? new Date(setting.updated_at) : new Date()
          });

          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating user setting ${setting.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ User settings migrated: ${stats.migrated}, errors: ${stats.errors}`);
    } catch (error) {
      console.error('❌ Failed to migrate user settings:', error);
    }
  }

  private async migrateUserProfiles(userMap: Map<number, string>): Promise<void> {
    const stats: MigrationStats = {
      table: 'user_profiles',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating user profiles...');
      
      const [profiles] = await this.mysqlConnection!.execute('SELECT * FROM user_profiles');

      for (const profile of profiles as any[]) {
        try {
          await pg('user_profiles').insert({
            user_id: userMap.get(profile.user_id) || null,
            user_id_legacy: profile.user_id, // Store original MySQL user ID
            bio: profile.bio || null,
            avatar_url: profile.avatar_url || null,
            social_links: profile.social_links ? JSON.parse(profile.social_links) : {},
            birth_date: profile.birth_date ? new Date(profile.birth_date) : null,
            occupation: profile.occupation || null,
            created_at: profile.created_at ? new Date(profile.created_at) : new Date(),
            updated_at: profile.updated_at ? new Date(profile.updated_at) : new Date()
          });

          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating user profile ${profile.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ User profiles migrated: ${stats.migrated}, errors: ${stats.errors}`);
    } catch (error) {
      console.error('❌ Failed to migrate user profiles:', error);
    }
  }

  private async migrateStudentProgress(userMap: Map<number, string>): Promise<void> {
    const stats: MigrationStats = {
      table: 'student_progress',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating student progress...');
      
      const [progress] = await this.mysqlConnection!.execute('SELECT * FROM student_progress');

      for (const status of progress as any[]) {
        try {
          await pg('student_progress').insert({
            student_id: userMap.get(status.student_id) || null,
            student_id_legacy: status.student_id, // Store original MySQL user ID
            content_id: status.content_id,
            status: status.status || 'not_started',
            completion_percentage: status.completion_percentage || 0,
            time_spent_minutes: status.time_spent_minutes || 0,
            started_at: status.started_at ? new Date(status.started_at) : null,
            completed_at: status.completed_at ? new Date(status.completed_at) : null,
            created_at: status.created_at ? new Date(status.created_at) : new Date(),
            updated_at: status.updated_at ? new Date(status.updated_at) : new Date()
          });

          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating student progress ${status.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ Student progress migrated: ${stats.migrated}, errors: ${stats.errors}`);
    } catch (error) {
      console.error('❌ Failed to migrate student progress:', error);
    }
  }

  private async migrateAuditLogs(userMap: Map<number, string>): Promise<void> {
    const stats: MigrationStats = {
      table: 'audit_logs',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating audit logs...');
      
      const [logs] = await this.mysqlConnection!.execute('SELECT * FROM audit_logs');

      for (const activity of logs as any[]) {
        try {
          await pg('audit_logs').insert({
            user_id: userMap.get(activity.user_id) || null,
            user_id_legacy: activity.user_id, // Store original MySQL user ID
            action: activity.action,
            entity_type: activity.entity_type,
            entity_id: activity.entity_id,
            details: activity.details ? JSON.parse(activity.details) : null,
            created_at: activity.created_at ? new Date(activity.created_at) : new Date(),
            updated_at: activity.updated_at ? new Date(activity.updated_at) : new Date()
          });

          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating audit log ${activity.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ Audit logs migrated: ${stats.migrated}, errors: ${stats.errors}`);
    } catch (error) {
      console.error('❌ Failed to migrate audit logs:', error);
    }
  }

  private async migrateReports(userMap: Map<number, string>): Promise<void> {
    const stats: MigrationStats = {
      table: 'reports',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating reports...');
      
      const [reports] = await this.mysqlConnection!.execute('SELECT * FROM reports');

      for (const report of reports as any[]) {
        try {
          await pg('reports').insert({
            title: report.title,
            description: report.description || null,
            type: report.type || 'custom',
            data: report.data ? JSON.parse(report.data) : null,
            generated_by: userMap.get(report.generated_by) || null,
            generated_by_legacy: report.generated_by, // Store original MySQL user ID
            institution_id: report.institution_id || null,
            created_at: report.created_at ? new Date(report.created_at) : new Date(),
            updated_at: report.updated_at ? new Date(report.updated_at) : new Date()
          });

          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating report ${report.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ Reports migrated: ${stats.migrated}, errors: ${stats.errors}`);
    } catch (error) {
      console.error('❌ Failed to migrate reports:', error);
    }
  }

  private async migrateQuizAnswers(userMap: Map<number, string>): Promise<void> {
    const stats: MigrationStats = {
      table: 'quiz_answers',
      migrated: 0,
      errors: 0,
      startTime: new Date()
    };

    try {
      console.log('📊 Migrating quiz answers...');
      
      const [answers] = await this.mysqlConnection!.execute('SELECT * FROM quiz_answers');

      for (const answer of answers as any[]) {
        try {
          await pg('quiz_answers').insert({
            quiz_id: answer.quiz_id,
            question_id: answer.question_id,
            student_id: userMap.get(answer.student_id) || null,
            student_id_legacy: answer.student_id, // Store original MySQL user ID
            answer: answer.answer,
            is_correct: answer.is_correct === 1,
            points_earned: answer.points_earned || 0,
            created_at: answer.created_at ? new Date(answer.created_at) : new Date(),
            updated_at: answer.updated_at ? new Date(answer.updated_at) : new Date()
          });

          stats.migrated++;
        } catch (error) {
          console.error(`Error migrating quiz answer ${answer.id}:`, error);
          stats.errors++;
        }
      }

      stats.endTime = new Date();
      this.stats.push(stats);
      console.log(`✅ Quiz answers migrated: ${stats.migrated}, errors: ${stats.errors}`);
    } catch (error) {
      console.error('❌ Failed to migrate quiz answers:', error);
    }
  }

  private printSummary(): void {
    console.log('\n📊 MIGRATION SUMMARY');
    console.log('====================');
    
    let totalMigrated = 0;
    let totalErrors = 0;
    
    this.stats.forEach(stat => {
      const duration = stat.endTime ? 
        ((stat.endTime.getTime() - stat.startTime.getTime()) / 1000).toFixed(2) : 
        'N/A';
      
      console.log(`${stat.table.padEnd(20)} | ${stat.migrated.toString().padStart(8)} | ${stat.errors.toString().padStart(6)} | ${duration}s`);
      
      totalMigrated += stat.migrated;
      totalErrors += stat.errors;
    });
    
    console.log('====================');
    console.log(`${'TOTAL'.padEnd(20)} | ${totalMigrated.toString().padStart(8)} | ${totalErrors.toString().padStart(6)} |`);
    console.log('\n✅ Migration completed!');
  }

  async run(): Promise<void> {
    try {
      await this.connect();
      
      // Run migrations first
      await this.runMigrations();
      
      // Migrate core tables
      const institutionMap = await this.migrateInstitutions();
      const schoolMap = await this.migrateSchools(institutionMap);
      const roleMap = await this.migrateRoles();
      const userMap = await this.migrateUsers(institutionMap, schoolMap, roleMap);
      
      // Migrate related tables
      await this.migrateCollections(userMap, institutionMap);
      await this.migrateFiles(userMap);
      await this.migrateUserRelatedTables(userMap);
      
      // Seed sample data
      await this.seedSampleData();
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Run the migration
const migrator = new UnifiedMySQLToPostgresMigrator();
migrator.run().catch(console.error);
