#!/bin/bash

# Function to test PostgreSQL connection
test_postgres_connection() {
    echo "Testing PostgreSQL connection..."
    if psql "$DATABASE_URL" -c '\q' 2>/dev/null; then
        echo "✅ PostgreSQL connection successful"
        return 0
    else
        echo "❌ Could not connect to PostgreSQL"
        return 1
    fi
}

# Function to test MySQL connection
test_mysql_connection() {
    echo "Testing MySQL connection..."
    if mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT 1;" 2>/dev/null; then
        echo "✅ MySQL connection successful"
        return 0
    else
        echo "❌ Could not connect to MySQL"
        return 1
    fi
}

# Main execution
echo "🔍 Checking database connections..."

if ! test_postgres_connection; then
    echo "❌ PostgreSQL connection failed. Please check your DATABASE_URL"
    exit 1
fi

if ! test_mysql_connection; then
    echo "❌ MySQL connection failed. Please check your MySQL credentials"
    exit 1
fi

echo "✅ All database connections verified successfully"
exit 0
