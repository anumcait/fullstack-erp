// Run: node scripts/sync_erp_db.js
// Syncs all ERP model tables to erpdb and copies data from hrdb
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.development') });

const hrdb = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: 'postgres', port: process.env.DB_PORT, logging: false }
);

async function syncAndMigrate() {
  try {
    // Load ERP models (they now connect to erpDb)
    const db = require('../models/ERP');

    // Sync all tables
    await db.sequelize.sync({ alter: true });
    const tables = Object.keys(db.sequelize.models);
    console.log('Synced ' + tables.length + ' tables');

    // Copy data from hrdb for each table
    for (const name of tables) {
      const model = db.sequelize.models[name];
      const tableName = model.getTableName();
      try {
        const [rows] = await hrdb.query(`SELECT COUNT(*)::int AS c FROM hrdb.public."${tableName}"`);
        const count = rows[0] ? parseInt(rows[0].c || 0) : 0;
        if (count > 0) {
          const [data] = await hrdb.query(`SELECT * FROM hrdb.public."${tableName}"`);
          // Bulk insert in batches
          for (let i = 0; i < data.length; i += 100) {
            const batch = data.slice(i, i + 100);
            await model.bulkCreate(batch, { ignoreDuplicates: true, validate: false });
          }
          console.log('  ' + tableName + ': ' + count + ' rows');
        } else {
          console.log('  ' + tableName + ': 0 rows');
        }
      } catch (err) {
        console.log('  !! ' + tableName + ': ' + (err.message || err).slice(0, 120));
      }
    }

    console.log('\nDone. ERP database synced and data migrated.');
  } catch (err) {
    console.error('Failed:', err);
  } finally {
    process.exit(0);
  }
}

syncAndMigrate();
