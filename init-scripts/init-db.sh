#!/bin/bash

# Wait until Postgres is ready
until pg_isready -U postgres; do
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Count number of tables in 'public' schema
TABLE_COUNT=$(psql -U postgres -d hrdb -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")

echo "📊 Found $TABLE_COUNT tables in database."

if [ "$TABLE_COUNT" -le "5" ]; then
  echo "🛠️ Database appears empty or minimal. Restoring from backup..."

  if [ -f /pg_backup/hrdb.backup ]; then
    # Use --no-owner, --clean, and --if-exists to handle conflicts
    # Don't use set -e so partial restore still works
    pg_restore --no-owner --clean --if-exists --verbose -U postgres -d hrdb /pg_backup/hrdb.backup 2>&1 || true
    echo "✅ Restore completed (some warnings may be normal)."
  else
    echo "❌ Backup file not found at /pg_backup/hrdb.backup"
  fi
else
  echo "✅ Database already has $TABLE_COUNT tables. Skipping restore."
fi
