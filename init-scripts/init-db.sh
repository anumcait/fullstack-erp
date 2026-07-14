#!/bin/bash

# Wait until Postgres is ready
until pg_isready -U postgres; do
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 2
done

# ─────────────── HR database (hrdb) ───────────────
USER_COUNT=$(psql -U postgres -d hrdb -tAc "SELECT COUNT(*) FROM \"Users\";" 2>/dev/null || echo "0")
echo "📊 Found $USER_COUNT users in hrdb."

if [ "$USER_COUNT" -eq "0" ]; then
  echo "🛠️ hrdb has no users. Restoring from backup..."
  if [ -f /pg_backup/hrdb.backup ]; then
    pg_restore --no-owner --clean --if-exists --verbose -U postgres -d hrdb /pg_backup/hrdb.backup 2>&1 || true
    echo "✅ hrdb restore completed."
  else
    echo "❌ /pg_backup/hrdb.backup not found."
  fi
else
  echo "✅ hrdb already has data. Skipping hrdb restore."
fi

# ─────────────── ERP database (erpdb) ───────────────
# Ensure the erpdb database exists (connect-pg-simple / ERP models expect it).
DB_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='erpdb';" 2>/dev/null || echo "")
if [ -z "$DB_EXISTS" ]; then
  echo "🛠️ erpdb does not exist. Creating..."
  psql -U postgres -c "CREATE DATABASE erpdb;" 2>&1 || true
fi

# Restore erpdb only if it is empty (no tables yet).
ERP_TABLES=$(psql -U postgres -d erpdb -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")
echo "📊 Found $ERP_TABLES tables in erpdb."

if [ "$ERP_TABLES" -eq "0" ]; then
  echo "🛠️ erpdb is empty. Restoring from backup..."
  if [ -f /pg_backup/erpdb.backup ]; then
    pg_restore --no-owner --clean --if-exists --verbose -U postgres -d erpdb /pg_backup/erpdb.backup 2>&1 || true
    echo "✅ erpdb restore completed."
  else
    echo "❌ /pg_backup/erpdb.backup not found."
  fi
else
  echo "✅ erpdb already has data. Skipping erpdb restore."
fi

echo "🎉 Database initialization complete."
