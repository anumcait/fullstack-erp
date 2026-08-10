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

module.exports = { generateDocNumber, nextDocNumber };
