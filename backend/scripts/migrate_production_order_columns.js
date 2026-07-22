require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Sequelize } = require('sequelize');
(async () => {
  const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, dialect: 'postgres', port: process.env.DB_PORT || 5432, logging: false,
  });
  await seq.authenticate();
  console.log('Connected');

  const [existing] = await seq.query("SELECT column_name FROM information_schema.columns WHERE table_name='t_production_order'");
  const exist = new Set(existing.map(r => r.column_name));

  const cols = {
    payment_terms: 'VARCHAR(100)', delivery_terms: 'TEXT', currency: 'VARCHAR(10)',
    notes: 'TEXT',
    subtotal: 'DECIMAL(14,2)', discount_percent: 'DECIMAL(5,2)', discount_amount: 'DECIMAL(14,2)',
    pf_amount: 'DECIMAL(14,2)', sgst_amount: 'DECIMAL(14,2)', cgst_amount: 'DECIMAL(14,2)', igst_amount: 'DECIMAL(14,2)',
    tax_amount: 'DECIMAL(14,2)', grand_total: 'DECIMAL(14,2)',
  };

  for (const [name, def] of Object.entries(cols)) {
    if (!exist.has(name)) {
      await seq.query(`ALTER TABLE t_production_order ADD COLUMN ${name} ${def} NULL`);
      console.log(`  Added: ${name}`);
    } else {
      console.log(`  Exists: ${name}`);
    }
  }

  await seq.close();
  console.log('Done');
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
