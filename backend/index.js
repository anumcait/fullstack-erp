const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

const ENV = process.env.NODE_ENV || 'development';
dotenv.config({
  path: path.resolve(__dirname, `.env.${ENV}`)
});

const PORT = process.env.PORT || 5000;
const MAX_RETRIES = 20;   // for Sequelize connection
const RETRY_DELAY = 3000; // in ms

const waitForDB = require("./db/wait-for-db");

async function startServer(retries = MAX_RETRIES) {
  // 1. Wait for DB hardware/network to be ready
  await waitForDB();

  // 2. Give DB a few seconds to settle before heavy migrations
  console.log("⏳ DB ready, waiting 5s for stabilization...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 3. Load app and models ONLY after DB is ready
  const app = require('./app');
  const db = require('./models');
  const erpDb = require('./models/ERP');

  while (retries > 0) {
    try {
      // 3. Authenticate Sequelize connections
      await db.sequelize.authenticate();
      console.log(`✅ Connected to ${ENV} database (HR)`);

      await erpDb.sequelize.authenticate();
      console.log(`✅ Connected to ${ENV} database (ERP)`);

      const FORCE_SYNC = process.env.DB_SYNC_FORCE === 'true';
      // Use safe sync (create missing tables only, no destructive alters).
      // `alter: true` re-adds foreign keys on every boot and fails on restored
      // data that has orphaned rows (e.g. emp_attendance). Force-sync (drop &
      // recreate) is opt-in via DB_SYNC_FORCE=true.
      const syncOptions = FORCE_SYNC ? { force: true } : { force: false };

      if (FORCE_SYNC) {
        console.warn('⚠️ WARNING: DB_SYNC_FORCE is enabled. All tables will be dropped and recreated!');
      }

      // 4. Pre-migration: drop stale defaults that block ENUM->STRING casting
      try {
        await erpDb.sequelize.query(`ALTER TABLE IF EXISTS t_material_requisition ALTER COLUMN status DROP DEFAULT`);
      } catch (_) { /* table may not exist yet */ }
      try {
        await erpDb.sequelize.query(`ALTER TABLE IF EXISTS t_material_issue ALTER COLUMN status DROP DEFAULT`);
      } catch (_) { /* table may not exist yet */ }

      // 5. Sync models (HR + ERP share the same database now)
      await db.sequelize.sync(syncOptions);
      console.log('✅ HR database synced.');

      await erpDb.sequelize.sync(syncOptions);
      console.log('✅ ERP database synced.');

      // 5. Start listening
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server running at http://localhost:${PORT}`);
      });
      break;
    } catch (error) {
      console.error(`❌ DB connection failed (${MAX_RETRIES - retries + 1}):`, error.message);
      retries--;
      if (retries === 0) {
        console.error('❌ Max retries reached. Exiting...');
        process.exit(1);
      }
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

startServer();
