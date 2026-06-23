#!/bin/bash

# Wait until Postgres is ready
until pg_isready -U postgres; do
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Count number of rows in 'Users' table to see if data exists
USER_COUNT=$(psql -U postgres -d hrdb -tAc "SELECT COUNT(*) FROM \"Users\";" 2>/dev/null || echo "0")

echo "📊 Found $USER_COUNT users in database."

if [ "$USER_COUNT" -eq "0" ]; then
  echo "🛠️ Database has no users. Restoring from backup..."
  
  if [ -f /pg_backup/hrdb_full.backup ]; then
    pg_restore --no-owner --clean --if-exists --verbose -U postgres -d hrdb /pg_backup/hrdb_full.backup 2>&1 || true
    echo "✅ Restore completed."
  else
    echo "❌ Backup file not found at /pg_backup/hrdb_full.backup"
  fi
else
  echo "✅ Database already has data. Skipping restore."
fi
