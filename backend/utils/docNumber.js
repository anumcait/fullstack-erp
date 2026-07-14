const db = require('../models/ERP');
const { Op } = require('sequelize');
const sequelize = db.sequelize;

function getFinancialYear() {
  const now = new Date();
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

module.exports = { generateDocNumber, getFinancialYear, formatFinYear };
