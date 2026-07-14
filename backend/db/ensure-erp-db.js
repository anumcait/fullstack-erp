const { Client } = require("pg");

async function ensureErpDb() {
  const erpDbName = process.env.ERP_DB_NAME || "erpdb";
  const adminConfig = {
    host: process.env.ERP_DB_HOST || process.env.DB_HOST || "localhost",
    user: process.env.ERP_DB_USER || process.env.DB_USER || "postgres",
    password: process.env.ERP_DB_PASSWORD || process.env.DB_PASSWORD || "postgres",
    database: "postgres",
    port: process.env.ERP_DB_PORT || process.env.DB_PORT || 5432,
  };

  const client = new Client(adminConfig);
  try {
    await client.connect();
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [erpDbName]
    );
    if (res.rowCount === 0) {
      console.log(`⚠️  ERP database '${erpDbName}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${erpDbName}"`);
      console.log(`✅ ERP database '${erpDbName}' created.`);
    } else {
      console.log(`✅ ERP database '${erpDbName}' exists.`);
    }
  } catch (err) {
    console.error(`❌ Failed to ensure ERP database: ${err.message}`);
    throw err;
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

module.exports = ensureErpDb;
