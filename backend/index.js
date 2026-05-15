const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');
const app = require('./app');
const db = require('./models'); // import models + sequelize instance

const ENV = process.env.NODE_ENV || 'development';
dotenv.config({
  path: path.resolve(__dirname, `.env.${ENV}`)
});

const PORT = process.env.PORT || 5000;
const MAX_RETRIES = 20;   // for Sequelize connection
const RETRY_DELAY = 3000; // in ms

// Wait for DB to be ready
async function waitForDB() {
  const client = new Client({
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hrdb'
  });

  let retries = 40;
  while (retries > 0) {
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log('✅ Database is ready for queries');
      return;
    } catch (err) {
      console.log(`⏳ Waiting for database to be ready... (${retries} retries left)`);
      retries--;
      await new Promise(res => setTimeout(res, 3000));
    }
  }
  console.error('❌ Database not ready after waiting');
  process.exit(1);
}

async function startServer(retries = MAX_RETRIES) {
  await waitForDB();

  while (retries > 0) {
    try {
      await db.sequelize.authenticate();
      console.log(`✅ Connected to ${ENV} database`);

      const FORCE_SYNC = process.env.DB_SYNC_FORCE === 'true';
      const syncOptions = FORCE_SYNC ? { force: true } : (ENV === 'production' ? { force: false } : { alter: true });
      
      if (FORCE_SYNC) {
        console.warn('⚠️ WARNING: DB_SYNC_FORCE is enabled. All tables will be dropped and recreated!');
      }

      await db.sequelize.sync(syncOptions);
      console.log('✅ Database synced (tables created/updated).');

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
