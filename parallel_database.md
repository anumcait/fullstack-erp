# Running Oracle DB in Parallel with PostgreSQL

This project already runs **multiple databases in parallel**:
- `config/db.js` → HR application DB (dialect driven by `DB_DIALECT`, default `postgres`)
- `config/erpDb.js` → ERP DB (dialect `postgres`)

Oracle XE 21c is added as a **third, parallel database** that holds a full mirror of the
PostgreSQL HR + ERP data, using **dedicated Oracle schemas/users** (`hr` and `erp`) that
mirror how Postgres splits data into the `hrdb` and `erpdb` databases. PostgreSQL stays the
source of truth; Oracle is the parallel mirror.

> Oracle XE 21c hard-caps user data at **10 GB** and uses national charset **AL16UTF16**
> (NVARCHAR2 is limited to 2000 characters). Both constraints are handled by the mirror.

---

## 1. Architecture

| Purpose         | Config                          | Dialect  | Oracle schema / user | Models                         |
|-----------------|---------------------------------|----------|----------------------|--------------------------------|
| HR (Postgres)   | `config/db.js`                  | postgres | —                    | `models/HR`, `models/User.js`  |
| ERP (Postgres)  | `config/erpDb.js`               | postgres | —                    | `models/ERP`, `models/Accounts`|
| Oracle HR       | `config/oracleHrDb.js`          | oracle   | `HR` (user `hr`)     | `models/Oracle` (HR-bound)     |
| Oracle ERP      | `config/oracleErpDb.js`         | oracle   | `ERP` (user `erp`)   | `models/Oracle` (ERP-bound)    |

`config/oracleFactory.js` exposes `createOracle(prefix)` and builds a Sequelize instance from
env vars prefixed `ORACLE_HR_DB_*` / `ORACLE_ERP_DB_*`. `oracleHrDb.js` and `oracleErpDb.js`
are thin wrappers. The driver (`sequelize-oracle` wrapping `oracledb`) is registered there.

> **Never use `system` for app writes.** App code connects as the dedicated `hr` / `erp` users.

---

## 2. Environment variables

Append to `backend/.env` (and `.env.development`). Docker Compose passes these into the
backend service (`ORACLE_HR_DB_HOST=oracle`, `ORACLE_ERP_DB_HOST=oracle`).

```env
# Oracle HR schema (dedicated user `hr`)
ORACLE_HR_DB_DIALECT=oracle
ORACLE_HR_DB_HOST=oracle
ORACLE_HR_DB_PORT=1521
ORACLE_HR_DB_SID=ORCLCDB
ORACLE_HR_DB_USER=hr
ORACLE_HR_DB_PASSWORD=hr_pass

# Oracle ERP schema (dedicated user `erp`)
ORACLE_ERP_DB_DIALECT=oracle
ORACLE_ERP_DB_HOST=oracle
ORACLE_ERP_DB_PORT=1521
ORACLE_ERP_DB_SID=ORCLCDB
ORACLE_ERP_DB_USER=erp
ORACLE_ERP_DB_PASSWORD=hr_pass
```

The Oracle container is `gvenzl/oracle-xe:21-slim` with `ORACLE_PASSWORD=hr_pass`,
`ORACLE_DATABASE=ORCLCDB`. The `hr` and `erp` users/schemas are created by
`scripts/oracle-init.sql` (run once as `system`).

---

## 3. Users & schemas

`scripts/oracle-init.sql` (run as `system`/`sysdba`):

```sql
CREATE USER hr  IDENTIFIED BY hr_pass;
CREATE USER erp IDENTIFIED BY hr_pass;
GRANT CONNECT, RESOURCE, UNLIMITED TABLESPACE TO hr;
GRANT CONNECT, RESOURCE, UNLIMITED TABLESPACE TO erp;
```

These dedicated users own the mirrored tables, keeping the Oracle side clean and separate
from `system`.

---

## 4. Application models (`models/Oracle`)

`models/Oracle/index.js` binds two read models to the dedicated connections:
- `LegacyHrEmployee` → HR connection (`schema: 'HR'`)
- `LegacyErpItem`    → ERP connection (`schema: 'ERP'`)

These are used by application code that reads from the Oracle mirror. The `models/index.js`
loader **skips** the `Oracle` folder so Oracle models are never bound to PostgreSQL.

---

## 5. Full-schema mirror (`scripts/mirror-schema.js`)

This is the **one-time / on-demand** baseline. It introspects **every** PostgreSQL HR/ERP
model at runtime (`rawAttributes`), re-creates the tables in the Oracle `HR`/`ERP` schemas
with type mappings, and copies all rows. It is idempotent (`sync({ force: true })`) and
resilient (per-table try/catch, falls back to real columns if a model declares a missing one).

```bash
# inside the backend container
docker exec hr-backend bash -c "cd /app && node scripts/mirror-schema.js"
```

The mirror also handles (see `mapAttr` in `services/oracleTypeMap.js`):
- `JSON` / `JSONB` → `CLOB` (stringified on copy)
- `BOOLEAN` → `INTEGER` (0/1)
- `STRING` > 2000 chars → `CLOB` (Oracle NVARCHAR2 over AL16UTF16 caps at 2000 chars)
- `DECIMAL` / `NUMERIC` → `DECIMAL(24,8)`
- missing physical columns in a Postgres model → falls back to `information_schema` columns
- row inserts are done **row-by-row in small batches** (see gotchas)

Run this once to seed the mirror, or anytime you need to fully re-sync (e.g. after Oracle was
down, or to reconcile drift from bulk updates).

---

## 6. Real-time dual-write (keeps the mirror live)

The mirror is kept continuously in sync by **real-time dual-write**: every Postgres
insert/update/delete on an HR or ERP model is also applied to the corresponding Oracle table,
via Sequelize `after*` hooks.

- `services/oracleReplicator.js` — registers `afterCreate` / `afterUpdate` / `afterDestroy`
  (plus `afterBulkCreate` / `afterBulkDestroy`) hooks on **all** HR + ERP models at startup.
- It dynamically builds an Oracle model that mirrors each Postgres model (`getOracleModel`),
  ensures the mirror table exists (`sync()`), and applies the operation. New Postgres tables
  are therefore auto-mirrored on first write.
- Replication is **best-effort and fire-and-forget**: it never blocks or fails a Postgres
  request. Failures are logged (`Oracle dual-write failed`) and the mirror can be reconciled
  later with the full mirror (`mirror-schema.js`) or `POST /api/oracle/migrate`.
- Enabled only after a successful Oracle connection at boot (`setEnabled(true)`); hooks are
  registered regardless but no-op while disabled.
- `afterBulkUpdate` is intentionally **not** auto-replicated (the affected rows aren't
  available); rely on the full mirror / migrate for bulk-update reconciliation.

So Postgres stays the system of record; Oracle XE is a live parallel mirror that receives the
same writes.

---

## 7. Oracle gotchas (learned the hard way)

1. **`ORA-00910: specified length too long`** — `NVARCHAR2` over the AL16UTF16 national
   charset allows at most 2000 characters (4000 bytes). A Postgres `STRING(4000)` column
   becomes `NVARCHAR2(4000)` and fails. Cap Oracle string length to 2000 and push anything
   larger to `CLOB`.
2. **`NJS-011: bind value and type mismatch`** — `sequelize-oracle`'s `bulkCreate` has a bind
   inference bug with multiple typed columns. Inserting rows one-by-one (`Model.create`) works
   reliably, so the mirror inserts in small concurrent batches instead of `bulkCreate`.
3. **`schema "ERP" does not exist`** — if Oracle models are accidentally loaded by the
   PostgreSQL model loader, Sequelize tries to create the `ERP` schema on Postgres and crashes.
   `models/index.js` must skip the `Oracle` folder.
4. **Quoted lowercase identifiers** — `sequelize-oracle` quotes table/column names, so Oracle
   stores them as **lowercase** (`"m_unit"`, `"name"`). Always quote identifiers in raw
   `oracleErp.query(...)` SQL (e.g. `SELECT "name" FROM "ERP"."m_unit"`).
5. **Compose env interpolation** — Docker Compose interpolates `${VAR}` at parse time from the
   host `.env`. To use a *container* env var in a healthcheck, escape it as `$$VAR`.
6. **XE 12 GB cap** — total user data is hard-capped at 12 GB (see §8). The `USERS` tablespace
   is `AUTOEXTEND ON` (up to 32 GB file size); the 12 GB *user-data* limit is what matters.

---

## 8. Monitoring Oracle data consumption

The `GET /db-status` endpoint reports live Oracle usage vs the 12 GB XE cap:

```json
"oracleUsage": { "hrMb": 15, "erpMb": 20, "totalMb": 35, "capMb": 12288, "percentUsed": 0.28 }
```

Computed by `oracleReplicator.getUsage()` (sums `user_segments` for the `hr` and `erp` users).
Keep an eye on `percentUsed` — if it trends toward 100%, use the strategies from the
"exceeding 12 GB" discussion (scope down the mirror, offload BLOBs, or run multiple XE
instances).

---

## 9. Runtime endpoints

- `GET /db-status` — pings HR (PG), ERP (PG), Oracle HR, Oracle ERP **and** reports Oracle
  data usage; proxied through nginx.
- `POST /api/oracle/migrate` — admin re-mirror trigger (permission `SETTINGS_MANAGE`),
  calls `services/oracleSync.js` → `migrateToOracle()`.

---

## Summary

PostgreSQL (HR + ERP) remains the system of record. Oracle XE runs in parallel with a
**dedicated-schema (`hr` / `erp`) mirror** that is (a) seeded by `scripts/mirror-schema.js`
and (b) kept live by `services/oracleReplicator.js` real-time dual-write hooks. Oracle usage
is surfaced on `/db-status` for monitoring. Each connection is independent; queries route to
the correct database via the per-folder Sequelize bindings.
