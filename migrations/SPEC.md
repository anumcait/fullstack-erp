# Legacy Oracle APEX ERP → New Postgres ERP : Migration Plan

Goal: migrate ALL data from the legacy Oracle APEX ERP (different schema) into the
new Postgres ERP application, leaving nothing behind, then decommission the legacy ERP.
The Oracle XE mirror we built is KEPT (continues dual-write as a live shadow).

## Source data delivery (pick one)
The legacy export is a binary `.dmp` (Data Pump / imp). Node scripts cannot read a
`.dmp` directly, so:

- **Option A (recommended):** Import the `.dmp` into an Oracle staging schema, then
  give a **read-only connection** (host / port / service / user / password / owner).
  Migration reads each table via `oracledb`, same as the existing mirror.
- **Option B:** From that staged Oracle, export each table as **CSV** (header row =
  column names). Drop files in `migrations/legacy/data/<table>.csv`.

Also provide the **DDL** of every source table (one file `migrations/legacy/ddl/<owner>_<table>.sql`
or a single dump) so column types / PK / FK are known.

## Approach: table-by-table ETL + validation
Because the new app is far more modern than the APEX schema, this is TRANSFORM, not COPY:

1. Introspect each source table (columns, types, PK, row count).
2. Map columns to the target Sequelize model (see `migrations/target_inventory.md`).
3. Build per-table transform rules:
   - new required columns not present in legacy → derive / default
   - coded values (status, gender, dept codes) → new enums
   - split / merged tables; rebuild FKs to new keys
4. Migrate in FK-safe order, batched (e.g. 1000 rows) to avoid memory spikes.
5. **Validate after each table:** row counts match, and spot-check samples.
6. Final parity check: total counts + reconcile via `/api/oracle/migrate`.

## Directory layout
```
migrations/
  SPEC.md                 # this file
  target_inventory.md     # destination model columns (generated)
  mapping/                # per-table mapping + transform configs (generated)
  legacy/
    ddl/                  # source CREATE TABLE ddl
    data/                 # source CSVs (Option B)
```

## Next steps
1. User delivers source (staging connection OR csv+ddl).
2. Generate `target_inventory.md` from existing models.
3. Generate per-table `mapping/` configs with user input on ambiguous columns.
4. Run migration, validate, cut over, decommission legacy ERP.
