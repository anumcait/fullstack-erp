const { Client } = require('pg');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '.env.development') });

console.log('DB_NAME=[' + process.env.DB_NAME + ']');
console.log('DB_USER=[' + process.env.DB_USER + ']');
console.log('DB_PASSWORD=[' + process.env.DB_PASSWORD + ']');
console.log('DB_HOST=[' + process.env.DB_HOST + ']');
console.log('DB_PORT=[' + process.env.DB_PORT + ']');

async function test() {
  // Direct Client
  const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'hrdb' });
  await c.connect();
  const r1 = await c.query("SELECT current_user, current_database(), current_schema");
  console.log('Direct:', r1.rows[0]);

  const r2 = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
  console.log('Direct count:', r2.rows.length);
  await c.end();

  // Sequelize
  const s = new Sequelize(
    process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
    { host: process.env.DB_HOST, dialect: 'postgres', port: process.env.DB_PORT, logging: false }
  );
  const [r3] = await s.query("SELECT current_user, current_database(), current_schema");
  console.log('Seq:', JSON.stringify(r3[0]));

  const [tables] = await s.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name",
    { raw: true }
  );
  console.log('Seq count:', tables.length);
  if (tables.length > 0) {
    console.log('All seq results:', JSON.stringify(tables.slice(0, 10)));
  }
  await s.close();
}

test().catch(e => console.error(e));
