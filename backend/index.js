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

  while (retries > 0) {
    try {
      // 3. Authenticate Sequelize connection
      await db.sequelize.authenticate();
      console.log(`✅ Connected to ${ENV} database`);

      const FORCE_SYNC = process.env.DB_SYNC_FORCE === 'true';
      const syncOptions = FORCE_SYNC ? { force: true } : (ENV === 'production' ? { force: false } : { alter: true });

      if (FORCE_SYNC) {
        console.warn('⚠️ WARNING: DB_SYNC_FORCE is enabled. All tables will be dropped and recreated!');
      }

      // 4. Sync models
      await db.sequelize.sync(syncOptions);
      console.log('✅ Database synced (tables created/updated).');

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
