const db = require('../models/ERP');

// Compute the next sequential number for a document.
//   prefix (optional): when set/non-empty, the returned number is prefixed and
//   only existing numbers that already carry this prefix are considered.
//   startNo: numbering never goes below this "Zoho-style" start value.
//   next = max(startNo - 1, max existing numeric suffix for the prefix) + 1
// When prefix is null/empty, plain sequential numbers are used and existing
// plain numeric documents are considered.
async function nextDocNumber(Model, docField, startNo = 1, prefix = '', t) {
  if (!Model) throw new Error('Model not found');
  const start = Number(startNo) || 1;
  const pre = String(prefix || '').trim();
  const esc = pre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const sql = pre
    ? `SELECT COALESCE(MAX(CAST(SUBSTRING("${docField}" FROM '^${esc}([0-9]+)$') AS BIGINT)), 0) AS max_no
       FROM ${Model.getTableName()} WHERE "${docField}" ~ '^${esc}[0-9]+$'`
    : `SELECT COALESCE(MAX(("${docField}")::BIGINT), 0) AS max_no
       FROM ${Model.getTableName()} WHERE "${docField}" ~ '^[0-9]+$'`;

  const [rows] = await db.sequelize.query(sql, { transaction: t || null });
  const maxExisting = Number(rows[0]?.max_no || 0);
  const next = Math.max(maxExisting, start - 1) + 1;
  return pre ? `${pre}${next}` : String(next);
}

// Generate the next document number using settings-driven fields.
//   modelName: sequelize model name (e.g. 'GRN')
//   startField: settings key holding the start number (e.g. 'grn_start_no')
//   prefixField: settings key holding the prefix (e.g. 'grn_prefix') — may be null
//   docField: column on the model that stores the document number
async function generateDocNumber(modelName, startField, prefixField, docField, settings) {
  const Model = db[modelName];
  if (!Model) throw new Error(`Model ${modelName} not found`);
  const startNo = Number(settings?.[startField] || 1);
  const prefix = settings?.[prefixField];
  return nextDocNumber(Model, docField, startNo, prefix);
}

// Allocate the next sequential value for a numeric column inside a transaction.
//
// Why this exists instead of `findOne({ attributes: [MAX(col)], lock: UPDATE })`:
//   1. PostgreSQL rejects that outright — "FOR UPDATE is not allowed with
//      aggregate functions".
//   2. Even without the lock, MAX() + 1 races: two concurrent requests can read
//      the same max and insert duplicate numbers.
// So: take a transaction-scoped advisory lock to serialize allocation, then lock
// the highest existing row. The advisory lock is released automatically on
// commit or rollback, so no cleanup is needed.
//
// lockKey must be a distinct int32 per table (see LOCK_KEYS below).
async function nextSequenceNumber(Model, column, t, lockKey) {
  if (!Model) throw new Error('Model not found');
  if (!t) throw new Error('nextSequenceNumber requires a transaction');

  await Model.sequelize.query('SELECT pg_advisory_xact_lock(:key)', {
    replacements: { key: Number(lockKey) },
    transaction: t
  });

  const last = await Model.findOne({
    attributes: [column],
    order: [[column, 'DESC']],
    raw: true,
    transaction: t,
    lock: t.LOCK.UPDATE
  });

  return Number(last && last[column] ? last[column] : 0) + 1;
}

// Distinct advisory-lock keys — one per table so unrelated document numbering
// never blocks on each other.
const LOCK_KEYS = {
  LEAVE_APPLICATION: 70001,
  ADVANCE_APPLICATION: 70002,
  ESI_LEAVE_APPLICATION: 70003,
  SHIFT_CHANGE: 70004,
  ON_DUTY_APPLICATION: 70005,
  EXT_OT: 70006,
  TOUR_APPLICATION: 70007,
  WOFF_APPLICATION: 70008,
  EMP_INCREMENT: 70009
};

module.exports = { generateDocNumber, nextDocNumber, nextSequenceNumber, LOCK_KEYS };
