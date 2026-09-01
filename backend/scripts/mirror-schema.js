// Generic full-schema mirror: copies every Postgres HR/ERP table into the
// parallel Oracle HR / ERP schemas. Models are introspected at runtime
// (rawAttributes) and re-created in Oracle with type mappings, then rows
// are copied. Resilient: per-table try/catch, logs successes/failures.
// Run:  node scripts/mirror-schema.js
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Sequelize = require('sequelize');
const { mapAttr, isModel, isJsonColumn, cleanRow } = require('../services/oracleTypeMap');
const oHr = require('../config/oracleHrDb');   // user hr  -> HR schema
const oErp = require('../config/oracleErpDb'); // user erp -> ERP schema
const hrModels = require('../models');        // HR (Postgres)
const erpModels = require('../models/ERP');   // ERP (Postgres)

const CHUNK = 25; // concurrent row inserts (bulkCreate has an oracle bind bug)

// Fetch rows, tolerating models that declare columns not present in the
// physical Postgres table (e.g. a declared `created_at` with no column).
async function fetchRows(pg) {
  try {
    return await pg.findAll({ raw: true });
  } catch (e) {
    const [cols] = await pg.sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = :t AND table_catalog = current_database()`,
      { replacements: { t: pg.tableName } }
    );
    const existing = cols.map((c) => c.column_name).filter((c) => pg.rawAttributes[c]);
    if (!existing.length) return [];
    return await pg.findAll({ raw: true, attributes: existing });
  }
}

// Build an Oracle model (dynamically, mirroring the Postgres model) bound to
// the given connection + schema. Used by both the mirror and the replicator.
function buildOracleModel(conn, schema, pgModel) {
  const attrs = {};
  const jsonCols = new Set();
  for (const [col, def] of Object.entries(pgModel.rawAttributes)) {
    attrs[col] = mapAttr(def);
    if (isJsonColumn(def)) jsonCols.add(col);
  }
  const O = conn.define(pgModel.name, attrs, {
    tableName: pgModel.tableName,
    schema,
    timestamps: false,
    freezeTableName: true,
  });
  O.__jsonCols = jsonCols;
  return O;
}

async function mirrorSet(models, conn, schema, label) {
  const names = Object.keys(models).filter((k) => isModel(models[k]));
  console.log(`\n=== ${label}: ${names.length} tables ===`);
  let ok = 0, fail = 0;

  for (const name of names) {
    const pg = models[name];
    const tableName = pg.tableName;
    try {
      const OModel = buildOracleModel(conn, schema, pg);
      await OModel.sync({ force: true }); // recreate cleanly each run

      const rows = await fetchRows(pg);
      const cleaned = rows.map((r) => cleanRow(OModel.__jsonCols, r));

      if (cleaned.length) {
        for (let i = 0; i < cleaned.length; i += CHUNK) {
          const slice = cleaned.slice(i, i + CHUNK);
          await Promise.all(slice.map((r) => OModel.create(r, { validate: false })));
        }
      }
      console.log(`  ✅ ${schema}.${tableName} (${cleaned.length} rows)`);
      ok++;
    } catch (err) {
      console.log(`  ❌ ${schema}.${tableName}: ${err.message.split('\n')[0]}`);
      fail++;
    }
  }
  console.log(`=== ${label}: ${ok} ok, ${fail} failed ===`);
  return { ok, fail };
}

(async () => {
  try {
    await oHr.authenticate();
    await oErp.authenticate();
    console.log('✅ Oracle HR & ERP connected');

    const r1 = await mirrorSet(hrModels, oHr, 'HR', 'HR (Postgres → Oracle)');
    const r2 = await mirrorSet(erpModels, oErp, 'ERP', 'ERP (Postgres → Oracle)');

    console.log(`\nSUMMARY: HR ${r1.ok}/${r1.ok + r1.fail}, ERP ${r2.ok}/${r2.ok + r2.fail}`);
    process.exitCode = (r1.fail + r2.fail > 0) ? 1 : 0;
  } catch (err) {
    console.error('❌ Fatal:', err.message);
    process.exitCode = 1;
  } finally {
    await oHr.close().catch(() => {});
    await oErp.close().catch(() => {});
    await hrModels.sequelize.close().catch(() => {});
    await erpModels.sequelize.close().catch(() => {});
  }
})();
