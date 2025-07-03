# MySQL to PostgreSQL Migration Scripts

This directory contains scripts for migrating data from MySQL to PostgreSQL.

## Table Mappings

The following tables are mapped during migration:

MySQL Table | PostgreSQL Table
-----------|----------------
user | users
role | roles
unit | schools
tv_show | collections
institution | institutions
user_role | role_permissions
user_unit | user_classes
unit_class | classes
video | content
file | files
tag/genre/theme | tags
user_activity | audit_logs
viewing_status | student_progress

## Configuration

1. Create a `.env` file in the backend directory with the following variables:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=sabercon
MYSQL_SSL=false

# PostgreSQL Configuration is read from knexfile.ts
```

## Running the Migration

1. First, run all PostgreSQL migrations to create the schema:
```bash
npm run migrate
```

2. Then run the migration script:
```bash
npm run migrate:mysql
```

## Migration Process

The migration runs in the following order:

1. Institutions
2. Schools (from Units)
3. Roles and Permissions
4. Users
5. Collections (from TV Shows)
6. Educational Cycles
7. Classes
8. Files and Videos
9. Tags and Categories
10. Activity Logs and Progress

Each step includes:
- Data validation
- Mapping to new schema
- Error handling
- Progress logging

## Error Handling

- The script handles connection errors for both databases
- Each migration step is independent and handles its own errors
- Failed items are logged but don't stop the entire process
- All database connections are properly closed after completion

## Verification

After migration, verify the data by:

1. Checking row counts between corresponding tables
2. Validating relationships (foreign keys)
3. Testing application functionality with migrated data

## Rollback

To rollback the migration:

1. Use the PostgreSQL backup (if created)
2. Run the drop-all-tables script
3. Re-run the original migrations

## Notes

- The MySQL database is read-only during migration
- Passwords and sensitive data are preserved as-is
- All timestamps are converted to UTC
- Inactive records are migrated but marked as inactive
