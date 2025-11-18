#!/bin/bash
# Run all migrations in order
# Usage: ./run_all_migrations.sh [connection_string]
# Or set SUPABASE_DB_URL environment variable

set -e

# Get connection string from argument or environment
if [ -n "$1" ]; then
  DB_URL="$1"
elif [ -n "$SUPABASE_DB_URL" ]; then
  DB_URL="$SUPABASE_DB_URL"
else
  echo "Error: Please provide database connection string"
  echo "Usage: $0 <connection_string>"
  echo "Or set SUPABASE_DB_URL environment variable"
  exit 1
fi

echo "Running migrations in order..."
echo "================================"

# Run migrations in order
for migration in \
  000_base_schema.sql \
  001_rls_and_plan.sql \
  002_drops_and_submissions.sql \
  003_retention_job.sql \
  004_drops_public_private.sql \
  005_settings_tables.sql
do
  echo ""
  echo "Running: $migration"
  echo "--------------------------------"
  psql "$DB_URL" -f "$(dirname "$0")/$migration" || {
    echo "Error running $migration"
    exit 1
  }
  echo "✅ $migration completed"
done

echo ""
echo "================================"
echo "✅ All migrations completed successfully!"

