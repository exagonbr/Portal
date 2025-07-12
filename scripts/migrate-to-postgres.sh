#!/bin/bash

# Function to check PostgreSQL table structure
check_table_structure() {
    local table=$1
    echo "Checking structure for table: $table"
    psql "$DATABASE_URL" -c "\d $table"
}

# Function to check constraints
check_constraints() {
    local table=$1
    echo "Checking constraints for table: $table"
    psql "$DATABASE_URL" -c "
        SELECT conname, contype, pg_get_constraintdef(c.oid)
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE conrelid = '$table'::regclass;"
}

# Function to verify database structure
verify_database_structure() {
    echo "🔍 Verifying database structure..."
    
    # Essential tables to verify
    local essential_tables=(
        "users"
        "activities"
        "activity_sessions"
        "activity_submissions"
        "courses"
        "classes"
        "enrollments"
        "modules"
        "content"
        "grades"
        "forum_threads"
        "books"
    )

    for table in "${essential_tables[@]}"; do
        check_table_structure "$table"
        check_constraints "$table"
    done

    # Check sequences
    echo "Checking sequences..."
    psql "$DATABASE_URL" -c "
        SELECT sequencename, last_value, start_value, increment_by
        FROM pg_sequences
        WHERE schemaname = 'public';"

    # Check foreign keys
    echo "Checking foreign key relationships..."
    psql "$DATABASE_URL" -c "
        SELECT
            tc.table_schema, 
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY';"
}

# Ensure environment variables are set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL for PostgreSQL is not set"
  exit 1
fi

if [ -z "$MYSQL_DATABASE" ] || [ -z "$MYSQL_USER" ] || [ -z "$MYSQL_PASSWORD" ]; then
  echo "Error: MySQL environment variables are not set"
  echo "Please set MYSQL_DATABASE, MYSQL_USER, and MYSQL_PASSWORD"
  exit 1
fi

echo "🔄 Starting migration from MySQL to PostgreSQL..."

# Drop existing database and create a new one
echo "�️ Dropping and recreating database..."
DATABASE_NAME=$(echo $DATABASE_URL | sed -E 's/.*\/([^?]*).*/\1/')
psql $(echo $DATABASE_URL | sed 's/\/[^/]*$/\/postgres/') -c "
  SELECT pg_terminate_backend(pid) 
  FROM pg_stat_activity 
  WHERE datname = '$DATABASE_NAME';" 2>/dev/null
psql $(echo $DATABASE_URL | sed 's/\/[^/]*$/\/postgres/') -c "DROP DATABASE IF EXISTS $DATABASE_NAME;" 2>/dev/null
psql $(echo $DATABASE_URL | sed 's/\/[^/]*$/\/postgres/') -c "CREATE DATABASE $DATABASE_NAME;" 2>/dev/null

# Run Prisma migrations
echo "� Running Prisma migrations..."
npx prisma migrate deploy

# Run the seed script to migrate data
echo "🌱 Running seed script to migrate data..."
NODE_ENV=development npx prisma db seed

echo "✅ Migration completed successfully!"
