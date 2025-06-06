import type { Knex } from 'knex';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
module.exports = {
  async up(knex: Knex): Promise<void> {
    // Add legacy columns to existing tables
    const hasUsersTable = await knex.schema.hasTable('users');
    if (hasUsersTable) {
      const hasUserIdLegacy = await knex.schema.hasColumn('users', 'user_id_legacy');
      if (!hasUserIdLegacy) {
        await knex.schema.alterTable('users', (table: Knex.TableBuilder) => {
          table.integer('user_id_legacy').nullable().comment('Original MySQL user ID for migration tracking');
          table.index('user_id_legacy');
        });
      }
    }

    const hasCollectionsTable = await knex.schema.hasTable('collections');
    if (hasCollectionsTable) {
      const hasCreatedByLegacy = await knex.schema.hasColumn('collections', 'created_by_legacy');
      if (!hasCreatedByLegacy) {
        await knex.schema.alterTable('collections', (table: Knex.TableBuilder) => {
          table.integer('created_by_legacy').nullable().comment('Original MySQL user ID for migration tracking');
          table.index('created_by_legacy');
        });
      }
    }

    const hasFilesTable = await knex.schema.hasTable('files');
    if (hasFilesTable) {
      const hasUploadedByLegacy = await knex.schema.hasColumn('files', 'uploaded_by_legacy');
      if (!hasUploadedByLegacy) {
        await knex.schema.alterTable('files', (table: Knex.TableBuilder) => {
          table.integer('uploaded_by_legacy').nullable().comment('Original MySQL user ID for migration tracking');
          table.index('uploaded_by_legacy');
        });
      }
    }

    // Add legacy columns to quiz_answers table
    const hasQuizAnswersTable = await knex.schema.hasTable('quiz_answers');
    if (hasQuizAnswersTable) {
      const hasStudentIdLegacy = await knex.schema.hasColumn('quiz_answers', 'student_id_legacy');
      if (!hasStudentIdLegacy) {
        await knex.schema.alterTable('quiz_answers', (table: Knex.TableBuilder) => {
          table.integer('student_id_legacy').nullable().comment('Original MySQL user ID for migration tracking');
          table.index('student_id_legacy');
        });
      }
    }

    // Add legacy columns to notifications table
    const hasNotificationsTable = await knex.schema.hasTable('notifications');
    if (hasNotificationsTable) {
      const hasUserIdLegacy = await knex.schema.hasColumn('notifications', 'user_id_legacy');
      if (!hasUserIdLegacy) {
        await knex.schema.alterTable('notifications', (table: Knex.TableBuilder) => {
          table.integer('user_id_legacy').nullable().comment('Original MySQL user ID for migration tracking');
          table.index('user_id_legacy');
        });
      }
    }

    // Add legacy columns to user_settings table
    const hasUserSettingsTable = await knex.schema.hasTable('user_settings');
    if (hasUserSettingsTable) {
      const hasUserIdLegacy = await knex.schema.hasColumn('user_settings', 'user_id_legacy');
      if (!hasUserIdLegacy) {
        await knex.schema.alterTable('user_settings', (table: Knex.TableBuilder) => {
          table.integer('user_id_legacy').nullable().comment('Original MySQL user ID for migration tracking');
          table.index('user_id_legacy');
        });
      }
    }

    // Add legacy columns to user_profiles table
    const hasUserProfilesTable = await knex.schema.hasTable('user_profiles');
    if (hasUserProfilesTable) {
      const hasUserIdLegacy = await knex.schema.hasColumn('user_profiles', 'user_id_legacy');
      if (!hasUserIdLegacy) {
        await knex.schema.alterTable('user_profiles', (table: Knex.TableBuilder) => {
          table.integer('user_id_legacy').nullable().comment('Original MySQL user ID for migration tracking');
          table.index('user_id_legacy');
        });
      }
    }

    // Add legacy columns to reports table
    const hasReportsTable = await knex.schema.hasTable('reports');
    if (hasReportsTable) {
      const hasGeneratedByLegacy = await knex.schema.hasColumn('reports', 'generated_by_legacy');
      if (!hasGeneratedByLegacy) {
        await knex.schema.alterTable('reports', (table: Knex.TableBuilder) => {
          table.integer('generated_by_legacy').nullable().comment('Original MySQL user ID for migration tracking');
          table.index('generated_by_legacy');
        });
      }
    }

    // Add legacy columns to student_progress table
    const hasStudentProgressTable = await knex.schema.hasTable('student_progress');
    if (hasStudentProgressTable) {
      const hasStudentIdLegacy = await knex.schema.hasColumn('student_progress', 'student_id_legacy');
      if (!hasStudentIdLegacy) {
        await knex.schema.alterTable('student_progress', (table: Knex.TableBuilder) => {
          table.integer('student_id_legacy').nullable().comment('Original MySQL user ID for migration tracking');
          table.index('student_id_legacy');
        });
      }
    }

    // Add legacy columns to audit_logs table
    const hasAuditLogsTable = await knex.schema.hasTable('audit_logs');
    if (hasAuditLogsTable) {
      const hasUserIdLegacy = await knex.schema.hasColumn('audit_logs', 'user_id_legacy');
      if (!hasUserIdLegacy) {
        await knex.schema.alterTable('audit_logs', (table: Knex.TableBuilder) => {
          table.integer('user_id_legacy').nullable().comment('Original MySQL user ID for migration tracking');
          table.index('user_id_legacy');
        });
      }
    }
  },

  async down(knex: Knex): Promise<void> {
    // Remove legacy columns from existing tables
    const hasUsersTable = await knex.schema.hasTable('users');
    if (hasUsersTable) {
      const hasUserIdLegacy = await knex.schema.hasColumn('users', 'user_id_legacy');
      if (hasUserIdLegacy) {
        await knex.schema.alterTable('users', (table: Knex.TableBuilder) => {
          table.dropIndex('user_id_legacy');
          table.dropColumn('user_id_legacy');
        });
      }
    }

    const hasCollectionsTable = await knex.schema.hasTable('collections');
    if (hasCollectionsTable) {
      const hasCreatedByLegacy = await knex.schema.hasColumn('collections', 'created_by_legacy');
      if (hasCreatedByLegacy) {
        await knex.schema.alterTable('collections', (table: Knex.TableBuilder) => {
          table.dropIndex('created_by_legacy');
          table.dropColumn('created_by_legacy');
        });
      }
    }

    const hasFilesTable = await knex.schema.hasTable('files');
    if (hasFilesTable) {
      const hasUploadedByLegacy = await knex.schema.hasColumn('files', 'uploaded_by_legacy');
      if (hasUploadedByLegacy) {
        await knex.schema.alterTable('files', (table: Knex.TableBuilder) => {
          table.dropIndex('uploaded_by_legacy');
          table.dropColumn('uploaded_by_legacy');
        });
      }
    }

    // Remove legacy columns from quiz_answers table
    const hasQuizAnswersTable = await knex.schema.hasTable('quiz_answers');
    if (hasQuizAnswersTable) {
      const hasStudentIdLegacy = await knex.schema.hasColumn('quiz_answers', 'student_id_legacy');
      if (hasStudentIdLegacy) {
        await knex.schema.alterTable('quiz_answers', (table: Knex.TableBuilder) => {
          table.dropIndex('student_id_legacy');
          table.dropColumn('student_id_legacy');
        });
      }
    }

    // Remove legacy columns from notifications table
    const hasNotificationsTable = await knex.schema.hasTable('notifications');
    if (hasNotificationsTable) {
      const hasUserIdLegacy = await knex.schema.hasColumn('notifications', 'user_id_legacy');
      if (hasUserIdLegacy) {
        await knex.schema.alterTable('notifications', (table: Knex.TableBuilder) => {
          table.dropIndex('user_id_legacy');
          table.dropColumn('user_id_legacy');
        });
      }
    }

    // Remove legacy columns from user_settings table
    const hasUserSettingsTable = await knex.schema.hasTable('user_settings');
    if (hasUserSettingsTable) {
      const hasUserIdLegacy = await knex.schema.hasColumn('user_settings', 'user_id_legacy');
      if (hasUserIdLegacy) {
        await knex.schema.alterTable('user_settings', (table: Knex.TableBuilder) => {
          table.dropIndex('user_id_legacy');
          table.dropColumn('user_id_legacy');
        });
      }
    }

    // Remove legacy columns from user_profiles table
    const hasUserProfilesTable = await knex.schema.hasTable('user_profiles');
    if (hasUserProfilesTable) {
      const hasUserIdLegacy = await knex.schema.hasColumn('user_profiles', 'user_id_legacy');
      if (hasUserIdLegacy) {
        await knex.schema.alterTable('user_profiles', (table: Knex.TableBuilder) => {
          table.dropIndex('user_id_legacy');
          table.dropColumn('user_id_legacy');
        });
      }
    }

    // Remove legacy columns from reports table
    const hasReportsTable = await knex.schema.hasTable('reports');
    if (hasReportsTable) {
      const hasGeneratedByLegacy = await knex.schema.hasColumn('reports', 'generated_by_legacy');
      if (hasGeneratedByLegacy) {
        await knex.schema.alterTable('reports', (table: Knex.TableBuilder) => {
          table.dropIndex('generated_by_legacy');
          table.dropColumn('generated_by_legacy');
        });
      }
    }

    // Remove legacy columns from student_progress table
    const hasStudentProgressTable = await knex.schema.hasTable('student_progress');
    if (hasStudentProgressTable) {
      const hasStudentIdLegacy = await knex.schema.hasColumn('student_progress', 'student_id_legacy');
      if (hasStudentIdLegacy) {
        await knex.schema.alterTable('student_progress', (table: Knex.TableBuilder) => {
          table.dropIndex('student_id_legacy');
          table.dropColumn('student_id_legacy');
        });
      }
    }

    // Remove legacy columns from audit_logs table
    const hasAuditLogsTable = await knex.schema.hasTable('audit_logs');
    if (hasAuditLogsTable) {
      const hasUserIdLegacy = await knex.schema.hasColumn('audit_logs', 'user_id_legacy');
      if (hasUserIdLegacy) {
        await knex.schema.alterTable('audit_logs', (table: Knex.TableBuilder) => {
          table.dropIndex('user_id_legacy');
          table.dropColumn('user_id_legacy');
        });
      }
    }
  }
};
