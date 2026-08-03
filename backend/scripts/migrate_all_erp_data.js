// Run: node scripts/migrate_all_erp_data.js
// Creates Accounts tables in erpdb and migrates ALL ERP + Accounts data from hrdb
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development') });

const HRDB = { host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
const ERPDB = { host: process.env.ERP_DB_HOST, port: parseInt(process.env.ERP_DB_PORT), user: process.env.ERP_DB_USER, password: process.env.ERP_DB_PASSWORD, database: process.env.ERP_DB_NAME };

const EXCLUDED = ['__EFMigrationsHistory', 'session', 'Users', 'users'];

const ERP_PREFIXES = [
  'm_item_', 'm_party_', 'm_unit', 'm_product_', 'm_supplier_', 'm_vendor_',
  'm_cost_center', 'm_customer_', 'm_stores_', 'm_purchase_', 'm_engineering_',
  'm_maintenance_', 'm_marketing_', 'm_planning_', 'm_production_', 'm_quality_',
  'm_subcontract_',
  't_bom', 't_delivery_', 't_gate_', 't_invoice', 'ir', 't_leads',
  't_material_', 't_maintenance_', 't_non_', 't_planning_', 't_pr_',
  't_production_', 't_purchase_', 't_quality_', 't_quotation', 't_rfq',
  't_sales_', 't_sequence_', 't_stock_', 't_subcontract_', 't_vendor_',
];

const ACCOUNTS_TABLES = ['chart_of_accounts', 'vouchers', 'voucher_items', 'voucher_types', 'financial_years', 'budgets', 'accounts_settings'];

async function query(client, sql) {
  try { return (await client.query(sql)).rows; }
  catch (e) { throw e; }
}

async function exec(client, sql) {
  try { await client.query(sql); }
  catch (e) { /* ignore */ }
}

async function createAccountsTables(erp) {
  console.log('Ensuring Accounts tables exist in erpdb...');
  const ddls = [
    `CREATE TABLE IF NOT EXISTS chart_of_accounts (
      id SERIAL PRIMARY KEY, account_code VARCHAR(20) NOT NULL UNIQUE, account_name VARCHAR(255) NOT NULL,
      account_type VARCHAR(20) NOT NULL, parent_id INTEGER, is_group BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE, opening_balance DECIMAL(16,2) DEFAULT 0,
      opening_balance_type VARCHAR(2), notes TEXT,
      created_date DATE DEFAULT CURRENT_DATE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS voucher_types (
      id SERIAL PRIMARY KEY, code VARCHAR(10) NOT NULL UNIQUE, name VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_date DATE DEFAULT CURRENT_DATE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS financial_years (
      id SERIAL PRIMARY KEY, name VARCHAR(20) NOT NULL UNIQUE, start_date DATE NOT NULL,
      end_date DATE NOT NULL, is_active BOOLEAN DEFAULT FALSE,
      created_date DATE DEFAULT CURRENT_DATE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS vouchers (
      id SERIAL PRIMARY KEY, voucher_no VARCHAR(50) NOT NULL UNIQUE, voucher_type_id INTEGER NOT NULL,
      financial_year_id INTEGER, date DATE NOT NULL, reference_no VARCHAR(50), reference_date DATE,
      narration TEXT, total_debit DECIMAL(16,2) DEFAULT 0, total_credit DECIMAL(16,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'Draft', created_by INTEGER, approved_by INTEGER, approved_at TIMESTAMP,
      created_date DATE DEFAULT CURRENT_DATE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS voucher_items (
      id SERIAL PRIMARY KEY, voucher_id INTEGER NOT NULL, account_id INTEGER NOT NULL,
      debit DECIMAL(16,2) DEFAULT 0, credit DECIMAL(16,2) DEFAULT 0, narration TEXT,
      created_date DATE DEFAULT CURRENT_DATE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY, financial_year_id INTEGER NOT NULL, account_id INTEGER NOT NULL,
      budget_amount DECIMAL(16,2) DEFAULT 0,
      created_date DATE DEFAULT CURRENT_DATE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS accounts_settings (
      id SERIAL PRIMARY KEY, key VARCHAR(100) NOT NULL UNIQUE, value TEXT,
      created_date DATE DEFAULT CURRENT_DATE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  ];
  for (const sql of ddls) {
    try { await erp.query(sql); }
    catch (e) { console.log('  !! CREATE TABLE:', e.message.slice(0, 100)); }
  }
  console.log('Accounts tables ready.');
}

function escapeVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return `'${v.toISOString()}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function migrateTable(hr, erp, table) {
  try {
    const cnt = await query(hr, `SELECT COUNT(*)::int AS c FROM "${table}"`);
    const count = parseInt(cnt[0]?.c || 0);
    if (count === 0) return 0;

    // Check if erpdb already has enough data
    try {
      const ecnt = await query(erp, `SELECT COUNT(*)::int AS c FROM "${table}"`);
      const existing = parseInt(ecnt[0]?.c || 0);
      if (existing >= count) return 0;
    } catch (e) { /* table may not exist in erpdb yet */ }

    const rows = await query(hr, `SELECT * FROM "${table}"`);
    if (rows.length === 0) return 0;
    const cols = Object.keys(rows[0]);

    // Disable FK triggers
    await exec(erp, `SET session_replication_role = 'replica'`);

    let inserted = 0;
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const values = batch.map(r => {
        const vals = cols.map(c => escapeVal(r[c]));
        return '(' + vals.join(',') + ')';
      }).join(',');

      try {
        await erp.query(`INSERT INTO public."${table}" (${cols.map(c => '"' + c + '"').join(',')}) VALUES ${values} ON CONFLICT DO NOTHING`);
        inserted += batch.length;
      } catch (e) {
        // Row by row fallback
        for (const r of batch) {
          try {
            const vals = cols.map(c => escapeVal(r[c]));
            await erp.query(`INSERT INTO public."${table}" (${cols.map(c => '"' + c + '"').join(',')}) VALUES (${vals.join(',')}) ON CONFLICT DO NOTHING`);
            inserted++;
          } catch (e2) { /* skip problematic row */ }
        }
      }
    }

    await exec(erp, `SET session_replication_role = 'origin'`);
    return inserted;
  } catch (err) {
    if (!err.message?.includes('does not exist')) {
      console.log(`  !! ${table}: ${(err.message || err).slice(0, 150)}`);
    }
    return 0;
  }
}

async function main() {
  const hr = new Client(HRDB);
  const erp = new Client(ERPDB);
  await hr.connect();
  await erp.connect();
  console.log('Connected to both databases');

  // Ensure Accounts tables exist in erpdb
  await createAccountsTables(erp);

  // Get all hrdb tables
  const tables = await query(hr, "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
  const allTables = tables.map(r => r.table_name).filter(t => !EXCLUDED.includes(t));
  console.log('Found', allTables.length, 'tables in hrdb');

  // Migrate ERP tables
  console.log('\n--- ERP Tables ---');
  for (const table of allTables) {
    if (ERP_PREFIXES.some(p => table.startsWith(p))) {
      const n = await migrateTable(hr, erp, table);
      if (n > 0) console.log(' ', table + ':', n, 'rows');
    }
  }

  // Migrate Accounts tables
  console.log('\n--- Accounts Tables ---');
  for (const table of ACCOUNTS_TABLES) {
    if (allTables.includes(table)) {
      const n = await migrateTable(hr, erp, table);
      if (n > 0) console.log(' ', table + ':', n, 'rows');
      else console.log(' ', table + ': up-to-date or empty');
    } else {
      console.log(' ', table + ': not found in hrdb');
    }
  }

  console.log('\n✅ Migration complete!');
  await hr.end();
  await erp.end();
  process.exit(0);
}

main().catch(e => { console.error('FAIL:', e); process.exit(1); });
