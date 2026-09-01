// Real-time dual-write replicator: keeps the parallel Oracle HR/ERP mirror in
// sync with every Postgres write (insert / update / delete). Registered as
// Sequelize after* hooks on all HR + ERP models. Replication is best-effort
// and fire-and-forget so a Postgres write never blocks on, or fails because of,
// Oracle. The one-time /api/oracle/migrate (or scripts/mirror-schema.js) can
// always reconcile the mirror if it drifts.
const Sequelize = require('sequelize');
const logger = require('../utils/logger');
const oracleHr = require('../config/oracleHrDb');   // user hr  -> HR schema
const oracleErp = require('../config/oracleErpDb'); // user erp -> ERP schema
const { mapAttr, isModel, isJsonColumn, cleanRow } = require('./oracleTypeMap');

let enabled = false;
const modelCache = new Map();

// Lazy refs to the Postgres connections so we can tell HR from ERP models.
let hrSeq, erpSeq;
function ensureRefs() {
  if (!hrSeq) hrSeq = require('../models').sequelize;
  if (!erpSeq) erpSeq = require('../models/ERP').sequelize;
}

// Map a Postgres model to its Oracle connection + schema.
function targetFor(pgModel) {
  ensureRefs();
  if (pgModel.sequelize === erpSeq) return { conn: oracleErp, schema: 'ERP' };
  return { conn: oracleHr, schema: 'HR' };
}

// Build (and cache) a dynamic Oracle model that mirrors a Postgres model.
async function getOracleModel(pgModel) {
  const { conn, schema } = targetFor(pgModel);
  const cacheKey = `${schema}:${pgModel.name}`;
  let O = modelCache.get(cacheKey);
  if (!O) {
    const attrs = {};
    const jsonCols = new Set();
    const dateCols = new Set();
    for (const [col, def] of Object.entries(pgModel.rawAttributes)) {
      attrs[col] = mapAttr(def);
      if (isJsonColumn(def)) jsonCols.add(col);
      if (def.type && /^(DATE|DATEONLY)$/.test(def.type.key || '')) dateCols.add(col);
    }
    O = conn.define(pgModel.name, attrs, {
      tableName: pgModel.tableName,
      schema,
      timestamps: false,
      freezeTableName: true,
    });
    O.__jsonCols = jsonCols;
    O.__dateCols = dateCols;
    modelCache.set(cacheKey, O);
  }
  // Ensure the mirror table exists AND matches the Postgres schema. `alter:true`
  // adds any columns that Postgres gained after the Oracle mirror was first
  // created (e.g. `color`), preventing ORA-00904 on dual-write MERGE. It does
  // not drop columns, so it is safe to run on every write.
  await O.sync({ alter: true });
  return O;
}

function pkWhere(pgModel, data) {
  const where = {};
  const pks = pgModel.primaryKeyAttributes.length
    ? pgModel.primaryKeyAttributes
    : Object.keys(pgModel.rawAttributes);
  for (const pk of pks) where[pk] = data[pk];
  return where;
}

function plain(instance) {
  // afterUpsert passes [instance, created] (an array) rather than the instance.
  if (Array.isArray(instance)) instance = instance[0];
  return (instance && typeof instance.get === 'function') ? instance.get({ plain: true }) : instance;
}

// ── Operation handlers ──────────────────────────────────────────────────────
async function replicateCreate(pgModel, instance) {
  const O = await getOracleModel(pgModel);
  const data = cleanRow(O.__jsonCols, plain(instance), O.__dateCols);
  await O.create(data, { validate: false });
}

// Raw Oracle MERGE (native upsert). Bypasses sequelize-oracle's buggy
// bulkUpdate runner (NJS-107 invalid cursor). Reliable for both insert and
// update paths. PK columns match; everything else is merged.
async function rawUpsert(O, data) {
  const schema = O.options.schema;
  const table = O.tableName;
  const cols = Object.keys(data);
  if (!cols.length) return;
  const pkCols = O.primaryKeyAttributes.length ? O.primaryKeyAttributes : cols;
  const onClause = pkCols.map((c) => `t."${c}" = s."${c}"`).join(' AND ');
  // PK columns can't be in the UPDATE SET (ORA-38104); they're already matched.
  const setCols = cols.filter((c) => !pkCols.includes(c));
  const setClause = setCols.map((c) => `t."${c}" = s."${c}"`).join(', ');
  const insertCols = cols.map((c) => `"${c}"`).join(', ');
  const insertVals = cols.map((c) => `s."${c}"`).join(', ');
  const using = `SELECT ${cols.map((c) => `:${c} AS "${c}"`).join(', ')} FROM dual`;
  const sql =
    `MERGE INTO "${schema}"."${table}" t ` +
    `USING (${using}) s ON (${onClause}) ` +
    (setClause ? `WHEN MATCHED THEN UPDATE SET ${setClause} ` : '') +
    `WHEN NOT MATCHED THEN INSERT (${insertCols}) VALUES (${insertVals})`;
  // This dialect uses `replacements` (named :name) for parameter binding.
  await O.sequelize.query(sql, { replacements: data, type: Sequelize.QueryTypes.BULKUPDATE });
}

async function replicateUpdate(pgModel, instance) {
  const O = await getOracleModel(pgModel);
  const data = cleanRow(O.__jsonCols, plain(instance), O.__dateCols);
  // Use MERGE instead of O.update (sequelize-oracle bulkUpdate -> NJS-107).
  await rawUpsert(O, data);
}

async function replicateDestroy(pgModel, instance) {
  const O = await getOracleModel(pgModel);
  const where = pkWhere(pgModel, plain(instance));
  await O.destroy({ where, returning: false });
}

async function replicateDestroyWhere(pgModel, where) {
  const O = await getOracleModel(pgModel);
  await O.destroy({ where });
}

// Fire-and-forget: never reject, never block the caller's request.
function fireAndForget(fn, pgModel, payload, op) {
  if (!enabled) return;
  Promise.resolve()
    .then(() => fn(pgModel, payload))
    .catch((err) => logger.error('Oracle dual-write failed', {
      op, model: pgModel.name, error: err && err.message,
    }));
}

// ── Hook registration ────────────────────────────────────────────────────────
function registerHooks() {
  const hrModels = require('../models');
  const erpModels = require('../models/ERP');
  const all = Object.assign({}, hrModels, erpModels);

  for (const key of Object.keys(all)) {
    const m = all[key];
    if (!isModel(m)) continue;

    m.addHook('afterCreate', (instance) => fireAndForget(replicateCreate, m, instance, 'create'));
    m.addHook('afterUpdate', (instance) => fireAndForget(replicateUpdate, m, instance, 'update'));
    // NOTE: `upsert` does NOT fire afterCreate/afterUpdate in Sequelize v6; it
    // fires afterUpsert. Replicate as update-or-insert (update falls back to
    // create when the Oracle row is missing).
    m.addHook('afterUpsert', (instance) => fireAndForget(replicateUpdate, m, instance, 'upsert'));
    m.addHook('afterDestroy', (instance) => fireAndForget(replicateDestroy, m, instance, 'destroy'));
    m.addHook('afterBulkCreate', (instances) => {
      if (!Array.isArray(instances)) return;
      instances.forEach((i) => fireAndForget(replicateCreate, m, i, 'bulkCreate'));
    });
    // afterBulkDestroy exposes the WHERE clause (not row data); mirror the delete.
    m.addHook('afterBulkDestroy', (options) => {
      if (options && options.where) fireAndForget(replicateDestroyWhere, m, options.where, 'bulkDestroy');
    });
    // afterBulkUpdate gives (values, options) but not the affected rows; the
    // periodic /api/oracle/migrate reconciles bulk updates. We just log intent.
    m.addHook('afterBulkUpdate', () => {
      logger.debug('Oracle dual-write: bulkUpdate on ' + m.name + ' not auto-replicated; run /api/oracle/migrate to reconcile.');
    });
  }
  logger.info('✅ Oracle dual-write hooks registered on HR + ERP models.');
}

function setEnabled(value) { enabled = !!value; }

// ── Monitoring: Oracle user-data usage vs the XE 12 GB cap ───────────────────
async function getUsage() {
  try {
    const [hrRows] = await oracleHr.query('SELECT NVL(SUM(bytes),0) AS b FROM user_segments');
    const [erpRows] = await oracleErp.query('SELECT NVL(SUM(bytes),0) AS b FROM user_segments');
    const hrMb = Math.round((hrRows[0].B || 0) / 1024 / 1024);
    const erpMb = Math.round((erpRows[0].B || 0) / 1024 / 1024);
    const capMb = 12 * 1024;
    return {
      hrMb, erpMb, totalMb: hrMb + erpMb, capMb,
      percentUsed: Number((((hrMb + erpMb) / capMb) * 100).toFixed(2)),
    };
  } catch (err) {
    logger.error('Oracle usage check failed', { error: err && err.message });
    return null;
  }
}

module.exports = { registerHooks, setEnabled, getUsage };
