#!/bin/bash

# Function to check table structure
check_table_structure() {
    echo "🔍 Checking structure for essential tables..."
    
    local tables=(
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
        "books"
        "forum_threads"
    )

    for table in "${tables[@]}"; do
        echo "📋 Checking $table..."
        psql "$DATABASE_URL" -c "\d $table"
        
        # Check row count
        echo "📊 Row count for $table:"
        psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM $table;"
        
        # Check for any null values in required columns
        echo "❗ Checking for NULL values in required columns..."
        psql "$DATABASE_URL" -c "
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = '$table'
            AND is_nullable = 'NO';"
    done
}

# Function to verify foreign key constraints
check_foreign_keys() {
    echo "🔗 Checking foreign key relationships..."
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
        WHERE tc.constraint_type = 'FOREIGN KEY'
        ORDER BY tc.table_name;"
}

# Function to check indexes
check_indexes() {
    echo "📑 Checking indexes..."
    psql "$DATABASE_URL" -c "
        SELECT
            schemaname,
            tablename,
            indexname,
            indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname;"
}

# Function to check sequences
check_sequences() {
    echo "🔢 Checking sequences..."
    psql "$DATABASE_URL" -c "
        SELECT 
            sequencename,
            last_value,
            start_value,
            increment_by,
            max_value,
            is_cycled
        FROM pg_sequences
        WHERE schemaname = 'public';"
}

# Function to check for orphaned records
check_orphaned_records() {
    echo "🔍 Checking for orphaned records..."
    
    # Add specific checks for your important relationships
    psql "$DATABASE_URL" -c "
        -- Check enrollments without valid courses
        SELECT COUNT(*) as orphaned_enrollments
        FROM enrollments e
        LEFT JOIN courses c ON e.course_id = c.id
        WHERE c.id IS NULL;

        -- Check activity_submissions without valid activities
        SELECT COUNT(*) as orphaned_submissions
        FROM activity_submissions s
        LEFT JOIN activities a ON s.activity_id = a.id
        WHERE a.id IS NULL;

        -- Check content without valid modules
        SELECT COUNT(*) as orphaned_content
        FROM content c
        LEFT JOIN modules m ON c.module_id = m.id
        WHERE m.id IS NULL;"
}

# Function to verify data integrity
verify_data_integrity() {
    echo "🛡️ Verifying data integrity..."
    
    # Add specific checks for your data integrity rules
    psql "$DATABASE_URL" -c "
        -- Check for invalid dates
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE data_type IN ('timestamp', 'date')
        AND table_schema = 'public';

        -- Check for duplicate unique values
        SELECT count(*) as duplicate_emails
        FROM (
            SELECT email, COUNT(*)
            FROM users
            GROUP BY email
            HAVING COUNT(*) > 1
        ) t;

        -- Check for invalid status values
        SELECT DISTINCT status FROM enrollments;
        SELECT DISTINCT status FROM activity_submissions;"
}

# Main execution
echo "🚀 Starting database structure verification..."

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    exit 1
fi

# Run all checks
check_table_structure
check_foreign_keys
check_indexes
check_sequences
check_orphaned_records
verify_data_integrity

# Final statistics
echo "📊 Database Statistics:"
psql "$DATABASE_URL" -c "
    SELECT 
        schemaname,
        tablename,
        n_live_tup as row_count,
        n_dead_tup as dead_tuples,
        last_vacuum,
        last_analyze
    FROM pg_stat_user_tables
    ORDER BY n_live_tup DESC;"

echo "✅ Database structure verification completed!"
