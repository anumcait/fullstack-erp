const { Client } = require('pg');

async function check(db, label) {
  const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: db });
  await c.connect();
  const r = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
  console.log(label + ' tables (' + r.rows.length + '):', r.rows.map(x => x.table_name).join(', '));
  
  // Check for key data
  const tables = ['m_item_master', 'm_party_master', 't_purchase_order', 't_material_requisition', 'm_product_master', 'm_unit', 'm_item_group', 'm_item_type', 'm_item_subgroup', 'm_item_subtype', 't_bom', 't_material_requisition_item'];
  for (const t of tables) {
    try {
      const cnt = await c.query('SELECT COUNT(*) as c FROM ' + t);
      console.log('  ' + t + ': ' + cnt.rows[0].c + ' rows');
    } catch(e) {
      console.log('  ' + t + ': NOT FOUND');
    }
  }
  
  // Check Accounts tables
  const acctTables = ['ChartOfAccounts', 'Vouchers', 'VoucherTypes', 'FinancialYears', 'Budgets', 'AccountsSettings'];
  for (const t of acctTables) {
    try {
      const cnt = await c.query('SELECT COUNT(*) as c FROM "' + t + '"');
      console.log('  "' + t + '": ' + cnt.rows[0].c + ' rows');
    } catch(e) {
      // Try without quotes
      try {
        const cnt = await c.query('SELECT COUNT(*) as c FROM ' + t);
        console.log('  ' + t + ': ' + cnt.rows[0].c + ' rows');
      } catch(e2) {}
    }
  }
  
  await c.end();
}

check('erpdb', 'erpdb').then(() => check('hrdb', 'hrdb')).then(() => console.log('DONE')).catch(e => { console.error(e); process.exit(1); });
