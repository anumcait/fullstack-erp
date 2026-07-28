// Run: node scripts/migrate_accounts.js
// Migrates Accounts tables from hrdb to erpdb with column mapping
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development') });

const HRDB = { host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
const ERPDB = { host: process.env.ERP_DB_HOST, port: parseInt(process.env.ERP_DB_PORT), user: process.env.ERP_DB_USER, password: process.env.ERP_DB_PASSWORD, database: process.env.ERP_DB_NAME };

async function query(client, sql) {
  return (await client.query(sql)).rows;
}

function escapeVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return "'" + v.toISOString() + "'";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

async function main() {
  const hr = new Client(HRDB);
  const erp = new Client(ERPDB);
  await hr.connect();
  await erp.connect();
  console.log('Connected');

  // Drop old erpdb Accounts tables, let Sequelize recreate them
  const dropFirst = ['voucher_items', 'budgets', 'vouchers', 'chart_of_accounts', 'voucher_types', 'financial_years', 'accounts_settings'];
  for (const t of dropFirst) {
    try { await erp.query(`DROP TABLE IF EXISTS "${t}" CASCADE`); } catch (e) {}
  }
  console.log('Dropped old Accounts tables');

  // Sync via Sequelize to create tables with correct schema
  const accountsDb = require('../models/Accounts');
  await accountsDb.sequelize.sync({ force: false });

  // Get erpdb column lists for each table
  const erpCols = {};
  for (const t of dropFirst) {
    const cols = await query(erp, `SELECT column_name FROM information_schema.columns WHERE table_name='${t}' AND table_schema='public'`);
    erpCols[t] = cols.map(c => c.column_name);
    console.log(t + ' columns:', erpCols[t].join(', '));
  }

  // Migrate each table
  const tables = ['chart_of_accounts', 'voucher_types', 'financial_years', 'vouchers', 'voucher_items', 'budgets', 'accounts_settings'];
  
  for (const table of tables) {
    try {
      const cnt = await query(hr, `SELECT COUNT(*)::int AS c FROM "${table}"`);
      const count = parseInt(cnt[0]?.c || 0);
      if (count === 0) { console.log(table + ': 0 rows in hrdb'); continue; }

      const hrdbRows = await query(hr, `SELECT * FROM "${table}"`);
      const hrdbCols = Object.keys(hrdbRows[0]);
      const targetCols = erpCols[table] || [];

      // Map hrdb column names to erpdb column names
      // Handle: createdAt->created_date, updatedAt->updated_at
      const colMap = {};
      for (const hc of hrdbCols) {
        if (targetCols.includes(hc)) {
          colMap[hc] = hc;
        } else if (hc === 'createdAt' && targetCols.includes('created_date')) {
          colMap[hc] = 'created_date';
        } else if (hc === 'updatedAt' && targetCols.includes('updated_at')) {
          colMap[hc] = 'updated_at';
        }
        // else: skip columns that don't exist in erpdb
      }

      const insertCols = Object.keys(colMap);
      if (insertCols.length === 0) { console.log(table + ': no matching columns'); continue; }

      await erp.query(`SET session_replication_role = 'replica'`);

      let inserted = 0;
      for (let i = 0; i < hrdbRows.length; i += 50) {
        const batch = hrdbRows.slice(i, i + 50);
        const valsList = batch.map(r => {
          const vals = insertCols.map(c => escapeVal(r[c]));
          return '(' + vals.join(',') + ')';
        }).join(',');

        try {
          await erp.query(`INSERT INTO public."${table}" (${insertCols.map(c => '"' + colMap[c] + '"').join(',')}) VALUES ${valsList} ON CONFLICT DO NOTHING`);
          inserted += batch.length;
        } catch (e) {
          for (const r of batch) {
            try {
              const vals = insertCols.map(c => escapeVal(r[c]));
              await erp.query(`INSERT INTO public."${table}" (${insertCols.map(c => '"' + colMap[c] + '"').join(',')}) VALUES (${vals.join(',')}) ON CONFLICT DO NOTHING`);
              inserted++;
            } catch (e2) { /* skip */ }
          }
        }
      }

      await erp.query(`SET session_replication_role = 'origin'`);
      console.log(table + ': migrated ' + inserted + '/' + count + ' rows');
    } catch (e) {
      if (!e.message?.includes('does not exist')) {
        console.log('!! ' + table + ': ' + e.message.slice(0, 120));
      }
    }
  }

  await hr.end();
  await erp.end();
  process.exit(0);
}

main().catch(e => { console.error('FAIL:', e); process.exit(1); });
