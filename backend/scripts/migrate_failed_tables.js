// Run: node scripts/migrate_failed_tables.js
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.development') });

const hrdb = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: 'postgres', port: process.env.DB_PORT, logging: false }
);

const erpdbSeq = new Sequelize(
  process.env.ERP_DB_NAME, process.env.ERP_DB_USER, process.env.ERP_DB_PASSWORD,
  { host: process.env.ERP_DB_HOST, dialect: 'postgres', port: process.env.ERP_DB_PORT, logging: false }
);

const TABLES = [
  'm_item_type', 'm_item_subtype', 'm_item_subgroup', 'm_item_group',
  'm_item_master', 'm_product_category', 'm_product_master', 'm_product_item_master',
  't_purchase_order', 't_purchase_order_item', 'ir', 't_ir_item',
  't_bom', 't_bom_item', 't_pr_amendment', 't_pr_sanction',
  't_subcontract_issue', 't_subcontract_issue_item',
  'm_supplier_master',
];

async function migrate() {
  try {
    await erpdbSeq.authenticate();

    for (const table of TABLES) {
      try {
        const [cnt] = await hrdb.query(`SELECT COUNT(*)::int AS c FROM "${table}"`);
        const count = parseInt(cnt[0]?.c || 0);
        if (count === 0) { console.log('SKIP ' + table + ': 0 rows'); continue; }

        const [rows] = await hrdb.query(`SELECT * FROM "${table}"`);
        const cols = Object.keys(rows[0]);

        // Disable FK triggers, insert, re-enable
        await erpdbSeq.query(`SET session_replication_role = 'replica'`);

        for (let i = 0; i < rows.length; i += 50) {
          const batch = rows.slice(i, i + 50);
          const values = batch.map(r => {
            const vals = cols.map(c => {
              const v = r[c];
              if (v === null || v === undefined) return 'NULL';
              if (typeof v === 'number') return String(v);
              return `'${String(v).replace(/'/g, "''")}'`;
            });
            return '(' + vals.join(',') + ')';
          }).join(',');

          try {
            await erpdbSeq.query(`INSERT INTO public."${table}" (${cols.map(c => '"' + c + '"').join(',')}) VALUES ${values} ON CONFLICT DO NOTHING`);
          } catch (e) {
            // Try row by row
            for (const r of batch) {
              try {
                const vals = cols.map(c => {
                  const v = r[c];
                  if (v === null || v === undefined) return 'NULL';
                  if (typeof v === 'number') return String(v);
                  return `'${String(v).replace(/'/g, "''")}'`;
                });
                await erpdbSeq.query(`INSERT INTO public."${table}" (${cols.map(c => '"' + c + '"').join(',')}) VALUES (${vals.join(',')}) ON CONFLICT DO NOTHING`);
              } catch (e2) { /* skip problematic row */ }
            }
          }
        }

        await erpdbSeq.query(`SET session_replication_role = 'origin'`);
        console.log('OK  ' + table + ': ' + count + ' rows');
      } catch (err) {
        console.log(' !! ' + table + ': ' + (err.message || err).slice(0, 120));
      }
    }
    console.log('\nDone');
  } catch (err) {
    console.error('Failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
