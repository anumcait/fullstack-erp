// Shared service: mirrors live Postgres HR/ERP data into the parallel Oracle
// HR / ERP schemas, using the dedicated `hr` and `erp` Oracle users.
// Used by both scripts/migrate-to-oracle.js and the /api/oracle/migrate route.
// (Idempotent: ensures tables exist, clears them, then re-inserts from Postgres.)
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function migrateToOracle() {
  const db = require('../models');            // HR (Postgres)
  const erpDb = require('../models/ERP');     // ERP (Postgres)
  const oracleDb = require('../models/Oracle'); // Oracle (HR/ERP connections)

  const { EmployeeMaster } = db;
  const { ItemMaster, Unit } = erpDb;
  const { LegacyHrEmployee, LegacyErpItem, sequelizeHr, sequelizeErp } = oracleDb;

  await sequelizeHr.authenticate();
  await sequelizeErp.authenticate();

  // Ensure the Oracle tables exist (created/owned by hr & erp users).
  await LegacyHrEmployee.sync();
  await LegacyErpItem.sync();

  // ── HR: employee_master → HR.LEGACY_HR_EMPLOYEES ──
  const employees = await EmployeeMaster.findAll({ attributes: [
    'empid', 'ename', 'deptname', 'cadd_email', 'created'
  ]});
  await LegacyHrEmployee.destroy({ where: {} });
  if (employees.length) {
    await LegacyHrEmployee.bulkCreate(employees.map((e) => ({
      emp_id: e.empid,
      full_name: e.ename || null,
      dept: e.deptname || null,
      email: e.cadd_email || null,
      hire_date: e.created ? e.created.toISOString().slice(0, 10) : null,
    })));
  }

  // ── ERP: ItemMaster (+ Unit) → ERP.LEGACY_ERP_ITEMS ──
  const units = await Unit.findAll({ attributes: ['id', 'short_name'] });
  const unitMap = {};
  units.forEach((u) => { unitMap[u.id] = u.short_name; });

  const items = await ItemMaster.findAll({ attributes: [
    'id', 'item_code', 'item_name', 'unit_id', 'moving_average_cost', 'standard_cost'
  ]});
  await LegacyErpItem.destroy({ where: {} });
  if (items.length) {
    await LegacyErpItem.bulkCreate(items.map((it) => ({
      item_id: it.id,
      item_code: it.item_code,
      item_name: it.item_name,
      uom: unitMap[it.unit_id] || null,
      unit_cost: parseFloat(it.moving_average_cost) ||
                 parseFloat(it.standard_cost) || 0,
    })));
  }

  await sequelizeHr.close().catch(() => {});
  await sequelizeErp.close().catch(() => {});
  await db.sequelize.close().catch(() => {});
  await erpDb.sequelize.close().catch(() => {});

  return { hr: employees.length, erp: items.length };
}

module.exports = { migrateToOracle };
