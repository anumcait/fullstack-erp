require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.development') });
const { Sequelize } = require('sequelize');
const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, dialect: 'postgres', port: process.env.DB_PORT, logging: false
});

const statements = [
  // Rename the IR table t_ir -> ir if it exists and the new name is free.
  `DO $$ BEGIN IF to_regclass('t_ir') IS NOT NULL AND to_regclass('ir') IS NULL THEN ALTER TABLE t_ir RENAME TO ir; END IF; END $$`,
  // Rename the column grn_no -> ir_no on the ir table (if still present).
  `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'ir' AND column_name = 'grn_no') THEN ALTER TABLE ir RENAME COLUMN grn_no TO ir_no; END IF; END $$`,
  // Rename the column grn_date -> ir_date on the ir table (if still present).
  `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'ir' AND column_name = 'grn_date') THEN ALTER TABLE ir RENAME COLUMN grn_date TO ir_date; END IF; END $$`,
];

(async () => {
  try {
    for (const sql of statements) await seq.query(sql);
    console.log('OK: t_ir -> ir, grn_no -> ir_no');
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();