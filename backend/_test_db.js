const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env.development') });

async function test() {
  const c = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hrdb',
  });
  console.log('Connecting with:', { host: c.host, port: c.port, user: c.user, database: c.database });
  try {
    await c.connect();
    const r = await c.query('SELECT 1 AS ok');
    console.log('OK:', r.rows[0]);
    await c.end();
  } catch (e) {
    console.error('FAIL:', e.constructor.name, e.message);
    process.exit(1);
  }
}
test();
