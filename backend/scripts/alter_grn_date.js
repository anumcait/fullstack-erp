require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.development') });
const { Sequelize } = require('sequelize');
const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, dialect: 'postgres', port: process.env.DB_PORT, logging: false
});
seq.query("ALTER TABLE t_ir ALTER COLUMN grn_date TYPE timestamptz USING grn_date::timestamptz")
  .then(function () { console.log('Column altered to timestamptz'); process.exit(0); })
  .catch(function (err) { console.error(err.message); process.exit(1); });
