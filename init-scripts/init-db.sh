#!/bin/bash

# Wait until Postgres is ready
until pg_isready -U postgres; do
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 2
done

# RESTORE_MODE controls how the databases are initialised on first run:
#   full   -> restore full backups from /pg_backup (default, keeps current behaviour)
#   schema -> restore SCHEMA-ONLY dumps (empty tables, no data) — use for new companies
#   none   -> do not restore anything; let the backend create tables via Sequelize sync
RESTORE_MODE=${RESTORE_MODE:-full}

echo "🔧 RESTORE_MODE=$RESTORE_MODE"

# ─────────────── HR database (hrdb) ───────────────
restore_hrdb() {
  local mode=$1
  USER_COUNT=$(psql -U postgres -d hrdb -tAc "SELECT COUNT(*) FROM \"Users\";" 2>/dev/null || echo "0")
  if [ "$USER_COUNT" -ne "0" ]; then
    echo "✅ hrdb already has data. Skipping hrdb restore."
    return
  fi

  if [ "$mode" = "none" ]; then
    echo "🛠️ RESTORE_MODE=none: skipping hrdb restore (backend will sync schema)."
    return
  fi

  if [ "$mode" = "schema" ] && [ -f /pg_backup/hrdb_schema.dump ]; then
    echo "🛠️ RESTORE_MODE=schema: restoring hrdb schema only (empty tables)..."
    pg_restore --no-owner --clean --if-exists --verbose -U postgres -d hrdb /pg_backup/hrdb_schema.dump 2>&1 || true
    echo "✅ hrdb schema restore completed."
    return
  fi

  if [ -f /pg_backup/hrdb.backup ]; then
    echo "🛠️ Restoring hrdb from full backup..."
    pg_restore --no-owner --clean --if-exists --verbose -U postgres -d hrdb /pg_backup/hrdb.backup 2>&1 || true
    echo "✅ hrdb restore completed."
  else
    echo "❌ /pg_backup/hrdb.backup not found."
  fi
}

# ─────────────── ERP database (erpdb) ───────────────
restore_erpdb() {
  local mode=$1
  DB_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='erpdb';" 2>/dev/null || echo "")
  if [ -z "$DB_EXISTS" ]; then
    echo "🛠️ erpdb does not exist. Creating..."
    psql -U postgres -c "CREATE DATABASE erpdb;" 2>&1 || true
  fi

  ERP_TABLES=$(psql -U postgres -d erpdb -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")
  if [ "$ERP_TABLES" -ne "0" ]; then
    echo "✅ erpdb already has data. Skipping erpdb restore."
    return
  fi

  if [ "$mode" = "none" ]; then
    echo "🛠️ RESTORE_MODE=none: skipping erpdb restore (backend will sync schema)."
    return
  fi

  if [ "$mode" = "schema" ] && [ -f /pg_backup/erpdb_schema.dump ]; then
    echo "🛠️ RESTORE_MODE=schema: restoring erpdb schema only (empty tables)..."
    pg_restore --no-owner --clean --if-exists --verbose -U postgres -d erpdb /pg_backup/erpdb_schema.dump 2>&1 || true
    echo "✅ erpdb schema restore completed."
    return
  fi

  if [ -f /pg_backup/erpdb.backup ]; then
    echo "🛠️ Restoring erpdb from full backup..."
    pg_restore --no-owner --clean --if-exists --verbose -U postgres -d erpdb /pg_backup/erpdb.backup 2>&1 || true
    echo "✅ erpdb restore completed."
  else
    echo "❌ /pg_backup/erpdb.backup not found."
  fi
}

restore_hrdb "$RESTORE_MODE"
restore_erpdb "$RESTORE_MODE"

echo "🎉 Database initialization complete."
