const db = require('../models/ERP');
const { Op } = require('sequelize');
const sequelize = db.sequelize;

async function generateDocNumber(modelName, _prefixField, _docField, _settings) {
  const Model = db[modelName];
  if (!Model) throw new Error(`Model ${modelName} not found`);
  const count = await Model.count();
  return String(count + 1);
}

async function getNextSequence(tableName, _prefix, options = {}) {
  const { field = 'order_no' } = options;
  const rows = await sequelize.query(
    `SELECT COUNT(*) AS cnt FROM ${tableName}`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const nextNumber = (parseInt(rows[0]?.cnt, 10) || 0) + 1;
  const orderNo = String(nextNumber);
  return { orderNo, sequenceNumber: nextNumber };
}

module.exports = { generateDocNumber, getNextSequence };
