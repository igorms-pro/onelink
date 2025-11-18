#!/bin/bash
# Run migrations using Supabase project URL
# This script helps you get the connection string and run migrations

set -e

PROJECT_URL="${1:-https://tdxzkceksiqcvposgcsm.supabase.co}"
PROJECT_REF=$(echo "$PROJECT_URL" | sed -E 's|https?://([^.]+)\..*|\1|')

echo "=========================================="
echo "Supabase Migration Runner"
echo "=========================================="
echo "Project URL: $PROJECT_URL"
echo "Project Ref: $PROJECT_REF"
echo ""
echo "To run migrations, you need your database password."
echo ""
echo "Get it from: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
echo ""
read -sp "Enter your database password: " DB_PASSWORD
echo ""

# Try pooler connection first (recommended)
DB_URL="postgresql://postgres.$PROJECT_REF:$DB_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

echo ""
echo "Testing connection..."
if psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
  echo "✅ Connection successful!"
else
  echo "⚠️  Pooler connection failed, trying direct connection..."
  # Try direct connection (different regions)
  for region in "us-east-1" "us-west-1" "eu-west-1" "ap-southeast-1"; do
    DB_URL="postgresql://postgres:$DB_PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres"
    if psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
      echo "✅ Direct connection successful!"
      break
    fi
  done
fi

echo ""
echo "Running migrations..."
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

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
  if psql "$DB_URL" -f "$SCRIPT_DIR/$migration"; then
    echo "✅ $migration completed"
  else
    echo "⚠️  Error running $migration (may already be applied)"
    echo "Continuing..."
  fi
done

echo ""
echo "=========================================="
echo "✅ All migrations completed!"
echo ""
echo "Checking final status..."
psql "$DB_URL" -f "$SCRIPT_DIR/check_migration_status.sql"

