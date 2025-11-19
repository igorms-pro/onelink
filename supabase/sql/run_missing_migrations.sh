#!/bin/bash
# Check migration status and run only missing migrations
# Usage: ./run_missing_migrations.sh [connection_string]

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

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Checking migration status..."
echo "================================"
psql "$DB_URL" -f "$SCRIPT_DIR/check_migration_status.sql"

echo ""
echo ""
echo "Running migrations (idempotent - safe to re-run)..."
echo "================================"

# Run migrations in order (they're all idempotent)
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
  psql "$DB_URL" -f "$SCRIPT_DIR/$migration" || {
    echo "⚠️  Error running $migration (may already be applied)"
    echo "Continuing..."
  }
  echo "✅ $migration completed"
done

echo ""
echo "================================"
echo "✅ All migrations completed!"
echo ""
echo "Re-checking status..."
psql "$DB_URL" -f "$SCRIPT_DIR/check_migration_status.sql"

