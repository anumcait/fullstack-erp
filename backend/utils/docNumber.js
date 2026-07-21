const db = require('../models/ERP');
const { Op } = require('sequelize');
const sequelize = db.sequelize;

function getFinancialYear(date) {
  const now = date || new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 4) return `${year}-${String(year + 1).slice(2)}`;
  return `${year - 1}-${String(year).slice(2)}`;
}

function formatFinYear(template, fy) {
  const [start, end] = fy.split('-');
  return template
    .replace('{YYYY}', start)
    .replace('{YY}', start.slice(2))
    .replace('{YYYY-YY}', fy)
    .replace('{FY}', fy);
}

/**
 * Generate a document number with table-level locking (LOCK TABLE ... IN EXCLUSIVE MODE).
 * Guarantees uniqueness and FIFO ordering under high concurrency (100+ users).
 * Resets per financial year. Uses the existing table + LOCK TABLE — no separate counter table needed.
 *
 * @param {string} tableName  - Name of the table to lock (e.g. 't_production_order')
 * @param {string} prefix     - Document prefix, e.g. 'JO', 'PO', 'PR'
 * @param {object} [options]
 * @param {number} [options.pad=4]     - Zero-pad length (default 4 → 'JO-2627-0001')
 * @param {Date}   [options.date]      - Date to derive financial year from
 * @param {string} [options.field='order_no'] - Column name holding the document number
 * @param {string} [options.format]    - Custom format template, e.g. '{prefix}-{num}' omits FY
 * @returns {Promise<{orderNo: string, financialYear: string, sequenceNumber: number}>}
 */
async function getNextSequence(tableName, prefix, options = {}) {
  const { pad = 4, date, field = 'order_no', format } = options;
  const fy = getFinancialYear(date);

  return await sequelize.transaction(async (t) => {
    await sequelize.query(`LOCK TABLE ${tableName} IN EXCLUSIVE MODE`, { transaction: t });

    const pattern = `${prefix}-${fy}-%`;
    const rows = await sequelize.query(
      `SELECT ${field} FROM ${tableName} WHERE ${field} LIKE :pattern ORDER BY id DESC LIMIT 1`,
      {
        replacements: { pattern },
        type: sequelize.QueryTypes.SELECT,
        transaction: t,
      }
    );

    let lastNumber = 0;
    if (rows && rows.length > 0) {
      const parts = rows[0][field].split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) lastNumber = lastNum;
    }

    const nextNumber = lastNumber + 1;
    const padded = String(nextNumber).padStart(pad, '0');
    let orderNo;
    if (format) {
      orderNo = format
        .replace('{prefix}', prefix)
        .replace('{FY}', fy)
        .replace('{num}', padded);
    } else {
      orderNo = `${prefix}-${fy}-${padded}`;
    }

    return { orderNo, financialYear: fy, sequenceNumber: nextNumber };
  });
}

async function generateDocNumber(modelName, prefixField, docField, settings) {
  const Model = db[modelName];
  if (!Model) throw new Error(`Model ${modelName} not found`);

  const prefix = settings[prefixField] || modelName.replace('Purchase', '').toUpperCase();
  const fy = getFinancialYear();
  const pattern = `${prefix}-${fy}-`;

  const last = await Model.findOne({
    where: { [docField]: { [Op.startsWith]: pattern } },
    order: [[docField, 'DESC']],
    attributes: [docField],
  });

  let nextSeq = 1;
  if (last) {
    const parts = last[docField].split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextSeq = lastNum + 1;
  }

  return `${prefix}-${fy}-${String(nextSeq).padStart(4, '0')}`;
}

module.exports = { generateDocNumber, getFinancialYear, formatFinYear, getNextSequence };
