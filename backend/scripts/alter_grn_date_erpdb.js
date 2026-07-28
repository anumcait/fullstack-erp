require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.development') });
const { Sequelize } = require('sequelize');
const seq = new Sequelize(
  process.env.ERP_DB_NAME, process.env.ERP_DB_USER, process.env.ERP_DB_PASSWORD,
  { host: process.env.ERP_DB_HOST, dialect: process.env.ERP_DB_DIALECT || 'postgres', port: process.env.ERP_DB_PORT, logging: false }
);
seq.query("ALTER TABLE t_ir ALTER COLUMN grn_date TYPE timestamptz USING grn_date::timestamptz")
  .then(function () { console.log('erpdb: t_ir.grn_date altered to timestamptz'); process.exit(0); })
  .catch(function (err) { console.log('erpdb error: ' + err.message); process.exit(1); });
