// Standalone Oracle connectivity + model check (dedicated hr / erp users).
// Run:  node scripts/check-oracle.js
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  const oracleDb = require('../models/Oracle');

  console.log('Oracle models:', Object.keys(oracleDb).filter(k => k !== 'sequelizeHr' && k !== 'sequelizeErp' && k !== 'Sequelize'));

  try {
    await oracleDb.sequelizeHr.authenticate();
    console.log('✅ Oracle HR connection OK');
    await oracleDb.sequelizeErp.authenticate();
    console.log('✅ Oracle ERP connection OK');

    const { LegacyHrEmployee, LegacyErpItem } = oracleDb;
    const empCount = await LegacyHrEmployee.count().catch(() => 'n/a');
    const itemCount = await LegacyErpItem.count().catch(() => 'n/a');
    console.log(`   HR.LEGACY_HR_EMPLOYEES rows: ${empCount}`);
    console.log(`   ERP.LEGACY_ERP_ITEMS rows: ${itemCount}`);
  } catch (err) {
    console.error('❌ Oracle check failed:', err.message);
    process.exitCode = 1;
  } finally {
    await oracleDb.sequelizeHr.close().catch(() => {});
    await oracleDb.sequelizeErp.close().catch(() => {});
  }
})();
