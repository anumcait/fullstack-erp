require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Sequelize } = require('sequelize');

(async () => {
  const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, dialect: process.env.DB_DIALECT || 'postgres', port: process.env.DB_PORT || 5432, logging: false,
  });
  await seq.authenticate();
  console.log('Connected to DB');

  const columns = [
    { name: 'subject', def: 'VARCHAR(300)' },
    { name: 'reference', def: 'VARCHAR(200)' },
    { name: 'qtn_no', def: 'VARCHAR(100)' },
    { name: 'ref_date', def: 'DATE' },
    { name: 'insurance', def: 'VARCHAR(200)' },
    { name: 'inspection', def: 'VARCHAR(200)' },
    { name: 'freight', def: 'VARCHAR(200)' },
    { name: 'freight_forward', def: 'VARCHAR(200)' },
    { name: 'delivery_period', def: 'VARCHAR(100)' },
    { name: 'desp_to', def: 'VARCHAR(300)' },
    { name: 'any_other_terms', def: 'TEXT' },
  ];

  for (const col of columns) {
    const [rows] = await seq.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='t_production_order' AND column_name='${col.name.replace(/'/g, "''")}'`
    );
    if (rows.length === 0) {
      await seq.query(`ALTER TABLE t_production_order ADD COLUMN ${col.name} ${col.def} NULL`);
      console.log(`  Added column: ${col.name} (${col.def})`);
    } else {
      console.log(`  Column exists: ${col.name}`);
    }
  }

  await seq.close();
  console.log('Done — JO terms columns added');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
