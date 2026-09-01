// Mirror live Postgres HR/ERP data into the parallel Oracle HR / ERP schemas.
// Run:  node scripts/sync-oracle.js
const { migrateToOracle } = require('../services/oracleSync');

migrateToOracle()
  .then(({ hr, erp }) => {
    console.log(`✅ Mirrored ${hr} employees → HR.LEGACY_HR_EMPLOYEES`);
    console.log(`✅ Mirrored ${erp} items → ERP.LEGACY_ERP_ITEMS`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  });
